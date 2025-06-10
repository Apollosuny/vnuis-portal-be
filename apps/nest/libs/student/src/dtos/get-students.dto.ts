import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsInt, IsUUID, Min, Max } from 'class-validator'
import { Transform } from 'class-transformer'

export class GetStudentsDto {
  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10

  @ApiPropertyOptional({ description: 'Search term for name, email, or student ID' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ description: 'Filter by major' })
  @IsOptional()
  @IsString()
  major?: string

  @ApiPropertyOptional({ description: 'Filter by enrollment year' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  enrollYear?: number
}

export class GetStudentByIdDto {
  @ApiPropertyOptional({ description: 'Student UUID' })
  @IsUUID()
  id: string
}
