import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
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

  @ApiProperty({ type: () => RoomBookingEntity, isArray: true })
  @Type(() => RoomBookingEntity)
  @Expose()
  bookings?: RoomBookingEntity[]
}
