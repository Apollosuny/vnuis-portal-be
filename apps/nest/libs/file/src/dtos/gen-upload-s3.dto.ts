import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsEnum, IsMimeType, IsNotEmpty, IsObject, IsOptional, IsString, Validate } from 'class-validator'
import { FileType } from '../models/file.type'
import { IsFileNameConstraint } from '@app/helper'

export class GenUploadS3Dto {
  @Expose()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Validate(IsFileNameConstraint)
  fileName: string

  @Expose()
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsMimeType()
  contentType: string

  @Expose()
  @ApiProperty({ enum: FileType })
  @IsNotEmpty()
  @IsEnum(FileType)
  fileType: FileType

  @Expose()
  @ApiPropertyOptional({ description: 'Additional metadata for the file, such as formId for admin forms' })
  @IsOptional()
  @IsObject()
  @Type(() => Object)
  metadata?: Record<string, any>
}
