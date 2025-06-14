import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class NotificationStatsResDto {
  @ApiProperty()
  @Expose()
  total: number

  @ApiProperty()
  @Expose()
  draft: number

  @ApiProperty()
  @Expose()
  scheduled: number

  @ApiProperty()
  @Expose()
  sent: number

  @ApiProperty()
  @Expose()
  revoked: number

  @ApiProperty()
  @Expose()
  readRate: number
}
