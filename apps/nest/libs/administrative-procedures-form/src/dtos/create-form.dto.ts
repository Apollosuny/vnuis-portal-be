import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsObject, IsOptional } from 'class-validator'
import { QuestionsDto } from './question.dto'
import { JsonValue } from '@prisma/client/runtime/library'

export class CreateFormDto {
  @Expose()
  @ApiProperty()
  name: string

  @Expose()
  @ApiProperty()
  slug: string

  @Expose()
  @ApiProperty()
  description: string

  @Expose()
  @ApiProperty()
  type: string

  @Expose()
  @ApiProperty()
  isActive: boolean

  @IsOptional()
  @Expose()
  @ApiProperty()
  fileUrl?: string

  @Expose()
  @ApiProperty()
  allowEditAfterSubmit: boolean

  @Expose()
  @ApiProperty()
  requireApproval: boolean

  @IsObject()
  @Type(() => QuestionsDto)
  @Expose()
  @ApiProperty()
  data: JsonValue | null
}
