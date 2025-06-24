import { FeedbackAnalyticsService } from './feedback-analytics.service'
import { TestContext, testHelper } from '@app/spec/test.helper'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { FeedbackAnalyticsModule } from './feedback-analytics.module'
import { FeedbackModule } from '@app/feedback'
import { FeedbackResponseModule } from '@app/feedback-response'
import { CreateFeedbackDto } from '@app/feedback/dtos/create-feedback.dto'
import { CreateFeedbackResponseDto } from '@app/feedback-response/dtos/create-feedback-response.dto'
import qs from 'qs'
import { Test, TestingModule } from '@nestjs/testing'
import { DateTime } from 'luxon'

describe('FeedbackAnalytics Spec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let studentContext: any
  let operatorContext: any

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [FeedbackAnalyticsModule, FeedbackModule, FeedbackResponseModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)

    // Create student and operator contexts
    const studentData = await tc.createStudentContext()
    studentContext = tc.buildUserContext(studentData.tokenInfo)

    const operatorData = await tc.createOperatorContext()
    operatorContext = tc.buildUserContext(operatorData.tokenInfo)
  })

  afterAll(async () => await tc?.clean())

  describe('Basic Analytics Endpoints', () => {
    test('GetFeedbackAnalytics', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics'))
      expect(res).toBeOK()
    })

    test('GetFeedbackAnalyticsById', async () => {
      // First get analytics list
      const analyticsRes = await operatorContext.request((r) => r.get('/feedback-analytics'))
      if (analyticsRes.body.length > 0) {
        const analyticsId = analyticsRes.body[0].id
        const res = await operatorContext.request((r) => r.get(`/feedback-analytics/${analyticsId}`))
        expect(res).toBeOK()
        expect(res.body.id).toBe(analyticsId)
      }
    })

    test('QueryFeedbackAnalytics', async () => {
      const paramDto = {
        where: {
          count: {
            gt: 0,
          },
        },
        take: 5,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics?${param}`))
      expect(res).toBeOK()
    })
  })

  describe('Dashboard Overview', () => {
    test('GetDashboardOverview', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/dashboard/overview'))
      expect(res).toBeOK()
      expect(res.body).toHaveProperty('totalFeedbacks')
      expect(res.body).toHaveProperty('totalResponses')
      expect(res.body).toHaveProperty('avgRating')
      expect(res.body).toHaveProperty('sentimentDistribution')
      expect(res.body).toHaveProperty('categoryDistribution')
      expect(res.body).toHaveProperty('recentTrends')
    })

    test('GetDashboardOverviewWithDateRange', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days ago
      const endDate = new Date().toISOString().split('T')[0] // today

      const res = await operatorContext.request((r) =>
        r.get(`/feedback-analytics/dashboard/overview?startDate=${startDate}&endDate=${endDate}`),
      )
      expect(res).toBeOK()
    })
  })

  describe('Sentiment Analysis', () => {
    test('GetSentimentAnalysis', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/sentiment/analysis'))
      expect(res).toBeOK()
      expect(res.body).toHaveProperty('distribution')
      expect(res.body).toHaveProperty('trends')
    })

    test('GetSentimentAnalysisWithDateRange', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days ago
      const endDate = new Date().toISOString().split('T')[0] // today

      const res = await operatorContext.request((r) =>
        r.get(`/feedback-analytics/sentiment/analysis?startDate=${startDate}&endDate=${endDate}`),
      )
      expect(res).toBeOK()
    })
  })

  describe('Category Analysis', () => {
    test('GetCategoryAnalysis', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/category/analysis'))
      expect(res).toBeOK()
      expect(res.body).toHaveProperty('distribution')
      expect(res.body).toHaveProperty('trends')
    })

    test('GetCategoryAnalysisWithDateRange', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const res = await operatorContext.request((r) =>
        r.get(`/feedback-analytics/category/analysis?startDate=${startDate}&endDate=${endDate}`),
      )
      expect(res).toBeOK()
    })
  })

  describe('Response Time Analysis', () => {
    test('GetResponseTimeAnalysis', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/response-time/analysis'))
      expect(res).toBeOK()
      expect(res.body).toHaveProperty('averageResponseTime')
      expect(res.body).toHaveProperty('responseTimeDistribution')
      expect(res.body).toHaveProperty('totalResponded')
    })

    test('GetResponseTimeAnalysisWithDateRange', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const res = await operatorContext.request((r) =>
        r.get(`/feedback-analytics/response-time/analysis?startDate=${startDate}&endDate=${endDate}`),
      )
      expect(res).toBeOK()
    })
  })

  describe('Rating Analysis', () => {
    test('GetRatingAnalysis', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/rating/analysis'))
      expect(res).toBeOK()
      expect(res.body).toHaveProperty('distribution')
      expect(res.body).toHaveProperty('average')
    })

    test('GetRatingAnalysisWithDateRange', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const res = await operatorContext.request((r) =>
        r.get(`/feedback-analytics/rating/analysis?startDate=${startDate}&endDate=${endDate}`),
      )
      expect(res).toBeOK()
    })
  })

  describe('Trend Analysis', () => {
    test('GetTrendAnalysis', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/trends/analysis'))
      expect(res).toBeOK()
    })

    test('GetTrendAnalysisWithInterval', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/trends/analysis?interval=week'))
      expect(res).toBeOK()
    })

    test('GetTrendAnalysisWithDateRangeAndInterval', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const res = await operatorContext.request((r) =>
        r.get(`/feedback-analytics/trends/analysis?startDate=${startDate}&endDate=${endDate}&interval=month`),
      )
      expect(res).toBeOK()
    })
  })

  describe('Data Generation', () => {
    test('GenerateAnalyticsData', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/generate'))
      expect(res).toBeOK()
    })

    test('GenerateAnalyticsDataForSpecificDate', async () => {
      const date = new Date().toISOString().split('T')[0]
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics/generate?date=${date}`))
      expect(res).toBeOK()
    })
  })

  describe('Integration with Feedback Data', () => {
    let feedback: any

    beforeAll(async () => {
      // Create test feedback data
      const feedbackRes = await studentContext
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Analytics Test Feedback',
          content: 'This is for analytics testing',
          category: 'USER_EXPERIENCE',
          rating: 4,
        } as CreateFeedbackDto)
      feedback = feedbackRes.body

      // Create test response
      await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}`))
        .send({
          content: 'Test response for analytics',
          isInternal: false,
        } as CreateFeedbackResponseDto)
    })

    test('AnalyticsReflectsNewData', async () => {
      // Wait a bit for data to be processed
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const res = await operatorContext.request((r) => r.get('/feedback-analytics/dashboard/overview'))
      expect(res).toBeOK()
      expect(res.body.totalFeedbacks).toBeGreaterThan(0)
    })

    test('CategoryAnalysisIncludesNewData', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/category/analysis'))
      expect(res).toBeOK()

      // Check if USER_EXPERIENCE category exists
      const userExpCategory = res.body.distribution.find((cat: any) => cat.category === 'USER_EXPERIENCE')
      expect(userExpCategory).toBeDefined()
    })

    test('RatingAnalysisIncludesNewData', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/rating/analysis'))
      expect(res).toBeOK()

      // Check if rating 4 exists
      const rating4 = res.body.distribution.find((rating: any) => rating.rating === 4)
      expect(rating4).toBeDefined()
    })
  })

  describe('Query Parameters', () => {
    test('QueryWithCategoryFilter', async () => {
      const paramDto = {
        category: 'GENERAL',
        take: 10,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics?${param}`))
      expect(res).toBeOK()
    })

    test('QueryWithSentimentFilter', async () => {
      const paramDto = {
        sentiment: 'POSITIVE',
        take: 10,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics?${param}`))
      expect(res).toBeOK()
    })

    test('QueryWithDateRange', async () => {
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const endDate = new Date().toISOString().split('T')[0]

      const paramDto = {
        startDate,
        endDate,
        take: 10,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics?${param}`))
      expect(res).toBeOK()
    })

    test('QueryWithSorting', async () => {
      const paramDto = {
        sort: { count: 'desc' },
        take: 5,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics?${param}`))
      expect(res).toBeOK()
    })
  })

  describe('Error Handling', () => {
    test('InvalidDateRange', async () => {
      const res = await operatorContext.request((r) =>
        r.get('/feedback-analytics/dashboard/overview?startDate=invalid-date&endDate=invalid-date'),
      )
      expect(res).toBeOK() // Should handle gracefully
    })

    test('InvalidInterval', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/trends/analysis?interval=invalid'))
      expect(res).toBeOK() // Should handle gracefully
    })

    test('NonExistentAnalyticsId', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await operatorContext.request((r) => r.get(`/feedback-analytics/${fakeId}`))
      expect(res).toBe404()
    })
  })

  describe('Cache Behavior', () => {
    test('AnalyticsAreCached', async () => {
      const startTime = Date.now()

      // First request
      const res1 = await operatorContext.request((r) => r.get('/feedback-analytics/dashboard/overview'))
      expect(res1).toBeOK()

      // Second request (should be cached)
      const res2 = await operatorContext.request((r) => r.get('/feedback-analytics/dashboard/overview'))
      expect(res2).toBeOK()

      const endTime = Date.now()
      const totalTime = endTime - startTime

      // Should be fast due to caching
      expect(totalTime).toBeLessThan(5000) // 5 seconds
    })
  })

  describe('Test Endpoints', () => {
    test('AnalyticsTestEndpoint', async () => {
      const res = await operatorContext.request((r) => r.get('/feedback-analytics/admin/test'))
      expect(res).toBeOK()
      expect(res.body.message).toBe('Feedback Analytics module is working')
    })
  })
})

describe('FeedbackAnalyticsService', () => {
  let service: FeedbackAnalyticsService
  let prismaService: PrismaService

  const mockPrismaService = {
    feedbackAnalytics: {
      findMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    feedback: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    feedbackResponse: {
      count: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackAnalyticsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile()

    service = module.get<FeedbackAnalyticsService>(FeedbackAnalyticsService)
    prismaService = module.get<PrismaService>(PrismaService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('getFeedbackAnalytics', () => {
    it('should return analytics data', async () => {
      const mockData = [
        {
          id: '1',
          date: DateTime.now().toJSDate(),
          totalFeedbacks: 10,
          positiveFeedbacks: 6,
          negativeFeedbacks: 2,
          neutralFeedbacks: 2,
          averageRating: 4.2,
          responseRate: 80,
        },
      ]

      mockPrismaService.feedbackAnalytics.findMany.mockResolvedValue(mockData)

      const result = await service.getFeedbackAnalytics({
        startDate: DateTime.now().minus({ days: 30 }).toISO(),
        endDate: DateTime.now().toISO(),
      })

      expect(result).toBeDefined()
      expect(mockPrismaService.feedbackAnalytics.findMany).toHaveBeenCalled()
    })
  })

  describe('getDashboardOverview', () => {
    it('should return dashboard overview data', async () => {
      const startDate = DateTime.now().minus({ days: 30 }).toISO()
      const endDate = DateTime.now().toISO()

      mockPrismaService.feedback.count.mockResolvedValue(100)
      mockPrismaService.feedback.aggregate.mockResolvedValue({
        _avg: { rating: 4.2 },
        _count: { responses: 80 },
      })

      const result = await service.getDashboardOverview(startDate, endDate)

      expect(result).toBeDefined()
      expect(result.totalFeedbacks).toBe(100)
      expect(result.averageRating).toBe(4.2)
    })
  })

  describe('getSentimentAnalysis', () => {
    it('should return sentiment analysis data', async () => {
      const startDate = DateTime.now().minus({ days: 7 }).toISO()
      const endDate = DateTime.now().toISO()

      mockPrismaService.feedback.groupBy.mockResolvedValue([
        { sentiment: 'POSITIVE', _count: { id: 6 }, _avg: { confidence: 0.85 } },
        { sentiment: 'NEGATIVE', _count: { id: 2 }, _avg: { confidence: 0.75 } },
        { sentiment: 'NEUTRAL', _count: { id: 2 }, _avg: { confidence: 0.6 } },
      ])

      const result = await service.getSentimentAnalysis(startDate, endDate)

      expect(result).toBeDefined()
      expect(result.sentimentStats).toBeDefined()
    })
  })

  describe('getCategoryAnalysis', () => {
    it('should return category analysis data', async () => {
      const startDate = DateTime.now().minus({ days: 7 }).toISO()
      const endDate = DateTime.now().toISO()

      mockPrismaService.feedback.groupBy.mockResolvedValue([
        { category: 'ACADEMIC', _count: { id: 5 }, _avg: { rating: 4.0 } },
        { category: 'FACILITY', _count: { id: 3 }, _avg: { rating: 3.8 } },
        { category: 'SERVICE', _count: { id: 2 }, _avg: { rating: 4.5 } },
      ])

      const result = await service.getCategoryAnalysis(startDate, endDate)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getResponseTimeAnalysis', () => {
    it('should return response time analysis data', async () => {
      const startDate = DateTime.now().minus({ days: 30 }).toISO()
      const endDate = DateTime.now().toISO()

      const mockFeedbacks = [
        {
          id: '1',
          createdAt: DateTime.now().minus({ hours: 48 }).toJSDate(),
          responses: [
            {
              id: 'resp1',
              createdAt: DateTime.now().minus({ hours: 24 }).toJSDate(),
            },
          ],
        },
        {
          id: '2',
          createdAt: DateTime.now().minus({ hours: 24 }).toJSDate(),
          responses: [
            {
              id: 'resp2',
              createdAt: DateTime.now().minus({ hours: 2 }).toJSDate(),
            },
          ],
        },
      ]

      mockPrismaService.feedback.findMany.mockResolvedValue(mockFeedbacks)

      const result = await service.getResponseTimeAnalysis(startDate, endDate)

      expect(result).toBeDefined()
      expect(result.averageResponseTime).toBeDefined()
      expect(result.responseTimeDistribution).toBeDefined()
    })
  })

  describe('getRatingAnalysis', () => {
    it('should return rating analysis data', async () => {
      const startDate = DateTime.now().minus({ days: 30 }).toISO()
      const endDate = DateTime.now().toISO()

      mockPrismaService.feedback.groupBy.mockResolvedValue([
        { rating: 5, _count: { id: 20 } },
        { rating: 4, _count: { id: 30 } },
        { rating: 3, _count: { id: 15 } },
        { rating: 2, _count: { id: 5 } },
        { rating: 1, _count: { id: 2 } },
      ])

      mockPrismaService.feedback.aggregate.mockResolvedValue({
        _avg: { rating: 4.1 },
      })

      const result = await service.getRatingAnalysis(startDate, endDate)

      expect(result).toBeDefined()
      expect(result.ratingDistribution).toBeDefined()
      expect(result.averageRating).toBe(4.1)
    })
  })

  describe('getTrendAnalysis', () => {
    it('should return trend analysis data', async () => {
      const startDate = DateTime.now().minus({ days: 30 }).toISO()
      const endDate = DateTime.now().toISO()

      const mockTrends = [
        { createdAt: DateTime.now().minus({ days: 1 }).toJSDate(), _count: { id: 5 } },
        { createdAt: DateTime.now().minus({ days: 2 }).toJSDate(), _count: { id: 3 } },
        { createdAt: DateTime.now().minus({ days: 3 }).toJSDate(), _count: { id: 7 } },
      ]

      mockPrismaService.feedback.groupBy.mockResolvedValue(mockTrends)

      const result = await service.getTrendAnalysis(startDate, endDate)

      expect(result).toBeDefined()
      expect(result.dailyTrends).toBeDefined()
      expect(result.weeklyTrends).toBeDefined()
    })
  })

  describe('generateAnalyticsData', () => {
    it('should generate analytics data for a specific date', async () => {
      const targetDate = DateTime.now()
      const mockFeedbacks = [
        {
          id: '1',
          sentiment: 'POSITIVE',
          rating: 5,
        },
        {
          id: '2',
          sentiment: 'NEGATIVE',
          rating: 2,
        },
        {
          id: '3',
          sentiment: 'POSITIVE',
          rating: 4,
        },
      ]

      mockPrismaService.feedback.findMany.mockResolvedValue(mockFeedbacks)
      mockPrismaService.feedbackResponse.count.mockResolvedValue(2)
      mockPrismaService.feedbackAnalytics.findUnique.mockResolvedValue(null)
      mockPrismaService.feedbackAnalytics.create.mockResolvedValue({
        id: 'analytics1',
        date: targetDate.startOf('day').toJSDate(),
        totalFeedbacks: 3,
        positiveFeedbacks: 2,
        negativeFeedbacks: 1,
        neutralFeedbacks: 0,
        averageRating: 3.67,
        responseRate: 66.67,
      })

      const result = await service.generateAnalyticsData(targetDate)

      expect(result).toBeDefined()
      expect(mockPrismaService.feedbackAnalytics.create).toHaveBeenCalled()
    })
  })

  describe('getWeeklyTrends', () => {
    it('should return weekly trends data', async () => {
      const mockTrends = [
        { createdAt: DateTime.now().minus({ days: 1 }).toJSDate(), _count: { id: 5 } },
        { createdAt: DateTime.now().minus({ days: 8 }).toJSDate(), _count: { id: 3 } },
        { createdAt: DateTime.now().minus({ days: 15 }).toJSDate(), _count: { id: 7 } },
      ]

      mockPrismaService.feedback.groupBy.mockResolvedValue(mockTrends)

      const result = await service.getWeeklyTrends(4)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('getMonthlyTrends', () => {
    it('should return monthly trends data', async () => {
      const mockTrends = [
        { createdAt: DateTime.now().minus({ days: 1 }).toJSDate(), _count: { id: 5 } },
        { createdAt: DateTime.now().minus({ days: 30 }).toJSDate(), _count: { id: 3 } },
        { createdAt: DateTime.now().minus({ days: 60 }).toJSDate(), _count: { id: 7 } },
      ]

      mockPrismaService.feedback.groupBy.mockResolvedValue(mockTrends)

      const result = await service.getMonthlyTrends(12)

      expect(result).toBeDefined()
      expect(Array.isArray(result)).toBe(true)
    })
  })
})
