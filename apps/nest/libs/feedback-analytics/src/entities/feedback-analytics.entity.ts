import { Expose } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class FeedbackAnalyticsEntity {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  createdAt: Date

  @ApiProperty()
  @Expose()
  updatedAt: Date

  @ApiProperty()
  @Expose()
  date: Date

  @ApiProperty()
  @Expose()
  category: string

  @ApiProperty()
  @Expose()
  sentiment: string

  @ApiProperty()
  @Expose()
  count: number

  @ApiProperty()
  @Expose()
  avgRating?: number

  @ApiProperty()
  @Expose()
  totalResponses: number
}
