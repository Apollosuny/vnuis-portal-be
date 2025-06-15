import { UserEntity } from '@app/user/entities/user.entity'
import {
  BadRequestException,
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateRoomBookingDto } from './dtos/create-room-booking.dto'
import { UpdateRoomBookingDto } from './dtos/update-room-booking.dto'
import { HandleRoomBookingDto } from './dtos/handle-room-booking.dto'
import { FilterRoomBookingDto } from './dtos/filter-room-booking.dto'
import { PaginationDto } from './dtos/pagination.dto'
import { RoomService } from '@app/room'
import { DateTime } from 'luxon'
import { buildDateTimePrimitiveFromOffset } from '@app/room-time-slot/dtos/datetime-primitive-from-iso-offset'
import { RoomBookingStatus, Role } from '@prisma/client'
import { RoomTimeSlotService } from '@app/room-time-slot'
import { groupAndConsolidateBookingTimes } from '@app/room-time-slot/utils/group-and-consolidate-booking-times'
import { TimeRange } from '@app/room-time-slot/utils/consolidate-time-range'
import { calculateFreeTimeRanges, Range } from '@app/room-time-slot/utils/calculate-free-time-range'
import { checkTimeSlotAvailability } from '@app/room-time-slot/utils/check-time-slot-availability'
import { th } from '@app/helper'
import { RoomBookingEntity } from './entities/room-booking.entity'
import { GetBookingsResDto } from './dtos/get-bookings-res.dto'

@Injectable()
export class RoomBookingService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly _roomService: RoomService,
    @Inject(forwardRef(() => RoomTimeSlotService))
    private readonly _roomTimeSlotService: RoomTimeSlotService,
  ) {}

  async create(user: UserEntity, dto: CreateRoomBookingDto) {
    const { startTime, duration, purpose, isRecurring, roomId, offset: offsetPrimitive } = dto

    const room = await this._roomService.getRoom(roomId)

    if (!room) {
      throw new BadRequestException('Room not found')
    }

    const startTimePrimitive = DateTime.fromISO(startTime)

    console.log('startTimePrimitive', startTimePrimitive.toISO())

    const endTimePrimitive = startTimePrimitive.plus({ hours: duration })

    const maxEndTimePrimitive = startTimePrimitive.startOf('day').plus({ days: 1 })
    if (endTimePrimitive > maxEndTimePrimitive) {
      throw new BadRequestException('End time exceeds the maximum allowed duration of 24 hours')
    }

    const freeRangesPrimitiveOffset = await this.getRoomAvailableTimeSlots(
      startTimePrimitive.toISO(),
      roomId,
      offsetPrimitive,
    )

    // Check if the requested time range is within available ranges
    const isTimeSlotAvailable = checkTimeSlotAvailability(
      startTimePrimitive,
      endTimePrimitive,
      freeRangesPrimitiveOffset,
    )

    if (!isTimeSlotAvailable) {
      throw new BadRequestException('Requested time slot is not available')
    }

    const newBooking = await this._prisma.roomBooking.create({
      data: {
        startTime: startTimePrimitive.toJSDate(),
        endTime: endTimePrimitive.toJSDate(),
        duration,
        purpose,
        isRecurring: isRecurring,
        status: RoomBookingStatus.PENDING,
        roomId,
        studentId: user.student.id,
      },
    })

    return th.toInstanceSafe(RoomBookingEntity, newBooking)
  }

  async getRoomAvailableTimeSlots(
    datePrimitiveString: string,
    roomId: string,
    offsetPrimitive: string,
  ): Promise<Range[]> {
    const now = DateTime.now()

    // Parse the offset, ensure it's a number
    const parseOffsetMinutes = offsetPrimitive ? parseInt(offsetPrimitive, 10) : 0

    // Parse the date string and apply timezone offset
    const fromTimePrimitive = DateTime.fromISO(datePrimitiveString, {
      zone: 'utc',
    })
      .plus({ minutes: parseOffsetMinutes })
      .startOf('day')

    const toTimePrimitive = fromTimePrimitive.endOf('day')

    const overlappedBookings = await this.getOverlapRoomBookings(
      fromTimePrimitive,
      toTimePrimitive,
      roomId,
      RoomBookingStatus.APPROVED,
    )

    const availableTimeSlots = await this._roomTimeSlotService.findAvailableTimeSlots(roomId)

    const deserializeTimeSlotRecords = availableTimeSlots.map((slot) =>
      this._roomTimeSlotService.deserializeTimeSlotRecord(slot, now, parseOffsetMinutes),
    )

    const grouppedMap = groupAndConsolidateBookingTimes(
      deserializeTimeSlotRecords.map((r) => ({
        dows: r.dowsOffset,
        startTime: r.startHourOffset,
        endTime: r.endHourOffset,
      })),
    )

    // Add null check for weekdayShort
    // Ensure we get the correct weekday in lowercase
    const weekdayKey = fromTimePrimitive?.weekdayShort?.toLowerCase() || 'mon'

    // Get the available time ranges for the requested day
    const possibleTimeRanges = grouppedMap[weekdayKey] || []

    // Map overlapped bookings to time ranges
    const overlappedTimeRanges = overlappedBookings.map((s) => {
      try {
        const sTimePrimitive = buildDateTimePrimitiveFromOffset({
          base: DateTime.fromJSDate(new Date(s.startTime)),
          offset: parseOffsetMinutes,
        })
        const eTimePrimitive = buildDateTimePrimitiveFromOffset({
          base: DateTime.fromJSDate(new Date(s.endTime)),
          offset: parseOffsetMinutes,
        })
        return {
          startTime: sTimePrimitive.isValid ? sTimePrimitive.toFormat('HH:mm') : '00:00',
          endTime: eTimePrimitive.isValid ? eTimePrimitive.toFormat('HH:mm') : '23:59',
          isCrossDay:
            sTimePrimitive.isValid && eTimePrimitive.isValid
              ? sTimePrimitive.startOf('day') < eTimePrimitive.startOf('day')
              : false,
        } as TimeRange
      } catch (error) {
        console.error('Error processing time primitives:', error)
        // Return default values when there's an error
        return {
          startTime: '00:00',
          endTime: '23:59',
          isCrossDay: false,
        } as TimeRange
      }
    })

    const freeRanges = calculateFreeTimeRanges({
      possibleTimeRanges: [
        ...possibleTimeRanges.map((r) => ({
          startHour: r.startTime,
          endHour: r.endTime,
        })),
      ],
      overlapped: overlappedTimeRanges.map((r) => ({
        startHour: r.startTime,
        endHour: r.endTime,
      })),
    })

    console.log(possibleTimeRanges, overlappedTimeRanges)

    return freeRanges
  }

  async getOverlapRoomBookings(from: DateTime, to: DateTime, roomId: string, status?: RoomBookingStatus) {
    // Handle potentially invalid DateTime objects
    const validFrom = from && from.isValid ? from : DateTime.now()
    const validTo = to && to.isValid ? to : DateTime.now().plus({ days: 1 })

    return await this._prisma.roomBooking.findMany({
      where: {
        roomId,
        ...(status ? { status } : {}),
        AND: [
          {
            startTime: {
              gte: validFrom.startOf('day').toUTC().toJSDate(),
            },
            endTime: {
              lt: validTo.endOf('day').toUTC().toJSDate(),
            },
          },
          {
            OR: [
              {
                startTime: {
                  gte: validFrom.startOf('day').toUTC().toJSDate(),
                  lt: validTo.startOf('day').toUTC().toJSDate(),
                },
              },
              {
                endTime: {
                  gt: validFrom.startOf('day').toUTC().toJSDate(),
                  lte: validTo.endOf('day').toUTC().toJSDate(),
                },
              },
              {
                startTime: {
                  lte: validFrom.startOf('day').toUTC().toJSDate(),
                },
                endTime: {
                  gte: validTo.endOf('day').toUTC().toJSDate(),
                },
              },
            ],
          },
        ],
      },
    })
  }

  async findAll(filter?: FilterRoomBookingDto, pagination?: PaginationDto) {
    const { page = 1, limit = 10 } = pagination || {}
    const { roomId, studentId, status, startDate, endDate, search } = filter || {}

    console.log('Pagination in service:', { page, limit })
    console.log('Filter params:', { roomId, studentId, status, startDate, endDate, search })

    const where: any = {}

    if (roomId) {
      where.roomId = roomId
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (status) {
      where.status = status
    }

    // Filter by date range
    if (startDate || endDate) {
      where.AND = []

      if (startDate) {
        where.AND.push({
          startTime: {
            gte: new Date(startDate),
          },
        })
      }

      if (endDate) {
        where.AND.push({
          endTime: {
            lte: new Date(endDate),
          },
        })
      }
    }

    // Search in purpose field
    if (search) {
      where.purpose = {
        contains: search,
        mode: 'insensitive',
      }
    }

    // Ensure page and limit are numbers
    const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page
    const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit

    // Validate pagination params
    const validPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage
    const validLimit = isNaN(parsedLimit) || parsedLimit < 1 ? 10 : parsedLimit

    console.log('Validated pagination:', { page: validPage, limit: validLimit })

    const total = await this._prisma.roomBooking.count({ where })
    console.log('Total records found:', total)

    const skip = (validPage - 1) * validLimit
    console.log('Skip value:', skip)

    const bookings = await this._prisma.roomBooking.findMany({
      where,
      skip: skip,
      take: validLimit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        room: true,
        student: {
          include: {
            user: true,
          },
        },
        handleBy: true,
        recurringPattern: true,
      },
    })

    console.log(`Found ${bookings.length} bookings for page ${validPage}`)

    // Calculate total pages properly
    const totalPages = validLimit > 0 ? Math.ceil(total / validLimit) : 0
    console.log('Total pages calculated:', totalPages)

    const response = {
      data: bookings.map((booking) => th.toInstanceSafe(RoomBookingEntity, booking)),
      meta: {
        total,
        page: validPage,
        limit: validLimit,
        totalPages: totalPages,
      },
    }

    console.log('Response metadata:', response.meta)
    return th.toInstanceSafe(GetBookingsResDto, response)
  }

  async findOne(id: string): Promise<RoomBookingEntity> {
    // Validate UUID format before querying
    if (typeof id === 'string' && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new NotFoundException('Invalid booking ID format')
    }

    try {
      const booking = await this._prisma.roomBooking.findUnique({
        where: { id },
        include: {
          room: true,
          student: true,
          handleBy: true,
          recurringPattern: true,
        },
      })

      if (!booking) {
        throw new NotFoundException('Room booking not found')
      }

      return th.toInstanceSafe(RoomBookingEntity, booking)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      console.error(`Error finding room booking with id ${id}:`, error)
      throw new BadRequestException(`Failed to retrieve room booking: ${error.message}`)
    }
  }

  async findByStudent(studentId: string, pagination?: PaginationDto) {
    return this.findAll({ studentId }, pagination)
  }

  async update(id: string, user: UserEntity, dto: UpdateRoomBookingDto): Promise<RoomBookingEntity> {
    try {
      const booking = await this.findOne(id)

      // Only the student who created the booking can update it
      if (booking.studentId !== user.student.id && user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
        throw new ForbiddenException('You are not allowed to update this booking')
      }

      // Can't update approved or rejected bookings
      if (
        booking.status === RoomBookingStatus.APPROVED ||
        booking.status === RoomBookingStatus.REJECTED ||
        booking.status === RoomBookingStatus.COMPLETED
      ) {
        throw new BadRequestException(`Cannot update booking with status ${booking.status}`)
      }

      const { startTime, duration, purpose, isRecurring, attendees, offset: offsetPrimitive } = dto
      const updateData: any = {}

      // Update basic fields
      if (purpose !== undefined) {
        updateData.purpose = purpose
      }

      if (isRecurring !== undefined) {
        updateData.isRecurring = isRecurring
      }

      if (attendees !== undefined) {
        updateData.attendees = attendees
      }

      // Handle time update if needed
      if (startTime !== undefined && duration !== undefined) {
        const startTimePrimitive = DateTime.fromJSDate(startTime)
        const endTimePrimitive = startTimePrimitive.plus({ hours: duration })

        const maxEndTimePrimitive = startTimePrimitive.startOf('day').plus({ days: 1 })
        if (endTimePrimitive > maxEndTimePrimitive) {
          throw new BadRequestException('End time exceeds the maximum allowed duration of 24 hours')
        }

        const freeRangesPrimitiveOffset = await this.getRoomAvailableTimeSlots(
          startTimePrimitive.toISO(),
          booking.roomId,
          offsetPrimitive,
        )

        // Check if the requested time range is within available ranges
        const isTimeSlotAvailable = checkTimeSlotAvailability(
          startTimePrimitive,
          endTimePrimitive,
          freeRangesPrimitiveOffset,
        )

        if (!isTimeSlotAvailable) {
          throw new BadRequestException('Requested time slot is not available')
        }

        updateData.startTime = startTimePrimitive.toJSDate()
        updateData.endTime = endTimePrimitive.toJSDate()
        updateData.duration = duration
      }

      const updatedBooking = await this._prisma.roomBooking.update({
        where: { id },
        data: updateData,
        include: {
          room: true,
          student: true,
          handleBy: true,
          recurringPattern: true,
        },
      })

      return th.toInstanceSafe(RoomBookingEntity, updatedBooking)
    } catch (error) {
      console.log(`Error updating booking with id ${id}:`, error)
    }
  }

  async remove(id: string, user: UserEntity): Promise<RoomBookingEntity> {
    const booking = await this.findOne(id)

    // Only the student who created the booking or an admin can delete it
    if (booking.studentId !== user.student.id && user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('You are not allowed to delete this booking')
    }

    // Can't delete approved or completed bookings
    if (booking.status === RoomBookingStatus.APPROVED || booking.status === RoomBookingStatus.COMPLETED) {
      throw new BadRequestException(`Cannot delete booking with status ${booking.status}`)
    }

    const deletedBooking = await this._prisma.roomBooking.update({
      where: { id },
      data: {
        status: RoomBookingStatus.CANCELLED,
      },
      include: {
        room: true,
        student: true,
        handleBy: true,
        recurringPattern: true,
      },
    })

    return th.toInstanceSafe(RoomBookingEntity, deletedBooking)
  }

  async handle(id: string, user: UserEntity, dto: HandleRoomBookingDto): Promise<RoomBookingEntity> {
    const booking = await this.findOne(id)

    // Only admin/operator can handle bookings
    if (user.role !== Role.ADMIN && user.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('You are not allowed to handle bookings')
    }

    // Can't handle cancelled bookings
    if (booking.status === RoomBookingStatus.CANCELLED) {
      throw new BadRequestException('Cannot handle a cancelled booking')
    }

    const updatedBooking = await this._prisma.roomBooking.update({
      where: { id },
      data: {
        status: dto.status,
        remarks: dto.remarks,
        handleAt: new Date(),
        handleByOperatorId: user.operator.id,
      },
      include: {
        room: true,
        student: true,
        handleBy: true,
        recurringPattern: true,
      },
    })

    return th.toInstanceSafe(RoomBookingEntity, updatedBooking)
  }
}
