import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsOptional, IsObject, IsArray, IsNumber } from 'class-validator'
import { Prisma } from '@prisma/client'
import { IsIncludeOnlyKeys, IsIncludeOnlyValues } from '@app/helper/class.validator'

const EventRegistrationFields = Object.values(Prisma.EventRegistrationScalarFieldEnum)

export class QueryEventRegistrationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(EventRegistrationFields)
  @Expose()
  where?: Record<string, any>

  @ApiPropertyOptional({ type: () => Map })
  @IsOptional()
  @IsObject()
  @IsIncludeOnlyKeys(EventRegistrationFields)
  @IsIncludeOnlyValues(Object.values(Prisma.SortOrder))
  @Expose()
  sort?: Record<string, string>

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(EventRegistrationFields)
  @Expose()
  select?: string[]

  @ApiPropertyOptional({ type: () => String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIncludeOnlyKeys(['event', 'student', 'handleBy'])
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
