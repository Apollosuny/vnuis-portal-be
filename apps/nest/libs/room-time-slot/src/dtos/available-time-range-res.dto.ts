import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class AvailableTimeRangeResDto {
  @Expose()
  @ApiProperty()
  startHour: string

  @Expose()
  @ApiProperty()
  endHour: string
}
