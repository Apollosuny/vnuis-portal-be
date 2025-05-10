import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { RoomTimeSlotModule } from './room-time-slot.module'
import { RoomModule } from '@app/room'
import { RoomEntity } from '@app/room/entities/room.entity'
import { CreateTimeSlotDto } from './dtos/create-time-slot.dto'
import { DateTime } from 'luxon'

const generateRandomName = (): string => {
  return `Test Room ${Math.floor(Math.random() * 10000)}`
}

describe('RoomTimeSlotSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let room: RoomEntity
  let uc: UserContextTestType

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [RoomTimeSlotModule, RoomModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)
    uc = (await tc.createOperatorContext()).context
    room = await prismaService.room.create({
      data: {
        name: generateRandomName(),
        description: 'Test room',
        capacity: 10,
        location: 'Test location',
        type: 'EVENT',
        isAvailable: true,
      },
    })
  })

  afterAll(async () => {
    await tc.clean()
  })

  describe('Create', () => {
    test('Create:Success', async () => {
      const payload: CreateTimeSlotDto = {
        roomId: room.roomId,
        timeRange: [
          {
            startTime: DateTime.fromFormat('2023-10-01 09:00', 'yyyy-MM-dd HH:mm').toISO(),
            endTime: DateTime.fromFormat('2023-10-01 17:00', 'yyyy-MM-dd HH:mm').toISO(),
            dows: ['mon', 'tue', 'wed', 'thu', 'fri'],
          },
        ],
      }
      const res = await uc.request((r) => r.post('/room-time-slot/create')).send(payload)
      expect(res).toBeCreated()
    })
  })

  describe('Fetch', () => {
    test('FetchAvailableTime', async () => {
      // const date = '2025-04-08T00:00:00.000Z'
      const date = DateTime.fromFormat('2025-04-08', 'yyyy-MM-dd').toUTC().toISO()
      const offset = DateTime.now().offset.toString()
      const res = await tc.request().get(`/room-time-slot/${room.roomId}?date=${date}&offset=${offset}`)
      expect(res).toBeOK()
      expect(res.body).toBeInstanceOf(Array)
      expect(res.body.length).toBeGreaterThan(0)
    })
  })
})
