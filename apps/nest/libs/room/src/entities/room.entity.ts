import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type, Transform } from 'class-transformer'
import { Room, RoomType } from '@prisma/client'
import { RoomTimeSlotEntity } from '@app/room-time-slot/entities/room-time-slot.entity'
import { RoomBookingEntity } from '@app/room-booking/entities/room-booking.entity'

export class RoomEntity implements Room {
  @Expose()
  @ApiProperty()
  roomId: string

  @Expose()
  @ApiProperty()
  name: string

  @Expose()
  @ApiProperty({ required: false })
  description: string | null

  @Expose()
  @ApiProperty()
  capacity: number

  @Expose()
  @ApiProperty()
  location: string

  @Expose()
  @ApiProperty({ enum: RoomType })
  type: RoomType

  @Expose()
  @ApiProperty({ description: 'Readable room type' })
  @Transform(({ obj }) => {
    switch (obj.type) {
      case RoomType.CLASSROOM:
        return 'Classroom'
      case RoomType.LAB:
        return 'Laboratory'
      case RoomType.EVENT:
        return 'Event Hall'
      default:
        return obj.type
    }
  })
  get typeLabel(): string {
    switch (this.type) {
      case RoomType.CLASSROOM:
        return 'Classroom'
      case RoomType.LAB:
        return 'Laboratory'
      case RoomType.EVENT:
        return 'Event Hall'
      default:
        return this.type
    }
  }

  @Expose()
  @ApiProperty()
  isAvailable: boolean

  @Expose()
  @ApiProperty()
  createdAt: Date

  @Expose()
  @ApiProperty()
  updatedAt: Date

  // Relations
  @ApiProperty({ type: () => RoomTimeSlotEntity, isArray: true })
  @Type(() => RoomTimeSlotEntity)
  @Expose()
  timeSlots?: RoomTimeSlotEntity[]

  @Expose()
  @ApiProperty({ description: 'Total number of time slots' })
  @Transform(({ obj }) => obj.timeSlots?.length || 0)
  get timeSlotsCount(): number {
    return this.timeSlots?.length || 0
  }

  @ApiProperty({ type: () => RoomBookingEntity, isArray: true })
  @Type(() => RoomBookingEntity)
  @Expose()
  bookings?: RoomBookingEntity[]

  @Expose()
  @ApiProperty({ description: 'Total number of bookings' })
  @Transform(({ obj }) => obj.bookings?.length || 0)
  get bookingsCount(): number {
    return this.bookings?.length || 0
  }
}
