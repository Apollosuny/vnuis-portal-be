import { FeedbackService } from '@app/feedback'
import { FeedbackResponseService } from './feedback-response.service'
import { TestContext, testHelper } from '@app/spec/test.helper'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFeedbackDto } from '@app/feedback/dtos/create-feedback.dto'
import { FeedbackModule } from '@app/feedback'
import { FeedbackResponseModule } from './feedback-response.module'
import { CreateFeedbackResponseDto } from './dtos/create-feedback-response.dto'
import { UpdateFeedbackResponseDto } from './dtos/update-feedback-response.dto'
import qs from 'qs'

describe('Feedback & FeedbackResponse Integration Spec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let studentContext: any
  let operatorContext: any

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [FeedbackModule, FeedbackResponseModule],
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
    // Clean up in correct order to avoid foreign key constraints
    await prismaService.feedbackResponse.deleteMany()
    await prismaService.feedback.deleteMany()
    await tc?.clean()
  })

  describe('Feedback CRUD Operations', () => {
    test('Create:TitleIsRequired', async () => {
      const res = await studentContext.request((r) => r.post('/feedback')).send({} as CreateFeedbackDto)
      expect(res).toBeBad(/title should not be empty/)
    })

    test('Create:ContentIsRequired', async () => {
      const res = await studentContext.request((r) => r.post('/feedback')).send({ title: 'Test' } as CreateFeedbackDto)
      expect(res).toBeBad(/content should not be empty/)
    })

    test('Create:CategoryIsRequired', async () => {
      const res = await studentContext
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test',
          content: 'Test content',
        } as CreateFeedbackDto)
      expect(res).toBeBad(/category must be one of the following values/)
    })

    test('Create:Success', async () => {
      const res = await studentContext
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
      const res = await studentContext.request((r) => r.get(`/feedback?${param}`))
      expect(res).toBeOK()
      expect(res.body.length).toBeGreaterThan(0)
    })
  })

  describe('FeedbackResponse CRUD Operations', () => {
    let feedback: any
    let feedbackResponse: any

    beforeAll(async () => {
      // Create a feedback first
      const feedbackRes = await studentContext
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback for Response',
          content: 'This is a test feedback for response testing',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      feedback = feedbackRes.body
    })

    test('CreateResponse:ContentIsRequired', async () => {
      const res = await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}/responses`))
        .send({} as CreateFeedbackResponseDto)
      expect(res).toBeBad(/content should not be empty/)
    })

    test('CreateResponse:Success', async () => {
      const res = await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}/responses`))
        .send({
          content: 'Thank you for your feedback. We will review it.',
          isInternal: false,
        } as CreateFeedbackResponseDto)
      expect(res).toBeCreated()
      expect(res.body.content).toBe('Thank you for your feedback. We will review it.')
      expect(res.body.isInternal).toBe(false)
      feedbackResponse = res.body
    })

    test('GetFeedbackResponse', async () => {
      const res = await operatorContext.request((r) => r.get(`/feedback-response/${feedbackResponse.id}`))
      expect(res).toBeOK()
      expect(res.body.id).toBe(feedbackResponse.id)
    })

    test('UpdateFeedbackResponse:Success', async () => {
      const res = await operatorContext
        .request((r) => r.put(`/feedback-response/${feedbackResponse.id}`))
        .send({
          content: 'Updated response content',
        } as UpdateFeedbackResponseDto)
      expect(res).toBeOK()
      expect(res.body.content).toBe('Updated response content')
    })

    test('GetResponsesByFeedbackId', async () => {
      const res = await operatorContext.request((r) => r.get(`/feedback-response/feedback/${feedback.id}/responses`))
      expect(res).toBeOK()
      expect(res.body.length).toBeGreaterThan(0)
    })

    test('GetResponsesByFeedbackId:IncludeInternal', async () => {
      // Create an internal response
      await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}/responses`))
        .send({
          content: 'Internal note for admin',
          isInternal: true,
        } as CreateFeedbackResponseDto)

      // Get responses including internal ones
      const res = await operatorContext.request((r) =>
        r.get(`/feedback-response/feedback/${feedback.id}/responses?includeInternal=true`),
      )
      expect(res).toBeOK()
      expect(res.body.length).toBeGreaterThan(1)
    })

    test('GetResponsesByFeedbackId:ExcludeInternal', async () => {
      // Get responses excluding internal ones
      const res = await operatorContext.request((r) => r.get(`/feedback-response/feedback/${feedback.id}/responses`))
      expect(res).toBeOK()
      // Should only return public responses
      const publicResponses = res.body.filter((r: any) => !r.isInternal)
      expect(publicResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Feedback & Response Integration', () => {
    let feedback: any

    beforeAll(async () => {
      // Create a feedback
      const feedbackRes = await studentContext
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Integration Test Feedback',
          content: 'This is for integration testing',
          category: 'USER_EXPERIENCE',
        } as CreateFeedbackDto)
      feedback = feedbackRes.body
    })

    test('StudentCanCreateFeedback', async () => {
      const res = await studentContext
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Student Feedback',
          content: 'Student can create feedback',
          category: 'GENERAL',
        } as CreateFeedbackDto)
      expect(res).toBeCreated()
      expect(res.body.studentId).toBeDefined()
    })

    test('OperatorCanRespondToFeedback', async () => {
      const res = await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}/responses`))
        .send({
          content: 'Operator response to student feedback',
          isInternal: false,
        } as CreateFeedbackResponseDto)
      expect(res).toBeCreated()
      expect(res.body.operatorId).toBeDefined()
    })

    test('OperatorCanCreateInternalNote', async () => {
      const res = await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedback.id}/responses`))
        .send({
          content: 'Internal note for admin team',
          isInternal: true,
        } as CreateFeedbackResponseDto)
      expect(res).toBeCreated()
      expect(res.body.isInternal).toBe(true)
    })

    test('StudentCanViewPublicResponses', async () => {
      const res = await studentContext.request((r) => r.get(`/feedback-response/feedback/${feedback.id}/responses`))
      expect(res).toBeOK()
      // Should only see public responses
      const publicResponses = res.body.filter((r: any) => !r.isInternal)
      expect(publicResponses.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    test('CreateResponse:FeedbackNotFound', async () => {
      const fakeFeedbackId = '00000000-0000-0000-0000-000000000000'
      const res = await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${fakeFeedbackId}/responses`))
        .send({
          content: 'Test response',
          isInternal: false,
        } as CreateFeedbackResponseDto)
      expect(res).toBeBad(/Feedback not found/)
    })

    test('UpdateResponse:NotAuthorized', async () => {
      // Create a response
      const feedbackRes = await studentContext
        .request((r) => r.post('/feedback'))
        .send({
          title: 'Test Feedback',
          content: 'Test content',
          category: 'GENERAL',
        } as CreateFeedbackDto)

      const responseRes = await operatorContext
        .request((r) => r.post(`/feedback-response/feedback/${feedbackRes.body.id}/responses`))
        .send({
          content: 'Test response',
          isInternal: false,
        } as CreateFeedbackResponseDto)

      // Try to update with different operator (should fail)
      const res = await studentContext
        .request((r) => r.put(`/feedback-response/${responseRes.body.id}`))
        .send({
          content: 'Unauthorized update',
        } as UpdateFeedbackResponseDto)
      expect(res).toBeBad(/Operator not found for this user/)
    })
  })

  describe('Query Operations', () => {
    test('QueryFeedbackResponses', async () => {
      const paramDto = {
        where: {
          isInternal: false,
        },
        include: ['operator'],
        take: 5,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorContext.request((r) => r.get(`/feedback-response?${param}`))
      expect(res).toBeOK()
    })

    test('GetResponsesByOperator', async () => {
      // Get operator ID from the context
      const operatorRes = await operatorContext.request((r) => r.get('/feedback-response'))
      if (operatorRes.body.length > 0) {
        const operatorId = operatorRes.body[0].operatorId
        const res = await operatorContext.request((r) => r.get(`/feedback-response/operator/${operatorId}`))
        expect(res).toBeOK()
      }
    })
  })
})
