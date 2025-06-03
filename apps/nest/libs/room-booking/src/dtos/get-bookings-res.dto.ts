import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { RoomBookingEntity } from '../entities/room-booking.entity'

export class Metadata {
  @Expose()
  @ApiProperty()
  total: number

  @Expose()
  @ApiProperty()
  page: number

  @Expose()
  @ApiProperty()
  limit: number

  @Expose()
  @ApiProperty()
  totalPages: number
}

export class GetBookingsResDto {
  @Type(() => RoomBookingEntity)
  @Expose()
  @ApiProperty()
  data: RoomBookingEntity[]

  @Type(() => Metadata)
  @Expose()
  @ApiProperty()
  meta: Metadata
}
