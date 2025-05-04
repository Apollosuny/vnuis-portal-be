import { BadRequestException, Injectable } from '@nestjs/common'
import { uniq } from 'lodash'
import { DateTime } from 'luxon'
import { PrismaService } from 'nestjs-prisma'
import { encodeDowsBit } from './utils/endcode-dows-bit'
import { pushDowsBitBackward, pushDowsBitForward } from './utils/manipulate-dows-bit'
import { CreateTimeSlotDto, CreateTimeSlotResponseDto } from './dtos/create-time-slot.dto'
import { th } from '@app/helper'
import { RoomTimeSlotEntity } from './entities/room-time-slot.entity'

@Injectable()
export class RoomTimeSlotService {
  constructor(private readonly _prisma: PrismaService) {}

  async create(dto: CreateTimeSlotDto) {
    try {
      const { timeRange, roomId } = dto

      const timeSlotData = timeRange.map((timeSlot) => {
        const { startTime: startTimePrimitive, endTime: endTimePrimitive, dows: dowsPrimitive } = timeSlot

        const startDatePrimitive = DateTime.fromJSDate(startTimePrimitive)
        const endDatePrimitive = DateTime.fromJSDate(endTimePrimitive)

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
        data: timeSlotData,
      })

      return th.toInstanceSafe(CreateTimeSlotResponseDto, {
        success: true,
        timeSlots: timeSlotData.map((slot) => ({
          startTime: DateTime.fromFormat(slot.startTime, 'HH:mm').toJSDate(),
          endTime: DateTime.fromFormat(slot.endTime, 'HH:mm').toJSDate(),
          dows: slot.dowsBit,
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
}
