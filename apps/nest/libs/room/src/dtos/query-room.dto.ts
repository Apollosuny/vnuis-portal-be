import { IsIncludeOnlyKeys, IsIncludeOnlyValues } from '@app/helper/class.validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Prisma } from '@prisma/client'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsNumber, IsObject, IsOptional } from 'class-validator'

const RoomFields = Object.values(Prisma.RoomScalarFieldEnum)

export class QueryRoomDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(RoomFields)
  @Expose()
  where?: Record<string, any>

  @ApiPropertyOptional({ type: () => Map })
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(RoomFields)
  @IsIncludeOnlyValues(Object.values(Prisma.SortOrder))
  @Expose()
  sort?: Record<string, string>

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(RoomFields)
  @Expose()
  select?: string[]

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(['timeSlots', 'bookings'])
  @Expose()
  include?: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Expose()
  skip?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Expose()
  take?: number
}
