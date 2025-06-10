import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsString, IsEmail, IsInt, IsDateString, IsOptional, Min, Max } from 'class-validator'

export class CreateStudentDto {
  @ApiProperty({ description: 'Student ID', example: 'STU20250001' })
  @IsString()
  studentId: string

  @ApiProperty({ description: 'First name', example: 'John' })
  @IsString()
  firstName: string

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @IsString()
  lastName: string

  @ApiProperty({ description: 'Email address', example: 'john.doe@student.edu' })
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Date of birth', example: '2000-01-15' })
  @IsDateString()
  dob: string

  @ApiProperty({ description: 'Enrollment year', example: 2025 })
  @IsInt()
  @Min(1900)
  @Max(3000)
  enrollYear: number

  @ApiProperty({ description: 'Major/Field of study', example: 'Computer Science' })
  @IsString()
  major: string

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
