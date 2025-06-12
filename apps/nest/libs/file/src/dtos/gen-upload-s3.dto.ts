import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsMimeType, IsNotEmpty, IsString, Validate } from 'class-validator'
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
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(FileType)
  fileType: FileType
}
