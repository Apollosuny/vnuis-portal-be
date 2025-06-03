import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { RoomBookingStatus } from '@prisma/client'

export class HandleRoomBookingDto {
  @IsNotEmpty()
  @IsEnum(RoomBookingStatus)
  @Expose()
  @ApiProperty({ enum: RoomBookingStatus })
  status: RoomBookingStatus

  @IsOptional()
  @IsString()
  @Expose()
  @ApiProperty({ required: false })
  remarks?: string
}
