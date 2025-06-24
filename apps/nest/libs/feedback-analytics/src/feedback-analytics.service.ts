import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { QueryFeedbackAnalyticsDto } from './dtos/query-feedback-analytics.dto'
import { th } from '@app/helper/transform.helper'
import { FeedbackAnalyticsEntity } from './entities/feedback-analytics.entity'
import { DateTime } from 'luxon'

@Injectable()
export class FeedbackAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeedbackAnalytics(queryDto: QueryFeedbackAnalyticsDto) {
    const { select, startDate, endDate } = queryDto
    const where: any = {}

    if (startDate) where.date.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.date.lte = DateTime.fromISO(endDate).toJSDate()

    const analytics = await this.prisma.feedbackAnalytics.findMany({
      where,
      orderBy: queryDto.sort,
      take: queryDto.take,
      skip: queryDto.skip,
      ...(select ? { select: Object.fromEntries(select.map((key) => [key, true])) } : {}),
    })
    return th.toInstancesSafe(FeedbackAnalyticsEntity, analytics)
  }

  async getFeedbackAnalyticsById(id: string) {
    const analytics = await this.prisma.feedbackAnalytics.findUniqueOrThrow({
      where: { id },
    })
    return th.toInstanceSafe(FeedbackAnalyticsEntity, analytics)
  }

  async createFeedbackAnalytics(data: any) {
    const analytics = await this.prisma.feedbackAnalytics.create({
      data,
    })
    return th.toInstanceSafe(FeedbackAnalyticsEntity, analytics)
  }

  async updateFeedbackAnalytics(id: string, data: any) {
    const analytics = await this.prisma.feedbackAnalytics.update({
      where: { id },
      data,
    })
    return th.toInstanceSafe(FeedbackAnalyticsEntity, analytics)
  }

  async deleteFeedbackAnalytics(id: string) {
    await this.prisma.feedbackAnalytics.delete({
      where: { id },
    })
  }

  // Dashboard Overview Analytics
  async getDashboardOverview(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate) where.createdAt.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.createdAt.lte = DateTime.fromISO(endDate).toJSDate()

    const [totalFeedbacks, positiveFeedbacks, negativeFeedbacks, neutralFeedbacks, averageRating, responseCount] =
      await Promise.all([
        this.prisma.feedback.count({ where }),
        this.prisma.feedback.count({
          where: { ...where, sentiment: 'POSITIVE' },
        }),
        this.prisma.feedback.count({
          where: { ...where, sentiment: 'NEGATIVE' },
        }),
        this.prisma.feedback.count({
          where: { ...where, sentiment: 'NEUTRAL' },
        }),
        this.prisma.feedback.aggregate({
          where,
          _avg: { rating: true },
        }),
        this.prisma.feedbackResponse.count({
          where: {
            feedback: where,
          },
        }),
      ])

    return {
      totalFeedbacks,
      positiveFeedbacks,
      negativeFeedbacks,
      neutralFeedbacks,
      averageRating: averageRating._avg.rating || 0,
      responseRate: totalFeedbacks > 0 ? (responseCount / totalFeedbacks) * 100 : 0,
      sentimentDistribution: {
        positive: totalFeedbacks > 0 ? (positiveFeedbacks / totalFeedbacks) * 100 : 0,
        negative: totalFeedbacks > 0 ? (negativeFeedbacks / totalFeedbacks) * 100 : 0,
        neutral: totalFeedbacks > 0 ? (neutralFeedbacks / totalFeedbacks) * 100 : 0,
      },
    }
  }

  // Sentiment Analysis
  async getSentimentAnalysis(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate) where.createdAt.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.createdAt.lte = DateTime.fromISO(endDate).toJSDate()

    const sentimentStats = await this.prisma.feedback.groupBy({
      by: ['sentiment'],
      where,
      _count: { id: true },
      _avg: { confidence: true },
    })

    const sentimentTrends = await this.prisma.feedback.groupBy({
      by: ['sentiment', 'createdAt'],
      where,
      _count: { id: true },
    })

    return {
      sentimentStats,
      sentimentTrends,
    }
  }

  // Category Analysis
  async getCategoryAnalysis(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate) where.createdAt.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.createdAt.lte = DateTime.fromISO(endDate).toJSDate()

    const categoryStats = await this.prisma.feedback.groupBy({
      by: ['category'],
      where,
      _count: { id: true },
      _avg: { rating: true },
    })

    return categoryStats
  }

  // Response Time Analysis
  async getResponseTimeAnalysis(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate) where.createdAt.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.createdAt.lte = DateTime.fromISO(endDate).toJSDate()

    const feedbacksWithResponses = await this.prisma.feedback.findMany({
      where: { ...where, responses: { some: {} } },
      include: {
        responses: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    })

    const responseTimes = feedbacksWithResponses
      .map((feedback) => {
        const firstResponse = feedback.responses[0]
        if (!firstResponse) return null

        const feedbackDate = DateTime.fromJSDate(feedback.createdAt)
        const responseDate = DateTime.fromJSDate(firstResponse.createdAt)
        return responseDate.diff(feedbackDate, 'hours').hours
      })
      .filter((time) => time !== null)

    const averageResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0

    return {
      averageResponseTime,
      responseTimeDistribution: {
        under1Hour: responseTimes.filter((time) => time < 1).length,
        under24Hours: responseTimes.filter((time) => time < 24).length,
        under72Hours: responseTimes.filter((time) => time < 72).length,
        over72Hours: responseTimes.filter((time) => time >= 72).length,
      },
    }
  }

  // Rating Analysis
  async getRatingAnalysis(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate) where.createdAt.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.createdAt.lte = DateTime.fromISO(endDate).toJSDate()

    const ratingStats = await this.prisma.feedback.groupBy({
      by: ['rating'],
      where,
      _count: { id: true },
    })

    const averageRating = await this.prisma.feedback.aggregate({
      where,
      _avg: { rating: true },
    })

    return {
      ratingDistribution: ratingStats,
      averageRating: averageRating._avg.rating || 0,
    }
  }

  // Trend Analysis
  async getTrendAnalysis(startDate?: string, endDate?: string) {
    const where: any = {}
    if (startDate) where.createdAt.gte = DateTime.fromISO(startDate).toJSDate()
    if (endDate) where.createdAt.lte = DateTime.fromISO(endDate).toJSDate()

    const trends = await this.prisma.feedback.groupBy({
      by: ['createdAt'],
      where,
      _count: { id: true },
    })

    // Group by week for better trend visualization
    const weeklyTrends = trends.reduce((acc, trend) => {
      const date = DateTime.fromJSDate(trend.createdAt)
      const weekStart = date.startOf('week').toISODate()

      if (!acc[weekStart]) {
        acc[weekStart] = 0
      }
      acc[weekStart] += trend._count.id

      return acc
    }, {})

    return {
      dailyTrends: trends,
      weeklyTrends,
    }
  }

  // Generate Analytics Data (for testing/demo purposes)
  async generateAnalyticsData(date: DateTime = DateTime.now()) {
    const startOfDay = date.startOf('day').toJSDate()
    const endOfDay = date.endOf('day').toJSDate()

    // Get feedbacks for the day
    const dailyFeedbacks = await this.prisma.feedback.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    })

    // Calculate analytics by category and sentiment
    const analyticsData = []

    // Group feedbacks by category and sentiment
    const groupedFeedbacks = dailyFeedbacks.reduce(
      (acc, feedback) => {
        const key = `${feedback.category}_${feedback.sentiment || 'NEUTRAL'}`
        if (!acc[key]) {
          acc[key] = {
            category: feedback.category,
            sentiment: feedback.sentiment || 'NEUTRAL',
            count: 0,
            ratings: [] as number[],
          }
        }
        acc[key].count++
        if (feedback.rating) {
          acc[key].ratings.push(feedback.rating)
        }
        return acc
      },
      {} as Record<string, { category: string; sentiment: string; count: number; ratings: number[] }>,
    )

    // Create analytics records for each category-sentiment combination
    for (const [key, data] of Object.entries(groupedFeedbacks)) {
      const avgRating =
        data.ratings.length > 0 ? data.ratings.reduce((sum, rating) => sum + rating, 0) / data.ratings.length : null

      const responseCount = await this.prisma.feedbackResponse.count({
        where: {
          feedback: {
            createdAt: {
              gte: startOfDay,
              lte: endOfDay,
            },
            category: data.category as any,
            sentiment: data.sentiment as any,
          },
        },
      })

      analyticsData.push({
        date: startOfDay,
        category: data.category as any,
        sentiment: data.sentiment as any,
        count: data.count,
        avgRating,
        totalResponses: responseCount,
      })
    }

    // Create or update analytics records
    const results = []
    for (const data of analyticsData) {
      const existingAnalytics = await this.prisma.feedbackAnalytics.findUnique({
        where: {
          date_category_sentiment: {
            date: data.date,
            category: data.category,
            sentiment: data.sentiment,
          },
        },
      })

      if (existingAnalytics) {
        const updated = await this.prisma.feedbackAnalytics.update({
          where: { id: existingAnalytics.id },
          data: {
            count: data.count,
            avgRating: data.avgRating,
            totalResponses: data.totalResponses,
          },
        })
        results.push(updated)
      } else {
        const created = await this.prisma.feedbackAnalytics.create({
          data,
        })
        results.push(created)
      }
    }

    return results
  }

  // Get Weekly Trends
  async getWeeklyTrends(weeks: number = 4) {
    const endDate = DateTime.now()
    const startDate = endDate.minus({ weeks })

    const trends = await this.prisma.feedback.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate.toJSDate(),
          lte: endDate.toJSDate(),
        },
      },
      _count: { id: true },
    })

    // Group by week
    const weeklyData = trends.reduce((acc, trend) => {
      const date = DateTime.fromJSDate(trend.createdAt)
      const weekStart = date.startOf('week').toISODate()

      if (!acc[weekStart]) {
        acc[weekStart] = {
          week: weekStart,
          count: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
        }
      }

      acc[weekStart].count += trend._count.id

      return acc
    }, {})

    return Object.values(weeklyData)
  }

  // Get Monthly Trends
  async getMonthlyTrends(months: number = 12) {
    const endDate = DateTime.now()
    const startDate = endDate.minus({ months })

    const trends = await this.prisma.feedback.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: startDate.toJSDate(),
          lte: endDate.toJSDate(),
        },
      },
      _count: { id: true },
    })

    // Group by month
    const monthlyData = trends.reduce((acc, trend) => {
      const date = DateTime.fromJSDate(trend.createdAt)
      const monthKey = date.toFormat('yyyy-MM')

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          count: 0,
          averageRating: 0,
          ratings: [],
        }
      }

      acc[monthKey].count += trend._count.id

      return acc
    }, {})

    return Object.values(monthlyData)
  }
}
