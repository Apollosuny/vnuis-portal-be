import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Operator } from '@prisma/client'
import { Expose } from 'class-transformer'

export class OperatorEntity implements Operator {
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
  @ApiPropertyOptional()
  phone: string | null

  @Expose()
  @ApiProperty()
  userId: string
}
