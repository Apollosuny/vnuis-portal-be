import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFeedbackResponseDto } from './dtos/create-feedback-response.dto'
import { UpdateFeedbackResponseDto } from './dtos/update-feedback-response.dto'
import { QueryFeedbackResponseDto } from './dtos/query-feedback-response.dto'
import { User } from '@prisma/client'
import { th } from '@app/helper/transform.helper'
import { FeedbackResponseEntity } from './entities/feedback-response.entity'
import { DateTime } from 'luxon'

@Injectable()
export class FeedbackResponseService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeedbackResponses(queryDto: QueryFeedbackResponseDto) {
    const { select, include } = queryDto
    const responses = await this.prisma.feedbackResponse.findMany({
      where: queryDto.where,
      orderBy: queryDto.sort,
      take: queryDto.take,
      skip: queryDto.skip,
      ...(select
        ? { select: Object.fromEntries(select.map((key) => [key, true])) }
        : include
          ? { include: Object.fromEntries(include.map((key) => [key, true])) }
          : {}),
    })
    return th.toInstancesSafe(FeedbackResponseEntity, responses)
  }

  async getFeedbackResponse(id: string) {
    const response = await this.prisma.feedbackResponse.findUniqueOrThrow({
      where: { id },
      include: {
        operator: true,
        feedback: {
          include: {
            student: true,
          },
        },
      },
    })
    return th.toInstanceSafe(FeedbackResponseEntity, response)
  }

  async createFeedbackResponse(dto: CreateFeedbackResponseDto, operatorId: string, feedbackId?: string) {
    if (!feedbackId) {
      throw new Error('feedbackId is required')
    }

    const response = await this.prisma.feedbackResponse.create({
      data: {
        content: dto.content,
        isInternal: dto.isInternal,
        operatorId,
        feedbackId,
      },
      include: {
        operator: true,
        feedback: {
          include: {
            student: true,
          },
        },
      },
    })
    return th.toInstanceSafe(FeedbackResponseEntity, response)
  }

  async updateFeedbackResponse(id: string, dto: UpdateFeedbackResponseDto, operatorId: string) {
    const response = await this.prisma.feedbackResponse.update({
      where: { id, operatorId },
      data: {
        ...dto,
        updatedAt: DateTime.now().toJSDate(),
      },
      include: {
        operator: true,
        feedback: {
          include: {
            student: true,
          },
        },
      },
    })
    return th.toInstanceSafe(FeedbackResponseEntity, response)
  }

  async deleteFeedbackResponse(id: string, operatorId: string) {
    await this.prisma.feedbackResponse.delete({
      where: { id, operatorId },
    })
  }

  async getResponsesByFeedback(feedbackId: string) {
    const responses = await this.prisma.feedbackResponse.findMany({
      where: { feedbackId },
      include: {
        operator: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return th.toInstancesSafe(FeedbackResponseEntity, responses)
  }

  async getResponsesByFeedbackId(feedbackId: string, includeInternal: boolean = false) {
    const responses = await this.prisma.feedbackResponse.findMany({
      where: {
        feedbackId,
        ...(includeInternal ? {} : { isInternal: false }),
      },
      include: {
        operator: true,
      },
      orderBy: { createdAt: 'asc' },
    })
    return th.toInstancesSafe(FeedbackResponseEntity, responses)
  }

  async getResponsesByOperator(operatorId: string) {
    const responses = await this.prisma.feedbackResponse.findMany({
      where: { operatorId },
      include: {
        feedback: {
          include: {
            student: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return th.toInstancesSafe(FeedbackResponseEntity, responses)
  }

  async getResponseStats(operatorId?: string) {
    const where: any = {}
    if (operatorId) where.operatorId = operatorId

    const stats = await this.prisma.feedbackResponse.groupBy({
      by: ['feedbackId'],
      where,
      _count: { id: true },
    })

    return {
      totalResponses: stats.length,
      averageResponsesPerFeedback:
        stats.length > 0 ? stats.reduce((sum, stat) => sum + stat._count.id, 0) / stats.length : 0,
    }
  }
}
