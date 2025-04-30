import { OperatorEntity } from '@app/operator/entities/operator.entity'
import { StudentEntity } from '@app/student/entities/student.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Role, User } from '@prisma/client'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsEnum } from 'class-validator'

export class UserEntity implements User {
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
  username: string

  @Exclude()
  password: string

  @Exclude()
  jwtValidFrom: Date

  @Exclude()
  lastLoginAt: Date

  @Expose()
  @ApiProperty()
  blocked: boolean

  @IsEnum(Role)
  @Expose()
  @ApiProperty()
  role: Role
}
