import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator'
import { TimeSlotRangeDto } from './time-slot-range.dto'

export class CreateTimeSlotDto {
  @IsArray()
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  timeRange: TimeSlotRangeDto[]

  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  roomId: string
}

export class CreateTimeSlotResponseDto {
  @IsBoolean()
  @Expose()
  @ApiProperty()
  success: boolean

  @IsArray()
  @Expose()
  @ApiProperty()
  timeSlots: TimeSlotRangeDto[]
}
