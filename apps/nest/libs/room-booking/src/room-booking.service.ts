import { UserEntity } from '@app/user/entities/user.entity'
import { BadRequestException, Injectable, Inject, forwardRef } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateRoomBookingDto } from './dtos/create-room-booking.dto'
import { RoomService } from '@app/room'
import { DateTime } from 'luxon'
import {
  buildDateTimePrimitiveFromIsoOffset,
  buildDateTimePrimitiveFromOffset,
} from '@app/room-time-slot/dtos/datetime-primitive-from-iso-offset'
import { RoomBookingStatus } from '@prisma/client'
import { RoomTimeSlotService } from '@app/room-time-slot'
import { groupAndConsolidateBookingTimes } from '@app/room-time-slot/utils/group-and-consolidate-booking-times'
import { TimeRange } from '@app/room-time-slot/utils/consolidate-time-range'
import { calculateFreeTimeRanges, Range } from '@app/room-time-slot/utils/calculate-free-time-range'
import { checkTimeSlotAvailability } from '@app/room-time-slot/utils/check-time-slot-availability'
import { th } from '@app/helper'
import { RoomBookingEntity } from './entities/room-booking.entity'

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

    const startTimePrimitive = DateTime.fromJSDate(startTime)
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
        studentId: user.id,
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

    const parseOffsetMinutes = offsetPrimitive ? parseInt(offsetPrimitive, 10) : 0

    const fromTimePrimitive = buildDateTimePrimitiveFromIsoOffset({
      isoString: datePrimitiveString,
      offset: parseOffsetMinutes,
    }).startOf('day')

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

    const possibleTimeRanges = grouppedMap[fromTimePrimitive.weekdayShort!.toLowerCase()] ?? []
    const overlappedTimeRanges = overlappedBookings.map((s) => {
      const sTimePrimitive = buildDateTimePrimitiveFromOffset({
        base: DateTime.fromJSDate(new Date(s.startTime)),
        offset: parseOffsetMinutes,
      })
      const eTimePrimitive = buildDateTimePrimitiveFromOffset({
        base: DateTime.fromJSDate(new Date(s.endTime)),
        offset: parseOffsetMinutes,
      })
      return {
        startTime: sTimePrimitive.toFormat('HH:mm'),
        endTime: eTimePrimitive.toFormat('HH:mm'),
        isCrossDay: sTimePrimitive.startOf('day') < eTimePrimitive.startOf('day'),
      } as TimeRange
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
    return await this._prisma.roomBooking.findMany({
      where: {
        roomId,
        ...(status ? { status } : {}),
        AND: [
          {
            startTime: {
              gte: from.startOf('day').toUTC().toJSDate(),
            },
            endTime: {
              lt: to.endOf('day').toUTC().toJSDate(),
            },
          },
          {
            OR: [
              {
                startTime: {
                  gte: from.startOf('day').toUTC().toJSDate(),
                  lt: to.startOf('day').toUTC().toJSDate(),
                },
              },
              {
                endTime: {
                  gt: from.startOf('day').toUTC().toJSDate(),
                  lte: to.endOf('day').toUTC().toJSDate(),
                },
              },
              {
                startTime: {
                  lte: from.startOf('day').toUTC().toJSDate(),
                },
                endTime: {
                  gte: to.endOf('day').toUTC().toJSDate(),
                },
              },
            ],
          },
        ],
      },
    })
  }
}
