import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { AdministrativeProceduresFormModule } from './administrative-procedures-form.module'

describe('AdministrativeProceduresForm', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let uc: UserContextTestType

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [AdministrativeProceduresFormModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)
    uc = (await tc.createOperatorContext()).context
  })

  afterAll(async () => {
    await tc.clean()
  })

  describe('Create', () => {
    test('Create:Success', async () => {
      const payload = {
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
      const res = await uc.request((r) => r.post('/administrative-procedures-form/create')).send(payload)
      expect(res).toBeCreated()
    })
  })
})
