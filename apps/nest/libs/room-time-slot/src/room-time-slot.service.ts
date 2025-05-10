import { BadRequestException, Injectable, Inject, forwardRef } from '@nestjs/common'
import { uniq } from 'lodash'
import { DateTime } from 'luxon'
import { PrismaService } from 'nestjs-prisma'
import { encodeDowsBit } from './utils/endcode-dows-bit'
import { pushDowsBitBackward, pushDowsBitForward } from './utils/manipulate-dows-bit'
import { CreateTimeSlotDto, CreateTimeSlotResponseDto } from './dtos/create-time-slot.dto'
import { th } from '@app/helper'
import { RoomTimeSlotEntity } from './entities/room-time-slot.entity'
import { decodeDowsBit } from './utils/decode-dows-bit'
import { circularShiftLeft, circularShiftRight } from './utils/circular-shift'
import { RoomBookingService } from '@app/room-booking'
import { AvailableTimeRangeResDto } from './dtos/available-time-range-res.dto'

@Injectable()
export class RoomTimeSlotService {
  constructor(
    private readonly _prisma: PrismaService,
    @Inject(forwardRef(() => RoomBookingService))
    private readonly _roomBookingService: RoomBookingService,
  ) {}

  async findAvailableTimeSlots(roomId: string) {
    const timeSlots = await this._prisma.roomTimeSlot.findMany({
      where: {
        roomId,
      },
    })
    return th.toInstancesSafe(RoomTimeSlotEntity, timeSlots)
  }

  async getAvailableTimeByDate(roomId: string, datePrimitiveString: string, offsetPrimitive: string) {
    const freeRanges = await this._roomBookingService.getRoomAvailableTimeSlots(
      datePrimitiveString,
      roomId,
      offsetPrimitive,
    )

    return th.toInstancesSafe(AvailableTimeRangeResDto, freeRanges)
  }

  async create(dto: CreateTimeSlotDto) {
    try {
      const { timeRange, roomId } = dto

      const timeSlotData = timeRange.map((timeSlot) => {
        const { startTime: startTimePrimitive, endTime: endTimePrimitive, dows: dowsPrimitive } = timeSlot

        const startDatePrimitive = DateTime.fromISO(startTimePrimitive)
        const endDatePrimitive = DateTime.fromISO(endTimePrimitive)

        // Convert start and end times to UTC
        const { startTime, endTime, dowsBit } = this.calculateUtcTimeData(
          startDatePrimitive,
          endDatePrimitive,
          dowsPrimitive,
        )

        return {
          startTime,
          endTime,
          dowsBit,
          roomId,
        }
      })

      await this._prisma.roomTimeSlot.createMany({
        data: timeSlotData.map((slot) => ({
          ...slot,
          startTime: DateTime.fromFormat(slot.startTime, 'HH:mm').toISO(),
          endTime: DateTime.fromFormat(slot.endTime, 'HH:mm').toISO(),
        })),
      })

      return th.toInstanceSafe(CreateTimeSlotResponseDto, {
        success: true,
        timeSlots: timeSlotData.map((slot) => ({
          startTime: DateTime.fromFormat(slot.startTime, 'HH:mm').toJSDate(),
          endTime: DateTime.fromFormat(slot.endTime, 'HH:mm').toJSDate(),
          dows: decodeDowsBit(slot.dowsBit),
        })),
      })
    } catch (error) {
      throw new BadRequestException('Error creating time slot')
    }
  }

  // Must be ensure that the available time slot is in the same timezone and the same date
  private calculateUtcTimeData(startDatePrimitive: DateTime, endDatePrimitive: DateTime, dowsPrimitive: string[]) {
    // Convert start and end dates to UTC
    const startDate = startDatePrimitive.toUTC()
    const endDate = endDatePrimitive.toUTC()

    // Check if UTC date is after or before the primitive date
    const isUtcAfter = startDate.toISODate() > startDatePrimitive.toISODate()
    const isUtcBefore = endDate.toISODate() < endDatePrimitive.toISODate()

    // Normalize and encode days of the week
    const dows = uniq(dowsPrimitive).map((dow) => dow.toLowerCase())
    const bitPrimitive = encodeDowsBit(dows)

    // Adjust dowsBit based on UTC offset
    const dowsBit = isUtcAfter
      ? pushDowsBitForward(bitPrimitive)
      : isUtcBefore
        ? pushDowsBitBackward(bitPrimitive)
        : bitPrimitive

    const startTime = startDate.toFormat('HH:mm')
    const endTime = endDate.toFormat('HH:mm')

    return {
      startTime,
      endTime,
      dowsBit,
    }
  }

  deserializeTimeSlotRecord(record: RoomTimeSlotEntity, now: DateTime, offset?: number) {
    now = now.toUTC()

    // Parse start and end times
    const startHours = DateTime.fromJSDate(record.startTime).toUTC().hour
    const startMinutes = DateTime.fromJSDate(record.startTime).toUTC().minute
    const endHours = DateTime.fromJSDate(record.endTime).toUTC().hour
    const endMinutes = DateTime.fromJSDate(record.endTime).toUTC().minute

    // Create DateTime
    // Create DateTime objects for start and end times
    const startTime = now.set({ hour: startHours, minute: startMinutes })
    const endTime = now.set({ hour: endHours, minute: endMinutes })

    // Decode the days of week from the bit representation
    const bitPrimitive = record.dowsBit
    const dowsUtc = uniq([...decodeDowsBit(bitPrimitive)])

    const startHour = startTime.toFormat('HH:mm')
    const endHour = endTime.toFormat('HH:mm')

    // Initialize offset values
    let dowsOffset = dowsUtc
    let startHourOffset = startHour
    let endHourOffset = endHour

    // Adjust for time offset if provided
    if (offset !== 0) {
      const timeOffset = startTime.plus({ minutes: offset })
      const offsetStartOfDay = timeOffset.startOf('day')
      const utcStartOfDay = startTime.startOf('day')

      // Adjust the days of week bit if the offset crosses a day boundary
      let bits = bitPrimitive
      if (offsetStartOfDay > utcStartOfDay) {
        bits = circularShiftLeft(bits, 1)
      } else if (offsetStartOfDay < utcStartOfDay) {
        bits = circularShiftRight(bits, 1)
      }
      dowsOffset = decodeDowsBit(bits)

      // Adjust start and end times for the offset
      startHourOffset = timeOffset.toFormat('HH:mm')
      endHourOffset = endTime.plus({ minutes: offset }).toFormat('HH:mm')
    }

    // Return the deserialized and adjusted booking time record
    return {
      id: record.id,
      startTime: startTime.set({ second: 0, millisecond: 0 }),
      endTime: endTime.set({ second: 0, millisecond: 0 }),
      startHour: startHour,
      endHour: endHour,
      dowsUtc: dowsUtc,
      dowsOffset: dowsOffset,
      startHourOffset,
      endHourOffset,
    }
  }
}
