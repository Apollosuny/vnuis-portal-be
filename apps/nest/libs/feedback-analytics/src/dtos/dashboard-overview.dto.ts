import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class DashboardOverviewDto {
  @ApiProperty()
  @Expose()
  totalFeedbacks: number

  @ApiProperty()
  @Expose()
  totalResponses: number

  @ApiProperty()
  @Expose()
  avgRating: number

  @ApiProperty({ type: Object })
  @Expose()
  sentimentDistribution: any

  @ApiProperty({ type: Array })
  @Expose()
  categoryDistribution: any[]

  @ApiProperty({ type: Array })
  @Expose()
  recentTrends: any[]
}
