import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { AdministrativeProceduresFormEntity } from '@app/administrative-procedures-form/entities/administrative-procedures-form.entity'
import { FormSubmissionStatus } from '@prisma/client'
import { StudentEntity } from '@app/student/entities/student.entity'

export class AdministrativeProceduresFormSubmissionEntity {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  formId: string

  @ApiProperty()
  @Expose()
  studentId: string

  @ApiProperty({ enum: FormSubmissionStatus, default: FormSubmissionStatus.PENDING })
  @Expose()
  status: FormSubmissionStatus

  @ApiProperty()
  @Expose()
  result: Record<string, any>

  @ApiProperty()
  @Expose()
  createdAt: Date

  @ApiProperty()
  @Expose()
  updatedAt: Date

  @ApiPropertyOptional()
  @Expose()
  handleAt: Date | null

  @ApiPropertyOptional()
  @Expose()
  remarks: string | null

  @ApiPropertyOptional()
  @Expose()
  handleByOperatorId: string | null

  // Relations
  @ApiProperty({ type: () => AdministrativeProceduresFormEntity })
  @Expose()
  @Type(() => AdministrativeProceduresFormEntity)
  form?: AdministrativeProceduresFormEntity

  @ApiProperty({ type: () => StudentEntity })
  @Expose()
  @Type(() => StudentEntity)
  student?: StudentEntity
}
