import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator'

export class UpdateRegistrationStatusDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @IsIn(['APPROVED', 'REJECTED', 'CANCELLED', 'ATTENDED'])
  @Expose()
  status: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose()
  remarks?: string
}
