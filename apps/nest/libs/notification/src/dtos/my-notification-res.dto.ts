import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { NotificationEntity } from '../entities/notification.entity'

export class MyNotificationResDto {
  @Type(() => NotificationEntity)
  @Expose()
  @ApiProperty()
  data: NotificationEntity[]

  @Expose()
  @ApiProperty()
  total: number

  @Expose()
  @ApiProperty()
  totalPages: number

  @Expose()
  @ApiProperty()
  currentPage: number

  @Expose()
  @ApiProperty()
  pageSize: number
}
