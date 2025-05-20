import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateEventDto } from './dtos/create-event.dto'
import { UpdateEventDto } from './dtos/update-event.dto'
import { QueryEventDto } from './dtos/query-event.dto'
import { User } from '@prisma/client'
import { th } from '@app/helper'
import { EventEntity } from './entities/event.entity'
import { RegisterEventDto } from './dtos/register-event.dto'
import { EventRegistrationEntity } from './entities/event-registration.entity'
import { UpdateRegistrationStatusDto } from './dtos/update-registration-status.dto'
import { QueryEventRegistrationDto } from './dtos/query-event-registration.dto'
import { UserEntity } from '@app/user/entities/user.entity'

@Injectable()
export class EventService {
  constructor(private readonly prisma: PrismaService) {}

  async getEvents(queryEventDto: QueryEventDto) {
    const { select, include } = queryEventDto
    const events = await this.prisma.event.findMany({
      where: queryEventDto.where,
      orderBy: queryEventDto.sort,
      take: queryEventDto.take,
      skip: queryEventDto.skip,
      ...(select
        ? { select: Object.fromEntries(select.map((key) => [key, true])) }
        : include
          ? { include: Object.fromEntries(include.map((key) => [key, true])) }
          : {}),
    })
    return th.toInstancesSafe(EventEntity, events)
  }

  async getEvent(id: string) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id },
    })
    return th.toInstanceSafe(EventEntity, event)
  }

  async createEvent(dto: CreateEventDto, user: UserEntity) {
    try {
      const event = await this.prisma.event.create({
        data: {
          ...dto,
          createdByOperatorId: user.operator.id,
        },
      })
      return th.toInstanceSafe(EventEntity, event)
    } catch (error) {
      throw new BadRequestException('Failed to create event', error.message)
    }
  }

  async updateEvent(id: string, dto: UpdateEventDto, user: User) {
    const event = await this.prisma.event.update({
      where: { id, createdByOperatorId: user.id },
      data: dto,
    })
    return th.toInstanceSafe(EventEntity, event)
  }

  async deleteEvent(id: string, user: User) {
    await this.prisma.event.delete({
      where: { id, createdByOperatorId: user.id },
    })
  }

  async publishEvent(id: string, user: User) {
    const event = await this.prisma.event.update({
      where: { id, createdByOperatorId: user.id },
      data: { isPublished: true },
    })
    return th.toInstanceSafe(EventEntity, event)
  }

  async unpublishEvent(id: string, user: User) {
    const event = await this.prisma.event.update({
      where: { id, createdByOperatorId: user.id },
      data: { isPublished: false },
    })
    return th.toInstanceSafe(EventEntity, event)
  }

  async getEventRegistrations(queryEventRegistrationDto: QueryEventRegistrationDto) {
    const { select, include } = queryEventRegistrationDto
    const registrations = await this.prisma.eventRegistration.findMany({
      where: queryEventRegistrationDto.where,
      orderBy: queryEventRegistrationDto.sort,
      take: queryEventRegistrationDto.take,
      skip: queryEventRegistrationDto.skip,
      ...(select
        ? { select: Object.fromEntries(select.map((key) => [key, true])) }
        : include
          ? { include: Object.fromEntries(include.map((key) => [key, true])) }
          : {}),
    })
    return th.toInstancesSafe(EventRegistrationEntity, registrations)
  }

  async getEventRegistration(id: string) {
    const registration = await this.prisma.eventRegistration.findUniqueOrThrow({
      where: { id },
    })
    return th.toInstanceSafe(EventRegistrationEntity, registration)
  }

  async registerEvent(dto: RegisterEventDto, user: User) {
    const event = await this.prisma.event.findUniqueOrThrow({
      where: { id: dto.eventId },
    })

    const student = await this.prisma.student.findFirst({
      where: { userId: user.id },
    })

    if (!student) {
      throw new Error('Student not found')
    }

    const existingRegistration = await this.prisma.eventRegistration.findUnique({
      where: {
        eventId_studentId: {
          eventId: dto.eventId,
          studentId: student.id,
        },
      },
    })

    if (existingRegistration) {
      throw new Error('You have already registered for this event')
    }

    const registration = await this.prisma.eventRegistration.create({
      data: {
        eventId: dto.eventId,
        studentId: student.id,
        status: 'PENDING' as any,
        additionalInfo: dto.additionalInfo,
      },
    })

    return th.toInstanceSafe(EventRegistrationEntity, registration)
  }

  async updateRegistrationStatus(id: string, dto: UpdateRegistrationStatusDto, user: User) {
    const operator = await this.prisma.operator.findFirst({
      where: { userId: user.id },
    })

    if (!operator) {
      throw new Error('Operator not found')
    }

    const registration = await this.prisma.eventRegistration.update({
      where: { id },
      data: {
        status: dto.status as any,
        remarks: dto.remarks,
        handleAt: new Date(),
        handleByOperatorId: operator.id,
      },
    })

    return th.toInstanceSafe(EventRegistrationEntity, registration)
  }

  async cancelRegistration(id: string, user: User) {
    const student = await this.prisma.student.findFirst({
      where: { userId: user.id },
    })

    if (!student) {
      throw new Error('Student not found')
    }

    const registration = await this.prisma.eventRegistration.update({
      where: { id, studentId: student.id },
      data: {
        status: 'CANCELLED' as any,
        handleAt: new Date(),
      },
    })

    return th.toInstanceSafe(EventRegistrationEntity, registration)
  }
}
