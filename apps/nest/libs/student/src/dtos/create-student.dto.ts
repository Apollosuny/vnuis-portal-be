import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsString, IsEmail, IsInt, IsDateString, IsOptional, Min, Max, MinLength } from 'class-validator'

export class CreateStudentDto {
  @ApiProperty({ description: 'Username for login', example: 'john.doe' })
  @Expose()
  @IsString()
  @MinLength(3)
  username: string

  @ApiProperty({ description: 'Password for login', example: 'password123' })
  @Expose()
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ description: 'Student ID', example: 'STU20250001' })
  @Expose()
  @IsString()
  studentId: string

  @ApiProperty({ description: 'First name', example: 'John' })
  @Expose()
  @IsString()
  firstName: string

  @ApiProperty({ description: 'Last name', example: 'Doe' })
  @Expose()
  @IsString()
  lastName: string

  @ApiProperty({ description: 'Email address', example: 'john.doe@student.edu' })
  @Expose()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'Date of birth', example: '2000-01-15' })
  @Expose()
  @IsDateString()
  dob: string

  @ApiProperty({ description: 'Enrollment year', example: 2025 })
  @Expose()
  @IsInt()
  @Min(1900)
  @Max(3000)
  enrollYear: number

  @ApiProperty({ description: 'Major/Field of study', example: 'Computer Science' })
  @Expose()
  @IsString()
  major: string

  @ApiPropertyOptional({ description: 'Avatar URL', example: 'https://example.com/avatar.jpg' })
  @Expose()
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiPropertyOptional({ description: 'Phone number', example: '+1234567890' })
  @Expose()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ description: 'Address', example: '123 Main St, City, State' })
  @Expose()
  @IsOptional()
  @IsString()
  address?: string
}
