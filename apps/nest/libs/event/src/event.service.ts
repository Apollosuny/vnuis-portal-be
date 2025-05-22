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
    try {
      // First check if the event exists
      const existingEvent = await this.prisma.event.findUnique({
        where: { id },
      })

      if (!existingEvent) {
        throw new Error(`Event with ID ${id} not found`)
      }

      // Then check if this user has permission to update
      if (existingEvent.createdByOperatorId !== user.id) {
        // For testing purposes, log the ID information
        console.log('Event createdByOperatorId:', existingEvent.createdByOperatorId)
        console.log('Current user ID:', user.id)

        // Find the operator for the user
        const operator = await this.prisma.operator.findFirst({
          where: { userId: user.id },
        })

        console.log('Current user operator ID:', operator?.id)

        // Check if the event was created by this operator (using operatorId instead of userId)
        if (operator && existingEvent.createdByOperatorId === operator.id) {
          // Allow the update if the operator matches
          const event = await this.prisma.event.update({
            where: { id },
            data: dto,
          })
          return th.toInstanceSafe(EventEntity, event)
        }

        throw new Error(`User ${user.id} does not have permission to update event ${id}`)
      }

      // Proceed with the update
      const event = await this.prisma.event.update({
        where: { id, createdByOperatorId: user.id },
        data: dto,
      })
      return th.toInstanceSafe(EventEntity, event)
    } catch (error) {
      throw new BadRequestException(`Failed to update event: ${error.message}`)
    }
  }

  async deleteEvent(id: string, user: User) {
    try {
      // First check if the event exists
      const existingEvent = await this.prisma.event.findUnique({
        where: { id },
      })

      if (!existingEvent) {
        throw new Error(`Event with ID ${id} not found`)
      }

      // Check if this user has permission by user ID
      if (existingEvent.createdByOperatorId !== user.id) {
        // Find the operator for the user
        const operator = await this.prisma.operator.findFirst({
          where: { userId: user.id },
        })

        // Check if the event was created by this operator
        if (operator && existingEvent.createdByOperatorId === operator.id) {
          // Allow the delete if the operator matches
          await this.prisma.event.delete({
            where: { id },
          })
          return
        }

        throw new Error(`User ${user.id} does not have permission to delete event ${id}`)
      }

      // Proceed with the delete
      await this.prisma.event.delete({
        where: { id, createdByOperatorId: user.id },
      })
    } catch (error) {
      throw new BadRequestException(`Failed to delete event: ${error.message}`)
    }
  }

  async publishEvent(id: string, user: User) {
    try {
      // First check if the event exists
      const existingEvent = await this.prisma.event.findUnique({
        where: { id },
      })

      if (!existingEvent) {
        throw new Error(`Event with ID ${id} not found`)
      }

      // Check if this user has permission by user ID
      if (existingEvent.createdByOperatorId !== user.id) {
        // Find the operator for the user
        const operator = await this.prisma.operator.findFirst({
          where: { userId: user.id },
        })

        // Check if the event was created by this operator
        if (operator && existingEvent.createdByOperatorId === operator.id) {
          // Allow the update if the operator matches
          const event = await this.prisma.event.update({
            where: { id },
            data: { isPublished: true },
          })
          return th.toInstanceSafe(EventEntity, event)
        }

        throw new Error(`User ${user.id} does not have permission to publish event ${id}`)
      }

      // Proceed with the update
      const event = await this.prisma.event.update({
        where: { id, createdByOperatorId: user.id },
        data: { isPublished: true },
      })
      return th.toInstanceSafe(EventEntity, event)
    } catch (error) {
      throw new BadRequestException(`Failed to publish event: ${error.message}`)
    }
  }

  async unpublishEvent(id: string, user: User) {
    try {
      // First check if the event exists
      const existingEvent = await this.prisma.event.findUnique({
        where: { id },
      })

      if (!existingEvent) {
        throw new Error(`Event with ID ${id} not found`)
      }

      // Check if this user has permission by user ID
      if (existingEvent.createdByOperatorId !== user.id) {
        // Find the operator for the user
        const operator = await this.prisma.operator.findFirst({
          where: { userId: user.id },
        })

        // Check if the event was created by this operator
        if (operator && existingEvent.createdByOperatorId === operator.id) {
          // Allow the update if the operator matches
          const event = await this.prisma.event.update({
            where: { id },
            data: { isPublished: false },
          })
          return th.toInstanceSafe(EventEntity, event)
        }

        throw new Error(`User ${user.id} does not have permission to unpublish event ${id}`)
      }

      // Proceed with the update
      const event = await this.prisma.event.update({
        where: { id, createdByOperatorId: user.id },
        data: { isPublished: false },
      })
      return th.toInstanceSafe(EventEntity, event)
    } catch (error) {
      throw new BadRequestException(`Failed to unpublish event: ${error.message}`)
    }
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
    try {
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
    } catch (error) {
      console.log('Error during registration:', error)
    }
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
