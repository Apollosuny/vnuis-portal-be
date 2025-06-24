import { IsIncludeOnlyKeys, IsIncludeOnlyValues } from '@app/helper/class.validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Expose, Transform, Type } from 'class-transformer'
import { IsOptional, IsJSON, IsNumber, IsObject, ValidateNested, IsArray, IsDateString } from 'class-validator'

const FeedbackAnalyticsFields = [
  'id',
  'createdAt',
  'updatedAt',
  'date',
  'category',
  'sentiment',
  'count',
  'avgRating',
  'totalResponses',
]

export class QueryFeedbackAnalyticsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(FeedbackAnalyticsFields)
  @Expose()
  where?: Record<string, any>

  @ApiPropertyOptional({ type: () => Map })
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(FeedbackAnalyticsFields)
  @IsIncludeOnlyValues(Object.values(Prisma.SortOrder))
  @Expose()
  sort?: Record<string, string>

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(FeedbackAnalyticsFields)
  @Expose()
  select?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Expose()
  skip?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Expose()
  take?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Expose()
  startDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  @Expose()
  endDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  category?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Expose()
  sentiment?: string
}
