import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsOptional, IsObject, IsArray, IsNumber } from 'class-validator'
import { Prisma } from '@prisma/client'
import { IsIncludeOnlyKeys, IsIncludeOnlyValues } from '@app/helper/class.validator'

const EventFields = Object.values(Prisma.EventScalarFieldEnum)

export class QueryEventDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(EventFields)
  @Expose()
  where?: Record<string, any>

  @ApiPropertyOptional({ type: () => Map })
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(EventFields)
  @IsIncludeOnlyValues(Object.values(Prisma.SortOrder))
  @Expose()
  sort?: Record<string, string>

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(EventFields)
  @Expose()
  select?: string[]

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(['createdBy', 'registrations'])
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
