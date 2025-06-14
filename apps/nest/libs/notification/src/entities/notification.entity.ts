import { Expose, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { UserEntity } from '@app/user/entities/user.entity'
import { NotificationType, NotificationPriority, NotificationStatus, NotificationTargetType } from '@prisma/client'

export class NotificationEntity {
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

  @ApiProperty({ enum: NotificationType })
  @Expose()
  type: NotificationType

  @ApiProperty({ enum: NotificationPriority })
  @Expose()
  priority: NotificationPriority

  @ApiProperty({ enum: NotificationStatus })
  @Expose()
  status: NotificationStatus

  @ApiProperty({ enum: NotificationTargetType })
  @Expose()
  targetType: NotificationTargetType

  @ApiProperty({ type: [String] })
  @Expose()
  targetIds: string[]

  @ApiProperty({ required: false })
  @Expose()
  scheduledAt?: Date

  @ApiProperty({ required: false })
  @Expose()
  sentAt?: Date

  @ApiProperty({ required: false })
  @Expose()
  revokedAt?: Date

  @ApiProperty({ type: [String] })
  @Expose()
  readBy: string[]

  @ApiProperty({ required: false })
  @Expose()
  metadata?: Record<string, any>

  @ApiProperty()
  @Expose()
  createdById: string

  // Relations
  @ApiProperty({ type: () => UserEntity })
  @Type(() => UserEntity)
  @Expose()
  createdBy: UserEntity
}
