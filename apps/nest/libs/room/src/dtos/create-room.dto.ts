import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { RoomType } from '@prisma/client'

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  name: string

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Expose()
  description?: string

  @ApiProperty()
  @IsInt()
  @Min(10)
  @Expose()
  capacity: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  location: string

  @ApiProperty({ enum: RoomType })
  @IsEnum(RoomType)
  @Expose()
  type: RoomType

  @ApiProperty()
  @IsOptional()
  @Expose()
  isAvailable?: boolean
}
