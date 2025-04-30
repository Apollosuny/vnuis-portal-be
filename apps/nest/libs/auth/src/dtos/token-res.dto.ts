import { OperatorEntity } from '@app/operator/entities/operator.entity'
import { StudentEntity } from '@app/student/entities/student.entity'
import { UserEntity } from '@app/user/entities/user.entity'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator'

export class TokenResDto {
  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  readonly jwt: string

  @IsString()
  @IsNotEmpty()
  @Expose()
  @ApiProperty()
  readonly jwtRefresh: string

  @IsNotEmptyObject()
  @Type(() => UserEntity)
  @Expose()
  @ApiProperty({ type: UserEntity })
  readonly user: UserEntity
}

export class OperatorTokenResDto extends TokenResDto {
  @IsNotEmptyObject()
  @Type(() => OperatorEntity)
  @Expose()
  @ApiProperty({ type: OperatorEntity })
  readonly operator: OperatorEntity
}

export class StudentTokenResDto extends TokenResDto {
  @IsNotEmptyObject()
  @Type(() => StudentEntity)
  @Expose()
  @ApiProperty({ type: StudentEntity })
  readonly student: StudentEntity
}
