import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator'

export class RegisterEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  eventId: string

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @Expose()
  additionalInfo?: Record<string, any>
}
