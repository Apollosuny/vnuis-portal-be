import { Test, TestingModule } from '@nestjs/testing'
import { NotificationService } from './notification.service'
import { PrismaService } from 'nestjs-prisma'
import {
  User,
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationTargetType,
} from '@prisma/client'
import { CreateNotificationDto } from './dtos'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('NotificationService', () => {
  let service: NotificationService
  let prismaService: PrismaService

  const mockPrismaService = {
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  }

  const mockUser = { id: 'user-id' } as User

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<NotificationService>(NotificationService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getNotifications', () => {
    it('should return all notifications', async () => {
      const mockNotifications = [
        {
          id: '1',
          title: 'Test',
          content: 'Test content',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockPrismaService.notification.findMany.mockResolvedValue(mockNotifications)

      const result = await service.getNotifications({})

      expect(mockPrismaService.notification.findMany).toHaveBeenCalled()
      expect(result).toEqual(mockNotifications)
    })
  })

  describe('getNotification', () => {
    it('should return a notification by id', async () => {
      const mockNotification = {
        id: '1',
        title: 'Test',
        content: 'Test content',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrismaService.notification.findUniqueOrThrow.mockResolvedValue(mockNotification)

      const result = await service.getNotification('1')

      expect(mockPrismaService.notification.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: '1' },
        include: { createdBy: true },
      })
      expect(result).toEqual(mockNotification)
    })
  })

  describe('createNotification', () => {
    it('should create a notification', async () => {
      const dto: CreateNotificationDto = {
        title: 'Test',
        content: 'Test content',
        type: NotificationType.GENERAL,
        priority: NotificationPriority.NORMAL,
        targetType: NotificationTargetType.ALL_STUDENTS,
      }

      const mockNotification = {
        id: '1',
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdById: mockUser.id,
        status: NotificationStatus.DRAFT,
      }

      mockPrismaService.notification.create.mockResolvedValue(mockNotification)

      const result = await service.createNotification(dto, mockUser)

      expect(mockPrismaService.notification.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          createdById: mockUser.id,
          status: NotificationStatus.DRAFT,
        },
        include: { createdBy: true },
      })
      expect(result).toEqual(mockNotification)
    })
  })

  describe('sendNotification', () => {
    it('should throw an error if notification does not exist', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue(null)

      await expect(service.sendNotification('non-existent-id', mockUser)).rejects.toThrow(NotFoundException)
    })

    it('should throw an error if notification is not in draft or scheduled status', async () => {
      mockPrismaService.notification.findUnique.mockResolvedValue({
        id: '1',
        status: NotificationStatus.SENT,
      })

      await expect(service.sendNotification('1', mockUser)).rejects.toThrow(BadRequestException)
    })

    it('should send a notification', async () => {
      const mockNotification = {
        id: '1',
        status: NotificationStatus.DRAFT,
      }

      const mockUpdatedNotification = {
        ...mockNotification,
        status: NotificationStatus.SENT,
        sentAt: expect.any(Date),
      }

      mockPrismaService.notification.findUnique.mockResolvedValue(mockNotification)
      mockPrismaService.notification.update.mockResolvedValue(mockUpdatedNotification)

      const result = await service.sendNotification('1', mockUser)

      expect(mockPrismaService.notification.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: NotificationStatus.SENT,
          sentAt: expect.any(Date),
        },
        include: { createdBy: true },
      })
      expect(result).toEqual(mockUpdatedNotification)
    })
  })

  // Add more tests for other methods...
})
