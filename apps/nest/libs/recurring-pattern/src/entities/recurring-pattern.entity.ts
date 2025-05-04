import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { Frequency, RecurringPattern } from '@prisma/client'
import { RoomBookingEntity } from '@app/room-booking/entities/room-booking.entity'

export class RecurringPatternEntity implements RecurringPattern {
  @Expose()
  @ApiProperty()
  id: string

  @Expose()
  @ApiProperty()
  createdAt: Date

  @Expose()
  @ApiProperty()
  updatedAt: Date

  @Expose()
  @ApiProperty()
  startDate: Date

  @Expose()
  @ApiProperty()
  endDate: Date

  @Expose()
  @ApiProperty({ enum: Frequency })
  frequency: Frequency

  @Expose()
  @ApiProperty()
  interval: number

  @Expose()
  @ApiProperty()
  dowsBit: number

  @Expose()
  @ApiProperty()
  bookingId: string

  // Relations
  @ApiProperty({ type: () => RoomBookingEntity })
  @Type(() => RoomBookingEntity)
  @Expose()
  booking?: RoomBookingEntity
}
