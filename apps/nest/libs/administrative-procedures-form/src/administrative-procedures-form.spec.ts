import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { AdministrativeProceduresFormModule } from './administrative-procedures-form.module'
import { CreateFormDto } from './dtos/create-form.dto'
import { UpdateFormDto } from './dtos/update-form.dto'
import { AdministrativeProceduresForm } from '@prisma/client'

describe('AdministrativeProceduresForm', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let adminUc: UserContextTestType // For admin operations
  let studentUc: UserContextTestType // For student operations
  let superAdminUc: UserContextTestType // For superadmin operations

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [AdministrativeProceduresFormModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)

    // Create different user contexts for testing
    adminUc = (await tc.createOperatorContext({ role: 'ADMIN' })).context
    superAdminUc = (await tc.createOperatorContext({ role: 'SUPERADMIN' })).context
    studentUc = (await tc.createStudentContext()).context
  })

  afterAll(async () => {
    await prismaService.administrativeProceduresForm.deleteMany()
    await tc.clean()
  })

  describe('Create', () => {
    test('Create:Success', async () => {
      const payload: CreateFormDto = {
        name: 'Test Form',
        slug: 'test-form',
        description: 'This is a test form',
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
            },
            {
              id: 2,
              title: 'What is your email?',
              type: 'text',
            },
          ],
        },
      }
      const res = await adminUc.request((r) => r.post('/official-forms/create')).send(payload)
      expect(res).toBeCreated()
      expect(res.body.name).toBe(payload.name)
    })

    test('Create:Forbidden:Student', async () => {
      const payload: CreateFormDto = {
        name: 'Student Form',
        slug: 'student-form',
        description: 'This should fail',
        type: 'PROCEDURES',
        isActive: true,
        allowEditAfterSubmit: false,
        requireApproval: false,
        data: { questions: [] },
      }
      const res = await studentUc.request((r) => r.post('/official-forms/create')).send(payload)
      expect(res).toBeForbidden()
    })
  })

  describe('Get Forms', () => {
    let activeForm: AdministrativeProceduresForm
    let inactiveForm: AdministrativeProceduresForm

    beforeAll(async () => {
      // Create an active form
      const activeRes = await adminUc
        .request((r) => r.post('/official-forms/create'))
        .send({
          name: 'Active Form',
          slug: 'active-form',
          description: 'This is an active form',
          type: 'PROCEDURES',
          isActive: true,
          allowEditAfterSubmit: false,
          requireApproval: true,
          data: { questions: [] },
        } as CreateFormDto)
      activeForm = activeRes.body

      // Create an inactive form
      const inactiveRes = await adminUc
        .request((r) => r.post('/official-forms/create'))
        .send({
          name: 'Inactive Form',
          slug: 'inactive-form',
          description: 'This is an inactive form',
          type: 'PROCEDURES',
          isActive: false,
          allowEditAfterSubmit: false,
          requireApproval: true,
          data: { questions: [] },
        } as CreateFormDto)
      inactiveForm = inactiveRes.body
    })

    test('GetPublishedForms:Student:OnlyActive', async () => {
      const res = await studentUc.request((r) => r.get('/official-forms/published'))
      expect(res).toBeOK()
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBeGreaterThan(0)
      expect(res.body.every((form: any) => form.isActive)).toBe(true)
    })

    test('GetAllForms:Admin:BothActiveAndInactive', async () => {
      const res = await adminUc.request((r) => r.get('/official-forms'))
      expect(res).toBeOK()
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBeGreaterThanOrEqual(2)
      expect(res.body.some((form: any) => !form.isActive)).toBe(true)
    })

    test('GetAllForms:Student:Forbidden', async () => {
      const res = await studentUc.request((r) => r.get('/official-forms'))
      expect(res).toBeForbidden()
    })
  })

  describe('Get Form by ID', () => {
    let testForm: AdministrativeProceduresForm

    beforeAll(async () => {
      const res = await adminUc
        .request((r) => r.post('/official-forms/create'))
        .send({
          name: 'Test Form for Get',
          slug: 'test-form-get',
          description: 'This is a test form for getting by ID',
          type: 'PROCEDURES',
          isActive: true,
          allowEditAfterSubmit: false,
          requireApproval: true,
          data: { questions: [] },
        } as CreateFormDto)
      testForm = res.body
    })

    test('GetFormById:Success', async () => {
      const res = await adminUc.request((r) => r.get(`/official-forms/${testForm.id}`))
      expect(res).toBeOK()
      expect(res.body.id).toBe(testForm.id)
      expect(res.body.name).toBe(testForm.name)
    })

    test('GetFormById:NotFound', async () => {
      const res = await adminUc.request((r) => r.get('/official-forms/00000000-0000-0000-0000-000000000000'))
      expect(res).toBeBad('Form with id 00000000-0000-0000-0000-000000000000 not found')
    })
  })

  describe('Update Form', () => {
    let testForm: AdministrativeProceduresForm

    beforeAll(async () => {
      const res = await adminUc
        .request((r) => r.post('/official-forms/create'))
        .send({
          name: 'Test Form for Update',
          slug: 'test-form-update',
          description: 'This is a test form for updating',
          type: 'PROCEDURES',
          isActive: true,
          allowEditAfterSubmit: false,
          requireApproval: true,
          data: { questions: [] },
        } as CreateFormDto)
      testForm = res.body
    })

    test('Update:Success', async () => {
      const updatePayload: UpdateFormDto = {
        description: 'Updated description',
        allowEditAfterSubmit: true,
      }
      const res = await adminUc.request((r) => r.patch(`/official-forms/${testForm.id}`)).send(updatePayload)
      expect(res).toBeOK()
      expect(res.body.description).toBe(updatePayload.description)
      expect(res.body.allowEditAfterSubmit).toBe(updatePayload.allowEditAfterSubmit)
    })

    test('Update:Student:Forbidden', async () => {
      const res = await studentUc
        .request((r) => r.patch(`/official-forms/${testForm.id}`))
        .send({ description: 'Should fail' })
      expect(res).toBeForbidden()
    })
  })

  describe('Delete Form', () => {
    let testForm: AdministrativeProceduresForm

    beforeAll(async () => {
      const res = await adminUc
        .request((r) => r.post('/official-forms/create'))
        .send({
          name: 'Test Form for Delete',
          slug: 'test-form-delete',
          description: 'This is a test form for deleting',
          type: 'PROCEDURES',
          isActive: true,
          allowEditAfterSubmit: false,
          requireApproval: true,
          data: { questions: [] },
        } as CreateFormDto)
      testForm = res.body
    })

    test('Delete:Admin:Forbidden', async () => {
      const res = await adminUc.request((r) => r.delete(`/official-forms/${testForm.id}`))
      expect(res).toBeForbidden()
    })

    test('Delete:SuperAdmin:Success', async () => {
      const res = await tc.requestSuperAdmin((r) => r.delete(`/official-forms/${testForm.id}`))
      expect(res).toBeNoContent()

      // Verify deletion
      const getRes = await adminUc.request((r) => r.get(`/official-forms/${testForm.id}`))
      expect(getRes).toBeBad(`Form with id ${testForm.id} not found`)
    })
  })

  describe('Activate/Deactivate Form', () => {
    let testForm: AdministrativeProceduresForm

    beforeAll(async () => {
      const res = await adminUc
        .request((r) => r.post('/official-forms/create'))
        .send({
          name: 'Test Form for Status',
          slug: 'test-form-status',
          description: 'This is a test form for status changes',
          type: 'PROCEDURES',
          isActive: false,
          allowEditAfterSubmit: false,
          requireApproval: true,
          data: { questions: [] },
        } as CreateFormDto)
      testForm = res.body
    })

    test('Activate:Success', async () => {
      const res = await adminUc.request((r) => r.patch(`/official-forms/${testForm.id}/activate`))
      expect(res).toBeOK()
      expect(res.body.isActive).toBe(true)
    })

    test('Deactivate:Success', async () => {
      const res = await adminUc.request((r) => r.patch(`/official-forms/${testForm.id}/deactivate`))
      expect(res).toBeOK()
      expect(res.body.isActive).toBe(false)
    })

    test('Activate:Student:Forbidden', async () => {
      const res = await studentUc.request((r) => r.patch(`/official-forms/${testForm.id}/activate`))
      expect(res).toBeForbidden()
    })
  })
})
