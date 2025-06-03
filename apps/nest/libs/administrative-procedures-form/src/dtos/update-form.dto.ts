import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { JsonValue } from '@prisma/client/runtime/library'

export class UpdateFormDto {
  @IsOptional()
  @Expose()
  @ApiProperty()
  name?: string

  @IsOptional()
  @Expose()
  @ApiProperty()
  slug?: string

  @IsOptional()
  @Expose()
  @ApiProperty()
  description?: string

  @IsOptional()
  @Expose()
  @ApiProperty()
  type?: string

  @IsOptional()
  @Expose()
  @ApiProperty()
  isActive?: boolean

  @IsOptional()
  @Expose()
  @ApiProperty()
  fileUrl?: string

  @IsOptional()
  @Expose()
  @ApiProperty()
  allowEditAfterSubmit?: boolean

  @IsOptional()
  @Expose()
  @ApiProperty()
  requireApproval?: boolean

  @IsOptional()
  @Expose()
  @ApiProperty()
  data?: JsonValue

  @IsOptional()
  @Expose()
  @ApiProperty()
  metadata?: JsonValue
}
