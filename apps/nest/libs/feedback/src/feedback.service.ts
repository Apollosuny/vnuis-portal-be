import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFeedbackDto } from './dtos/create-feedback.dto'
import { UpdateFeedbackDto } from './dtos/update-feedback.dto'
import { QueryFeedbackDto } from './dtos/query-feedback.dto'
import { User, FeedbackStatus, SentimentType } from '@prisma/client'
import { th } from '@app/helper/transform.helper'
import { FeedbackEntity } from './entities/feedback.entity'
import { DateTime } from 'luxon'
import { AiService } from 'libs/ai/src'

@Injectable()
export class FeedbackService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

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

    const total = await this.prisma.feedback.count({
      where: queryFeedbackDto.where,
    })

    const totalPages = Math.ceil(total / queryFeedbackDto.take)
    const totalItems = total
    const currentPage = Math.floor((queryFeedbackDto.skip || 0) / (queryFeedbackDto.take || 1)) + 1

    return {
      data: th.toInstancesSafe(FeedbackEntity, feedbacks),
      totalItems,
      totalPages,
      currentPage,
    }
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

    // Trigger AI sentiment analysis asynchronously
    this.analyzeSentiment(feedback.id).catch((error) => {
      console.error('AI analysis failed:', error)
    })

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

    // Use AI service for sentiment analysis
    const aiResult = await this.aiService.analyzeFeedback({
      title: feedback.title,
      content: feedback.content,
      category: feedback.category,
      rating: feedback.rating || undefined,
    })

    if (!aiResult) {
      // Fallback to basic analysis if AI is not available
      const fallbackResult = {
        sentiment: 'NEUTRAL' as SentimentType,
        confidence: 0.5,
        keywords: [],
        aiAnalysis: {
          message: 'AI analysis not available',
          fallback: true,
        },
      }

      const updatedFeedback = await this.prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          sentiment: fallbackResult.sentiment,
          confidence: fallbackResult.confidence,
          keywords: fallbackResult.keywords,
          aiAnalysis: fallbackResult.aiAnalysis,
        },
      })

      return th.toInstanceSafe(FeedbackEntity, updatedFeedback)
    }

    // Update feedback with AI analysis results
    const updatedFeedback = await this.prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        sentiment: aiResult.sentiment as SentimentType,
        confidence: aiResult.confidence,
        keywords: aiResult.keywords,
        aiAnalysis: {
          sentiment: aiResult.sentiment,
          confidence: aiResult.confidence,
          keywords: aiResult.keywords,
          category: aiResult.category,
          summary: aiResult.summary,
          suggestions: aiResult.suggestions,
          rawResponse: aiResult.rawResponse,
          analyzedAt: new Date().toISOString(),
        },
      },
    })

    return th.toInstanceSafe(FeedbackEntity, updatedFeedback)
  }

  // Generate AI response suggestion
  async generateResponseSuggestion(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    })

    if (!feedback) {
      throw new Error('Feedback not found')
    }

    const suggestion = await this.aiService.generateResponseSuggestion(`${feedback.title}\n\n${feedback.content}`)

    return {
      suggestion,
      feedbackId,
      generatedAt: new Date().toISOString(),
    }
  }

  // Auto-categorize feedback using AI
  async autoCategorizeFeedback(feedbackId: string) {
    const feedback = await this.prisma.feedback.findUnique({
      where: { id: feedbackId },
    })

    if (!feedback) {
      throw new Error('Feedback not found')
    }

    const suggestedCategory = await this.aiService.categorizeFeedback(feedback.title, feedback.content)

    if (suggestedCategory && suggestedCategory !== feedback.category) {
      const updatedFeedback = await this.prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          category: suggestedCategory as any,
          aiAnalysis: {
            suggestedCategory,
            categorizedAt: new Date().toISOString(),
          },
        },
      })

      return th.toInstanceSafe(FeedbackEntity, updatedFeedback)
    }

    return th.toInstanceSafe(FeedbackEntity, feedback)
  }
}
