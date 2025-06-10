import { Expose, Type } from 'class-transformer'
import { StudentEntity } from '../entities/student.entity'
import { ApiProperty } from '@nestjs/swagger'

class Metadata {
  @Expose()
  @ApiProperty()
  total: number

  @Expose()
  @ApiProperty()
  page: number

  @Expose()
  @ApiProperty()
  limit: number

  @Expose()
  @ApiProperty()
  totalPages: number
}

export class GetStudentListResDto {
  @Type(() => StudentEntity)
  @Expose()
  @ApiProperty()
  items: StudentEntity[]

  @Type(() => Metadata)
  @Expose()
  @ApiProperty()
  meta: Metadata
}
