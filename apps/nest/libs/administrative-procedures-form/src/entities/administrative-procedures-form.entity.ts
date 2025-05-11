import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsObject, IsOptional } from 'class-validator'

export class AdministrativeProceduresFormEntity {
  @Expose()
  @ApiProperty()
  id: string

  @IsObject()
  @Expose()
  @ApiProperty()
  data: Record<string, any>

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
