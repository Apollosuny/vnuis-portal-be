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

        // Extract HH:MM from any format
        const getTimeString = (time: string): string => {
          if (!time) return ''
          // If it's a full ISO date string, extract just the time part
          if (time.includes('T')) {
            const parts = time.split('T')[1]?.split('.')
            if (parts && parts.length > 0) {
              return parts[0].substring(0, 5)
            }
          }
          // If it's already in HH:MM format
          if (time.match(/^\d{1,2}:\d{2}$/)) {
            return time
          }
          // Default to empty if can't parse
          return ''
        }

        const startTimeStr = getTimeString(startTimePrimitive)
        const endTimeStr = getTimeString(endTimePrimitive)

        // Normalize and encode days of the week
        const dows = uniq(dowsPrimitive).map((dow) => dow.toLowerCase())
        const dowsBit = encodeDowsBit(dows)

        return {
          startTime: startTimeStr,
          endTime: endTimeStr,
          dowsBit,
          roomId,
        }
      })

      // Create reference date objects for database storage with today's date in UTC
      // but with the specified times
      const today = new Date()

      // Save time slots in database
      await this._prisma.roomTimeSlot.createMany({
        data: timeSlotData.map((slot) => {
          const [startHour, startMinute] = slot.startTime.split(':').map(Number)
          const [endHour, endMinute] = slot.endTime.split(':').map(Number)

          // Create dates in UTC
          const startDate = new Date(
            Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), startHour, startMinute, 0, 0),
          )

          const endDate = new Date(
            Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), endHour, endMinute, 0, 0),
          )

          return {
            ...slot,
            startTime: startDate,
            endTime: endDate,
          }
        }),
      })

      return th.toInstanceSafe(CreateTimeSlotResponseDto, {
        success: true,
        timeSlots: timeSlotData.map((slot) => ({
          startTime: slot.startTime,
          endTime: slot.endTime,
          dows: decodeDowsBit(slot.dowsBit),
        })),
      })
    } catch (error) {
      console.error('Error creating time slot:', error)
      throw new BadRequestException('Error creating time slot')
    }
  }

  deserializeTimeSlotRecord(record: RoomTimeSlotEntity, now: DateTime, offset?: number) {
    // Function to extract time string from Date object
    const getTimeString = (date: Date | null): string => {
      if (!date) return ''
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      return `${hours}:${minutes}`
    }

    // Handle dates
    const startTime = record.startTime instanceof Date ? record.startTime : new Date(record.startTime)
    const endTime = record.endTime instanceof Date ? record.endTime : new Date(record.endTime)

    // Get time parts
    const startHours = startTime.getHours()
    const startMinutes = startTime.getMinutes()
    const endHours = endTime.getHours()
    const endMinutes = endTime.getMinutes()

    // Create DateTime objects for today with these time values
    const todayWithStartTime = now.set({ hour: startHours, minute: startMinutes, second: 0, millisecond: 0 })
    const todayWithEndTime = now.set({ hour: endHours, minute: endMinutes, second: 0, millisecond: 0 })

    // Get simple time strings
    const startHour = getTimeString(startTime)
    const endHour = getTimeString(endTime)

    // Decode the days of week
    const dowsUtc = decodeDowsBit(record.dowsBit)

    // Initialize offset values
    let dowsOffset = dowsUtc
    let startHourOffset = startHour
    let endHourOffset = endHour

    // Adjust for time offset if provided
    if (offset && offset !== 0) {
      const timeOffset = todayWithStartTime.plus({ minutes: offset })
      const offsetStartOfDay = timeOffset.startOf('day')
      const utcStartOfDay = todayWithStartTime.startOf('day')

      // Adjust the days of week bit if the offset crosses a day boundary
      let bits = record.dowsBit
      if (offsetStartOfDay > utcStartOfDay) {
        bits = circularShiftLeft(bits, 1)
      } else if (offsetStartOfDay < utcStartOfDay) {
        bits = circularShiftRight(bits, 1)
      }
      dowsOffset = decodeDowsBit(bits)

      // Adjust start and end times for the offset
      startHourOffset = timeOffset.toFormat('HH:mm')
      endHourOffset = todayWithEndTime.plus({ minutes: offset }).toFormat('HH:mm')
    }

    // Return the deserialized and adjusted booking time record
    return {
      id: record.id,
      startTime: todayWithStartTime,
      endTime: todayWithEndTime,
      startHour,
      endHour,
      dowsUtc,
      dowsOffset,
      startHourOffset,
      endHourOffset,
    }
  }
}
