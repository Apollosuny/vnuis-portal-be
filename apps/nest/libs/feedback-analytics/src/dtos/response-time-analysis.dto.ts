import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class ResponseTimeAnalysisDto {
  @ApiProperty()
  @Expose()
  averageResponseTime: number

  @ApiProperty({ type: Object })
  @Expose()
  responseTimeDistribution: any

  @ApiProperty()
  @Expose()
  totalResponded: number
}
