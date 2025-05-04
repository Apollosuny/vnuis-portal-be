import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class TimeSlotRangeDto {
  @Expose()
  @ApiProperty()
  startTime: Date

  @Expose()
  @ApiProperty()
  endTime: Date

  @Expose()
  @ApiProperty()
  dows: string[]
}
