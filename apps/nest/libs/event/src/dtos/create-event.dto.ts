import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString, IsObject } from 'class-validator'

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  description: string

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  @Expose()
  startTime: string

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  @Expose()
  endTime: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  location: string

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Expose()
  capacity: number

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Expose()
  isPublished?: boolean

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose()
  imageUrl?: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose()
  category?: string

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  @Expose()
  registrationDeadline?: string

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Expose()
  requireApproval?: boolean

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  @Expose()
  metadata?: Record<string, any>
}
