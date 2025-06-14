import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString, IsEnum, IsArray, IsObject } from 'class-validator'
import { NotificationType, NotificationPriority, NotificationTargetType } from '@prisma/client'

export class CreateNotificationDto {
  @ApiProperty({ description: 'The notification title' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  title: string

  @ApiProperty({ description: 'The notification content' })
  @IsString()
  @IsNotEmpty()
  @Expose()
  content: string

  @ApiProperty({
    description: 'The notification type',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  @Expose()
  type: NotificationType

  @ApiProperty({
    description: 'The notification priority',
    enum: NotificationPriority,
  })
  @IsEnum(NotificationPriority)
  @IsNotEmpty()
  @Expose()
  priority: NotificationPriority

  @ApiProperty({
    description: 'The target audience type',
    enum: NotificationTargetType,
  })
  @IsEnum(NotificationTargetType)
  @IsNotEmpty()
  @Expose()
  targetType: NotificationTargetType

  @ApiPropertyOptional({
    description: 'Array of target IDs (student IDs, class IDs, etc.)',
    type: [String],
  })
  @IsArray()
  @IsOptional()
  @Expose()
  targetIds?: string[]

  @ApiPropertyOptional({
    description: 'When the notification should be sent',
  })
  @IsOptional()
  @Expose()
  scheduledAt?: Date

  @ApiPropertyOptional({
    description: 'Additional metadata for the notification',
    type: 'object',
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  @Expose()
  metadata?: Record<string, any>
}
