import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateRoomBookingDto {
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  startTime: Date

  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  duration: number

  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  purpose: string

  @IsOptional()
  @Expose()
  @ApiProperty()
  isRecurring: boolean

  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  roomId: string

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  offset: string
}
