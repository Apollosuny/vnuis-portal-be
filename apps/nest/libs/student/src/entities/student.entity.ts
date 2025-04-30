import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Student } from '@prisma/client'
import { Expose } from 'class-transformer'

export class StudentEntity implements Student {
  @Expose()
  @ApiProperty()
  id: string

  @Expose()
  @ApiProperty()
  createdAt: Date

  @Expose()
  @ApiProperty()
  updatedAt: Date

  @Expose()
  @ApiProperty()
  studentId: string

  @Expose()
  @ApiProperty()
  firstName: string

  @Expose()
  @ApiProperty()
  lastName: string

  @Expose()
  @ApiPropertyOptional()
  avatarUrl: string | null

  @Expose()
  @ApiProperty()
  email: string

  @Expose()
  @ApiProperty()
  dob: Date

  @Expose()
  @ApiProperty()
  enrollYear: number

  @Expose()
  @ApiProperty()
  major: string

  @Expose()
  @ApiPropertyOptional()
  phone: string | null

  @Expose()
  @ApiPropertyOptional()
  address: string | null

  @Expose()
  @ApiProperty()
  userId: string
}
