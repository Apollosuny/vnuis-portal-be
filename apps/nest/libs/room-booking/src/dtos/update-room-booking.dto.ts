import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator'

export class UpdateRoomBookingDto {
  @IsOptional()
  @Expose()
  @ApiProperty()
  startTime?: Date

  @IsOptional()
  @IsNumber()
  @Expose()
  @ApiProperty()
  duration?: number

  @IsOptional()
  @IsString()
  @Expose()
  @ApiProperty()
  purpose?: string

  @IsOptional()
  @IsBoolean()
  @Expose()
  @ApiProperty()
  isRecurring?: boolean

  @IsOptional()
  @IsNumber()
  @Expose()
  @ApiProperty()
  attendees?: number

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  offset: string
}
