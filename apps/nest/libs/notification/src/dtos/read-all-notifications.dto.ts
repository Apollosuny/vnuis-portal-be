import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsOptional, IsString } from 'class-validator'

export class ReadAllNotificationsDto {
  @ApiProperty({
    description: 'Notification IDs to mark as read',
    type: [String],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[]
}
