import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { RoomModule } from './room.module'

describe('RoomSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let uc: UserContextTestType

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [RoomModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)
    uc = (await tc.createOperatorContext()).context
  })

  afterAll(async () => {
    await tc.clean()
  })

  it('should be defined', () => {
    console.log('uc', uc)
    expect(app).toBeDefined()
  })
})
