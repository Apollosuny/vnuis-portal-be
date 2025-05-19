import { Expose, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { EventEntity } from './event.entity'
import { StudentEntity } from '@app/student/entities/student.entity'
import { OperatorEntity } from '@app/operator/entities/operator.entity'

export class EventRegistrationEntity {
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
  status: string

  @ApiPropertyOptional()
  @Expose()
  handleAt?: Date

  @ApiPropertyOptional()
  @Expose()
  remarks?: string

  @ApiPropertyOptional()
  @Expose()
  additionalInfo?: Record<string, any>

  @ApiProperty()
  @Expose()
  eventId: string

  @ApiProperty()
  @Expose()
  studentId: string

  @ApiPropertyOptional()
  @Expose()
  handleByOperatorId?: string

  // Relations
  @ApiProperty({ type: () => EventEntity })
  @Type(() => EventEntity)
  @Expose()
  event: EventEntity

  @ApiProperty({ type: () => StudentEntity })
  @Type(() => StudentEntity)
  @Expose()
  student: StudentEntity

  @ApiPropertyOptional({ type: () => OperatorEntity })
  @Type(() => OperatorEntity)
  @Expose()
  handleBy?: OperatorEntity
}
