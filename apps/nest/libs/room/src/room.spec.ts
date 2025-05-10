import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { RoomModule } from './room.module'
import { CreateRoomDto } from './dtos/create-room.dto'

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

  describe('Create', () => {
    test('Create:NameIsRequired', async () => {
      const payload: CreateRoomDto = {
        name: '',
        description: 'Test room',
        capacity: 10,
        location: 'Test location',
        type: 'EVENT',
        isAvailable: true,
      }
      const res = await uc.request((r) => r.post('/room')).send(payload)
      expect(res).toBeBad('name should not be empty')
    })

    test('Create:Success', async () => {
      const payload: CreateRoomDto = {
        name: 'Test room',
        description: 'Test room',
        capacity: 10,
        location: 'Test location',
        type: 'EVENT',
        isAvailable: true,
      }
      const res = await uc.request((r) => r.post('/room')).send(payload)
      expect(res).toBeCreated()
      expect(res.body).toMatchObject({
        name: payload.name,
        description: payload.description,
        capacity: payload.capacity,
        location: payload.location,
        type: payload.type,
        isAvailable: payload.isAvailable,
      })
    })
  })
})
