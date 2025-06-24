import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsString, IsBoolean } from 'class-validator'

export class CreateFeedbackResponseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  content: string

  @ApiProperty()
  @IsBoolean()
  @Expose()
  isInternal: boolean
}
