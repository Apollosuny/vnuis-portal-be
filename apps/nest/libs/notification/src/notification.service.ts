import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { NotificationStatus, User } from '@prisma/client'
import { CreateNotificationDto, QueryNotificationDto, UpdateNotificationDto } from './dtos'
import { th } from '@app/helper/transform.helper'
import { NotificationEntity } from './entities/notification.entity'

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async getNotifications(queryNotificationDto: QueryNotificationDto) {
    const { select, include } = queryNotificationDto

    let queryOptions: any = {
      where: queryNotificationDto.where,
      orderBy: queryNotificationDto.sort,
      take: queryNotificationDto.take,
      skip: queryNotificationDto.skip,
    }

    if (select && select.length > 0) {
      queryOptions.select = Object.fromEntries(select.map((key) => [key, true]))
    } else if (include && include.length > 0) {
      queryOptions.include = Object.fromEntries(include.map((key) => [key, true]))
    } else {
      queryOptions.include = { createdBy: true }
    }

    const notifications = await this.prisma.notification.findMany(queryOptions)
    return th.toInstancesSafe(NotificationEntity, notifications)
  }

  async getNotification(id: string) {
    const notification = await this.prisma.notification.findUniqueOrThrow({
      where: { id },
      include: { createdBy: true },
    })
    return th.toInstanceSafe(NotificationEntity, notification)
  }

  async createNotification(dto: CreateNotificationDto, user: User) {
    const notification = await this.prisma.notification.create({
      data: {
        ...dto,
        createdById: user.id,
        status: dto.scheduledAt ? NotificationStatus.SCHEDULED : NotificationStatus.DRAFT,
      },
      include: { createdBy: true },
    })
    return th.toInstanceSafe(NotificationEntity, notification)
  }

  async updateNotification(id: string, dto: UpdateNotificationDto, user: User) {
    const existingNotification = await this.prisma.notification.findUnique({ where: { id } })

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    if (
      existingNotification.status === NotificationStatus.SENT ||
      existingNotification.status === NotificationStatus.REVOKED
    ) {
      throw new BadRequestException('Cannot update sent or revoked notifications')
    }

    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        ...dto,
        // Update status if scheduledAt is changed
        status: dto.scheduledAt ? NotificationStatus.SCHEDULED : existingNotification.status,
      },
      include: { createdBy: true },
    })
    return th.toInstanceSafe(NotificationEntity, notification)
  }

  async sendNotification(id: string, user: User) {
    const existingNotification = await this.prisma.notification.findUnique({ where: { id } })

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    if (
      existingNotification.status !== NotificationStatus.DRAFT &&
      existingNotification.status !== NotificationStatus.SCHEDULED
    ) {
      throw new BadRequestException('Only draft or scheduled notifications can be sent')
    }

    // TODO: Implement actual sending logic here (email, push notification, etc.)

    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
      include: { createdBy: true },
    })
    return th.toInstanceSafe(NotificationEntity, notification)
  }

  async revokeNotification(id: string, user: User) {
    const existingNotification = await this.prisma.notification.findUnique({ where: { id } })

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    if (existingNotification.status !== NotificationStatus.SENT) {
      throw new BadRequestException('Only sent notifications can be revoked')
    }

    const notification = await this.prisma.notification.update({
      where: { id },
      data: {
        status: NotificationStatus.REVOKED,
        revokedAt: new Date(),
      },
      include: { createdBy: true },
    })
    return th.toInstanceSafe(NotificationEntity, notification)
  }

  async deleteNotification(id: string, user: User) {
    const existingNotification = await this.prisma.notification.findUnique({ where: { id } })

    if (!existingNotification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }

    if (existingNotification.status === NotificationStatus.SENT) {
      throw new BadRequestException('Cannot delete sent notifications. Revoke them first')
    }

    await this.prisma.notification.delete({
      where: { id },
    })

    return { id }
  }

  async getNotificationStats() {
    const [total, draft, scheduled, sent, revoked, readCount] = await Promise.all([
      this.prisma.notification.count(),
      this.prisma.notification.count({ where: { status: NotificationStatus.DRAFT } }),
      this.prisma.notification.count({ where: { status: NotificationStatus.SCHEDULED } }),
      this.prisma.notification.count({ where: { status: NotificationStatus.SENT } }),
      this.prisma.notification.count({ where: { status: NotificationStatus.REVOKED } }),
      this.prisma.notification.findMany({
        where: { status: NotificationStatus.SENT },
        select: { id: true, readBy: true },
      }),
    ])

    const totalReadCount = readCount.reduce((acc, notification) => acc + (notification.readBy?.length || 0), 0)

    const readRate = sent > 0 ? totalReadCount / sent : 0

    return {
      total,
      draft,
      scheduled,
      sent,
      revoked,
      readRate,
    }
  }
}
