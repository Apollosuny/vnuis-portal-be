import { IsIncludeOnlyKeys, IsIncludeOnlyValues } from '@app/helper/class.validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Expose, Transform, Type } from 'class-transformer'
import { IsOptional, IsJSON, IsNumber, IsObject, ValidateNested, IsArray } from 'class-validator'

const FeedbackFields = [
  'id',
  'createdAt',
  'updatedAt',
  'title',
  'content',
  'category',
  'rating',
  'sentiment',
  'confidence',
  'keywords',
  'aiAnalysis',
  'status',
  'reviewedAt',
  'reviewedBy',
  'metadata',
  'studentId',
  'reviewedByOperatorId',
]

export class QueryFeedbackDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(FeedbackFields)
  @Expose()
  where?: Record<string, any>

  @ApiPropertyOptional({ type: () => Map })
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(FeedbackFields)
  @IsIncludeOnlyValues(Object.values(Prisma.SortOrder))
  @Expose()
  sort?: Record<string, string>

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(FeedbackFields)
  @Expose()
  select?: string[]

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(['student', 'reviewedByOperator', 'responses'])
  @Expose()
  include?: string[]

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
}
