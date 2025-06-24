import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { OperatorEntity } from '@app/operator/entities/operator.entity'

export class FeedbackResponseEntity {
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
  content: string

  @ApiProperty()
  @Expose()
  isInternal: boolean

  @ApiProperty()
  @Expose()
  feedbackId: string

  @ApiProperty()
  @Expose()
  operatorId: string

  // Relations
  @ApiProperty({ type: () => OperatorEntity })
  @Type(() => OperatorEntity)
  @Expose()
  operator: OperatorEntity
}
