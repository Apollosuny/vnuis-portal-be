import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { SubmitDto } from './dtos/submit.dto'
import { AdministrativeProceduresFormSubmissionModule } from './administrative-procedures-form-submission.module'
import { AdministrativeProceduresFormModule } from '@app/administrative-procedures-form'
import { CreateFormDto } from '@app/administrative-procedures-form/dtos/create-form.dto'
import { AdministrativeProceduresForm } from '@prisma/client'

describe('AdministrativeProceduresFormSubmissionSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let studentUc: UserContextTestType
  let operatorUc: UserContextTestType
  let form: AdministrativeProceduresForm

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [AdministrativeProceduresFormSubmissionModule, AdministrativeProceduresFormModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)

    // Create an operator account for creating forms
    const operatorCtx = await tc.createOperatorContext()
    operatorUc = operatorCtx.context

    // Create a student account for submitting forms
    const studentCtx = await tc.createStudentContext()
    studentUc = studentCtx.context

    // Create a form for testing
    const formPayload: CreateFormDto = {
      name: 'Test Form for Submission',
      slug: 'test-form-submission',
      description: 'A test form for testing submissions',
      type: 'PROCEDURES',
      isActive: true,
      fileUrl: 'https://example.com/form.pdf',
      allowEditAfterSubmit: false,
      requireApproval: true,
      data: {
        questions: [
          {
            id: 1,
            title: 'What is your name?',
            type: 'text',
            answers: [],
          },
          {
            id: 2,
            title: 'Select your options:',
            type: 'multiple-choice',
            answers: [
              {
                id: 1,
                type: 'option',
                content: 'Option A',
              },
              {
                id: 2,
                type: 'option',
                content: 'Option B',
              },
              {
                id: 3,
                type: 'option',
                content: 'Option C',
              },
            ],
          },
          {
            id: 3,
            title: 'Additional comments:',
            type: 'textarea',
            answers: [],
          },
        ],
      },
    }

    // Create a form using the operator account
    const formRes = await operatorUc.request((r) => r.post('/official-forms/create')).send(formPayload)
    expect(formRes).toBeCreated()
    form = formRes.body

    // Debug: Print out the form ID to check its format
    console.log('Created form with ID:', form.id)
    console.log('Form ID type:', typeof form.id)
  })

  afterAll(async () => {
    await prismaService.administrativeProceduresFormSubmission.deleteMany()
    await prismaService.administrativeProceduresForm.deleteMany()
    await tc.clean()
  })

  describe('FormSubmission', () => {
    test('Submit:Success', async () => {
      // Prepare submission payload with answers that match form structure
      const payload: SubmitDto = {
        result: {
          '1': {
            value: 'John Doe', // Text response for question 1
          },
          '2': {
            '1': false,
            '2': true, // Selected option B
            '3': false,
          },
          '3': {
            value: 'This is my additional comment', // Text area response for question 3
          },
        },
      }

      // Submit the form
      const res = await studentUc.request((r) => r.post(`/official-forms-submissions/${form.id}/submit`)).send(payload)

      expect(res).toBeCreated()
      expect(res.body).toHaveProperty('id')
      expect(res.body).toHaveProperty('formId', form.id)
      expect(res.body).toHaveProperty('status', 'PENDING')
      // expect(res.body.result).toEqual(payload.result)
    })

    test('Submit:FormNotFound', async () => {
      const payload: SubmitDto = {
        result: {
          '1': { value: 'Test answer' },
        },
      }

      const res = await studentUc
        .request((r) => r.post('/official-forms-submissions/non-existent-id/submit'))
        .send(payload)

      // Expect 404 Not Found for non-existent form IDs
      expect(res.status).toBe(404)
      expect(res.body.message).toMatch(/not found/)
    })

    test('Submit:InvalidResult', async () => {
      // Missing required result data
      const res = await studentUc.request((r) => r.post(`/official-forms-submissions/${form.id}/submit`)).send({})

      expect(res).toBeBad(/result/)
    })
  })
})
