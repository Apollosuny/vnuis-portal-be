import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { StudentEntity } from '@app/student/entities/student.entity'
import { OperatorEntity } from '@app/operator/entities/operator.entity'
import { FeedbackResponseEntity } from '@app/feedback-response'

export class FeedbackEntity {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  createdAt: Date

  @ApiProperty()
  @Expose()
  updatedAt: Date

  @ApiProperty()
  @Expose()
  title: string

  @ApiProperty()
  @Expose()
  content: string

  @ApiProperty()
  @Expose()
  category: string

  @ApiProperty()
  @Expose()
  rating?: number

  @ApiProperty()
  @Expose()
  sentiment?: string

  @ApiProperty()
  @Expose()
  confidence?: number

  @ApiProperty({ type: () => [String] })
  @Expose()
  keywords: string[]

  @ApiProperty()
  @Expose()
  aiAnalysis?: any

  @ApiProperty()
  @Expose()
  status: string

  @ApiProperty()
  @Expose()
  reviewedAt?: Date

  @ApiProperty()
  @Expose()
  reviewedBy?: string

  @ApiProperty()
  @Expose()
  metadata?: any

  @ApiProperty()
  @Expose()
  studentId: string

  @ApiProperty()
  @Expose()
  reviewedByOperatorId?: string

  // Relations
  @ApiProperty({ type: () => StudentEntity })
  @Type(() => StudentEntity)
  @Expose()
  student: StudentEntity

  @ApiProperty({ type: () => OperatorEntity })
  @Type(() => OperatorEntity)
  @Expose()
  reviewedByOperator?: OperatorEntity

  @ApiProperty({ type: () => [FeedbackResponseEntity] })
  @Type(() => FeedbackResponseEntity)
  @Expose()
  responses: FeedbackResponseEntity[]
}
