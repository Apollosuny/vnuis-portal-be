import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString } from 'class-validator'

export class ProcessMessageDto {
  @IsString()
  @Expose()
  @ApiProperty()
  message: string
}
