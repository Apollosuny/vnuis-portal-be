import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, Min, Max } from 'class-validator'

export enum FeedbackCategory {
  GENERAL = 'GENERAL',
  USER_EXPERIENCE = 'USER_EXPERIENCE',
  FUNCTIONALITY = 'FUNCTIONALITY',
  PERFORMANCE = 'PERFORMANCE',
  DESIGN = 'DESIGN',
  CONTENT = 'CONTENT',
  TECHNICAL_ISSUE = 'TECHNICAL_ISSUE',
  SUGGESTION = 'SUGGESTION',
  COMPLAINT = 'COMPLAINT',
  COMPLIMENT = 'COMPLIMENT',
}

export class CreateFeedbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  title: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  content: string

  @ApiProperty({ enum: FeedbackCategory })
  @IsEnum(FeedbackCategory)
  @Expose()
  category: FeedbackCategory

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  @Expose()
  rating?: number
}
