import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsString, IsEmail, IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator'

export class UpdateStudentDto {
  @ApiPropertyOptional({ description: 'Student ID', example: 'STU20250001' })
  @IsOptional()
  @IsString()
  studentId?: string

  @ApiPropertyOptional({ description: 'First name', example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string

  @ApiPropertyOptional({ description: 'Last name', example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string

  @ApiPropertyOptional({ description: 'Email address', example: 'john.doe@student.edu' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ description: 'Date of birth', example: '2000-01-15' })
  @IsOptional()
  @IsDateString()
  dob?: string

  @ApiPropertyOptional({ description: 'Enrollment year', example: 2025 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  @Max(3000)
  enrollYear?: number

  @ApiPropertyOptional({ description: 'Major/Field of study', example: 'Computer Science' })
  @IsOptional()
  @IsString()
  major?: string

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: 'Address', example: '123 Main St, City, State' })
  @IsOptional()
  @IsString()
  address?: string
}
