import { Expose, Type } from 'class-transformer'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OperatorEntity } from '@app/operator/entities/operator.entity'
import { EventRegistrationEntity } from './event-registration.entity'

export class EventEntity {
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
  name: string

  @ApiProperty()
  @Expose()
  description: string

  @ApiProperty()
  @Expose()
  startTime: Date

  @ApiProperty()
  @Expose()
  endTime: Date

  @ApiProperty()
  @Expose()
  location: string

  @ApiProperty()
  @Expose()
  capacity: number

  @ApiProperty()
  @Expose()
  isPublished: boolean

  @ApiPropertyOptional()
  @Expose()
  imageUrl?: string

  @ApiPropertyOptional()
  @Expose()
  category?: string

  @ApiPropertyOptional()
  @Expose()
  registrationDeadline?: Date

  @ApiProperty()
  @Expose()
  requireApproval: boolean

  @ApiPropertyOptional()
  @Expose()
  metadata?: Record<string, any>

  @ApiProperty()
  @Expose()
  createdByOperatorId: string

  // Relations
  @ApiProperty({ type: () => OperatorEntity })
  @Type(() => OperatorEntity)
  @Expose()
  createdBy: OperatorEntity

  @ApiProperty({ type: () => [EventRegistrationEntity] })
  @Type(() => EventRegistrationEntity)
  @Expose()
  registrations: EventRegistrationEntity[]
}
