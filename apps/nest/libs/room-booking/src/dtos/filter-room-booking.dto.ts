import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator'
import { RoomBookingStatus } from '@prisma/client'

export class FilterRoomBookingDto {
  @IsOptional()
  @IsString()
  @Expose()
  @ApiProperty({ required: false })
  roomId?: string

  @IsOptional()
  @IsString()
  @Expose()
  @ApiProperty({ required: false })
  studentId?: string

  @IsOptional()
  @IsEnum(RoomBookingStatus)
  @Expose()
  @ApiProperty({ enum: RoomBookingStatus, required: false })
  status?: RoomBookingStatus

  @IsOptional()
  @IsDateString()
  @Expose()
  @ApiProperty({ required: false })
  startDate?: string

  @IsOptional()
  @IsDateString()
  @Expose()
  @ApiProperty({ required: false })
  endDate?: string

  @IsOptional()
  @IsString()
  @Expose()
  @ApiProperty({ required: false })
  search?: string
}
