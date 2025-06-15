import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { CacheTTL } from '@nestjs/cache-manager'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'
import { CurUser } from '@app/core/decorators/user.decorator'
import { User } from '@prisma/client'
import { RawQuery } from '@app/core/decorators/query.decorator'
import { NotificationService } from './notification.service'
import { NotificationEntity } from './entities/notification.entity'
import {
  CreateNotificationDto,
  UpdateNotificationDto,
  QueryNotificationDto,
  NotificationStatsResDto,
  ReadAllNotificationsDto,
} from './dtos'
import { ExposeAll } from '@app/core/decorators/expose-all.decorator'
import { UserEntity } from '@app/user/entities/user.entity'

@ApiTags('notifications')
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getNotifications(@RawQuery() queryNotificationDto: QueryNotificationDto) {
    return this.notificationService.getNotifications(queryNotificationDto)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  getMyNotifications(@CurUser() user: UserEntity, @RawQuery() queryNotificationDto: QueryNotificationDto) {
    return this.notificationService.getNotificationsByUser(user, queryNotificationDto)
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationStatsResDto })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  @ExposeAll()
  getNotificationStats() {
    return this.notificationService.getNotificationStats()
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `notification-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  getNotification(@Param('id') id: string) {
    return this.notificationService.getNotification(id)
  }

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  createNotification(@Body() createNotificationDto: CreateNotificationDto, @CurUser() user: User) {
    return this.notificationService.createNotification(createNotificationDto, user)
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  updateNotification(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @CurUser() user: User,
  ) {
    return this.notificationService.updateNotification(id, updateNotificationDto, user)
  }

  @Post(':id/send')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  sendNotification(@Param('id') id: string, @CurUser() user: User) {
    return this.notificationService.sendNotification(id, user)
  }

  @Post(':id/revoke')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  revokeNotification(@Param('id') id: string, @CurUser() user: User) {
    return this.notificationService.revokeNotification(id, user)
  }

  @Post('read-all')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity, isArray: true })
  @UseGuards(JwtGuard)
  markAllAsRead(@CurUser() user: UserEntity, @Body() body: ReadAllNotificationsDto) {
    return this.notificationService.markAllAsRead(user, body?.ids)
  }

  @Post(':id/read')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  markAsRead(@Param('id') id: string, @CurUser() user: UserEntity) {
    return this.notificationService.markAsRead(id, user)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => NotificationEntity })
  @UseGuards(JwtGuard)
  deleteNotification(@Param('id') id: string, @CurUser() user: User) {
    return this.notificationService.deleteNotification(id, user)
  }
}
