import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { JsonValue } from '@prisma/client/runtime/library'
import { Expose, Type } from 'class-transformer'
import { IsObject, IsOptional } from 'class-validator'
import { QuestionsDto } from '../dtos/question.dto'

export class AdministrativeProceduresFormEntity {
  @Expose()
  @ApiProperty()
  id: string

  @IsObject()
  @Type(() => QuestionsDto)
  @Expose()
  @ApiProperty()
  data: JsonValue | null

  @Expose()
  @ApiProperty()
  name: string

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
  @ApiPropertyOptional()
  fileUrl: string | null

  @Expose()
  @ApiProperty()
  allowEditAfterSubmit: boolean

  @Expose()
  @ApiProperty()
  requiredApproval: boolean

  @Expose()
  @ApiProperty()
  metadata: Record<string, any>

  @Expose()
  @ApiProperty()
  createdByOperatorId: string
}
