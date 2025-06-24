import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFeedbackDto } from './dtos/create-feedback.dto'
import { UpdateFeedbackDto } from './dtos/update-feedback.dto'
import { QueryFeedbackDto } from './dtos/query-feedback.dto'
import { User, FeedbackStatus, SentimentType } from '@prisma/client'
import { th } from '@app/helper/transform.helper'
import { FeedbackEntity } from './entities/feedback.entity'
import { DateTime } from 'luxon'

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeedbacks(queryFeedbackDto: QueryFeedbackDto) {
    const { select, include } = queryFeedbackDto
    const feedbacks = await this.prisma.feedback.findMany({
      where: queryFeedbackDto.where,
      orderBy: queryFeedbackDto.sort,
      take: queryFeedbackDto.take,
      skip: queryFeedbackDto.skip,
      ...(select
        ? { select: Object.fromEntries(select.map((key) => [key, true])) }
        : include
          ? { include: Object.fromEntries(include.map((key) => [key, true])) }
          : {}),
    })
    return th.toInstancesSafe(FeedbackEntity, feedbacks)
  }

  async getFeedback(id: string) {
    const feedback = await this.prisma.feedback.findUniqueOrThrow({
      where: { id },
      include: {
        student: true,
        reviewedByOperator: true,
        responses: {
          include: {
            operator: true,
          },
        },
      },
    })
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  async createFeedback(dto: CreateFeedbackDto, user: User) {
    // Get student ID from user
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    })

    if (!student) {
      throw new Error('Student not found for this user')
    }

    // Create feedback
    const feedback = await this.prisma.feedback.create({
      data: {
        ...dto,
        studentId: student.id,
        keywords: [],
        status: 'SUBMITTED',
      },
      include: {
        student: true,
      },
    })

    // TODO: Trigger AI sentiment analysis
    // await this.analyzeSentiment(feedback.id)

    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  async updateFeedback(id: string, dto: UpdateFeedbackDto, user: User) {
    // Get student ID from user
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    })

    if (!student) {
      throw new Error('Student not found for this user')
    }

    const feedback = await this.prisma.feedback.update({
      where: { id, studentId: student.id },
      data: dto,
      include: {
        student: true,
        reviewedByOperator: true,
        responses: {
          include: {
            operator: true,
          },
        },
      },
    })
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  async deleteFeedback(id: string, user: User) {
    // Get student ID from user
    const student = await this.prisma.student.findUnique({
      where: { userId: user.id },
    })

    if (!student) {
      throw new Error('Student not found for this user')
    }

    await this.prisma.feedback.delete({
      where: { id, studentId: student.id },
    })
  }

  // Admin/Operator methods
  async updateFeedbackStatus(id: string, status: FeedbackStatus, operatorId: string) {
    const feedback = await this.prisma.feedback.update({
      where: { id },
      data: {
        status,
        reviewedAt: DateTime.now().toJSDate(),
        reviewedByOperatorId: operatorId,
      },
      include: {
        student: true,
        reviewedByOperator: true,
        responses: {
          include: {
            operator: true,
          },
        },
      },
    })
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  // AI Sentiment Analysis
  async analyzeSentiment(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    })

    if (!feedback) {
      throw new Error('Feedback not found')
    }

    // TODO: Implement AI sentiment analysis
    // This is a placeholder for the AI analysis
    const aiResult = {
      sentiment: 'POSITIVE' as SentimentType,
      confidence: 0.85,
      keywords: ['good', 'experience', 'helpful'],
      analysis: {
        positive_score: 0.85,
        negative_score: 0.05,
        neutral_score: 0.1,
      },
    }

    const updatedFeedback = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: aiResult.sentiment,
        confidence: aiResult.confidence,
        keywords: aiResult.keywords,
        aiAnalysis: aiResult.analysis,
      },
    })

    return th.toInstanceSafe(FeedbackEntity, updatedFeedback)
  }
}
