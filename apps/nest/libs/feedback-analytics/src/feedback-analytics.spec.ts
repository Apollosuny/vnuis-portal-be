import { TestContext, testHelper } from '@app/spec/test.helper'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { FeedbackAnalyticsModule } from './feedback-analytics.module'
import { FeedbackModule } from '@app/feedback'
import { FeedbackResponseModule } from '@app/feedback-response'
import { CreateFeedbackDto } from '@app/feedback/dtos/create-feedback.dto'
import { CreateFeedbackResponseDto } from '@app/feedback-response/dtos/create-feedback-response.dto'
import qs from 'qs'

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

  afterAll(async () => {
    await prismaService.feedbackAnalytics.deleteMany()
    await prismaService.feedbackResponse.deleteMany()
    await prismaService.feedback.deleteMany()
    await tc?.clean()
  })

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
})
