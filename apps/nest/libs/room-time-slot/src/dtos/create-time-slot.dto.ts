import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty } from 'class-validator'
import { TimeSlotRangeDto } from './time-slot-range.dto'

export class CreateTimeSlotDto {
  @IsArray()
  @IsNotEmpty()
  @Expose()
  @Type(() => TimeSlotRangeDto)
  @ApiProperty({ type: [TimeSlotRangeDto] })
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
  @Type(() => TimeSlotRangeDto)
  @ApiProperty({ type: [TimeSlotRangeDto] })
  timeSlots: TimeSlotRangeDto[]
}
