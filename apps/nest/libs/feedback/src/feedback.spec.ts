import { TestContext, testHelper, UserContextTestType } from '@app/spec/test.helper'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFeedbackDto } from './dtos/create-feedback.dto'
import { FeedbackModule } from './feedback.module'
import { FeedbackResponseModule } from '@app/feedback-response/feedback-response.module'
import { FeedbackAnalyticsModule } from '@app/feedback-analytics/feedback-analytics.module'
import qs from 'qs'
import { UpdateFeedbackDto } from './dtos/update-feedback.dto'
import { CreateFeedbackResponseDto } from './dtos/create-feedback-response.dto'

describe('FeedbackSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let studentUc: any
  let operatorUc: any

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [FeedbackModule, FeedbackResponseModule, FeedbackAnalyticsModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)

    // Create a student user and login
    const studentContext = await tc.createStudentContext()
    studentUc = tc.buildUserContext(studentContext.tokenInfo)

    // Create an operator user and login for admin operations
    const operatorContext = await tc.createOperatorContext()
    operatorUc = tc.buildUserContext(operatorContext.tokenInfo)
  })

  afterAll(async () => {
    // Clean up in correct order to avoid foreign key constraints
    await prismaService.feedbackResponse.deleteMany()
    await prismaService.feedbackAnalytics.deleteMany()
    await prismaService.feedback.deleteMany()
    await tc?.clean()
  })

  describe('Create', () => {
    test('Create:TitleIsRequired', async () => {
      const res = await studentUc.request((r) => r.post('/feedback')).send({} as CreateFeedbackDto)
      expect(res).toBeBad(/title should not be empty/)
    })
    test('Create:ContentIsRequired', async () => {
      const res = await studentUc.request((r) => r.post('/feedback')).send({ title: 'Test' } as CreateFeedbackDto)
      expect(res).toBeBad(/content should not be empty/)
    })
    test('Create:CategoryIsRequired', async () => {
      const res = await studentUc
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test',
          content: 'Test content',
        } as CreateFeedbackDto)
      expect(res).toBeBad(/category must be one of the following values/)
    })
    test('Create:Success', async () => {
      const res = await studentUc
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback',
          content: 'This is a test feedback',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      expect(res).toBeCreated()
      expect(res.body.title).toBe('Test Feedback')
      expect(res.body.content).toBe('This is a test feedback')
      expect(res.body.category).toBe('GENERAL')
    })
  })

  describe('Fetch', () => {
    let feedback: any
    beforeAll(async () => {
      const res = await studentUc
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback',
          content: 'This is a test feedback',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      feedback = res.body
    })
    test('GetFeedback', async () => {
      const res = await studentUc.request((r) => r.get(`/feedback/${feedback.id}`))
      expect(res).toBeOK()
      expect(res.body.id).toBe(feedback.id)
    })
    test('GetFeedbacks', async () => {
      const paramDto = {
        where: {
          title: {
            startsWith: 'Test',
          },
        },
        include: ['student'],
        take: 3,
      }
      const param = qs.stringify(paramDto)
      const res = await studentUc.request((r) => r.get(`/feedback?${param}`))
      expect(res).toBeOK()
      expect(res.body.length).toBeGreaterThan(0)
    })
  })

  describe('Update', () => {
    let feedback: any
    beforeAll(async () => {
      const res = await studentUc
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback',
          content: 'This is a test feedback',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      feedback = res.body
    })
    test('Update:Success', async () => {
      const res = await studentUc
        .request((r) => r.put(`/feedback/${feedback.id}`))
        .send({
          title: 'Updated Feedback',
        } as UpdateFeedbackDto)
      expect(res).toBeOK()
      const newFeedbackRes = await studentUc.request((r) => r.get(`/feedback/${feedback.id}`))
      expect(newFeedbackRes.body.title).toBe('Updated Feedback')
    })
  })

  describe('Delete', () => {
    let feedback: any
    beforeAll(async () => {
      const res = await studentUc
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback',
          content: 'This is a test feedback',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      feedback = res.body
    })
    test('Delete:Success', async () => {
      const res = await studentUc.request((r) => r.delete(`/feedback/${feedback.id}`))
      expect(res).toBeOK()
      const newFeedbackRes = await studentUc.request((r) => r.get(`/feedback/${feedback.id}`))
      expect(newFeedbackRes).toBe404()
    })
  })

  describe('Admin Operations', () => {
    let feedback: any
    beforeAll(async () => {
      const res = await studentUc
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback',
          content: 'This is a test feedback',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      feedback = res.body
    })

    test('UpdateStatus:Success', async () => {
      const res = await operatorUc
        .request((r) => r.patch(`/feedback/${feedback.id}/status`))
        .send({
          status: 'UNDER_REVIEW',
        })
      expect(res).toBeOK()
      expect(res.body.status).toBe('UNDER_REVIEW')
    })

    test('CreateResponse:Success', async () => {
      const res = await operatorUc
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}/responses`))
        .send({
          content: 'Thank you for your feedback',
          isInternal: false,
        } as CreateFeedbackResponseDto)
      expect(res).toBeCreated()
      expect(res.body.content).toBe('Thank you for your feedback')
    })

    test('GetStats:Success', async () => {
      const res = await operatorUc.request((r) => r.get('/feedback-analytics/stats'))
      expect(res).toBeOK()
    })
  })
})
