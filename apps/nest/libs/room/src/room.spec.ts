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
    await prismaService.room.deleteMany()
    await prismaService.roomTimeSlot.deleteMany()
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

  describe('Get Room With TimeSlots', () => {
    let createdRoomId: string

    beforeAll(async () => {
      const payload: CreateRoomDto = {
        name: 'Test room with timeslots',
        description: 'Test room',
        capacity: 10,
        location: 'Test location',
        type: 'EVENT',
        isAvailable: true,
      }
      const res = await uc.request((r) => r.post('/room')).send(payload)
      createdRoomId = res.body.roomId
    })

    test('GetRoomWithTimeSlots:Success', async () => {
      const res = await uc.request((r) => r.get(`/room/${createdRoomId}/with-time-slots`))
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('roomId', createdRoomId)
      expect(res.body).toHaveProperty('timeSlots')
    })

    test('GetRoomWithDetails:WithTimeSlots', async () => {
      const res = await uc.request((r) =>
        r.get(`/room/${createdRoomId}/details`).query({ includeTimeSlots: true, includeBookings: false }),
      )
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('roomId', createdRoomId)
      expect(res.body).toHaveProperty('timeSlots')
      expect(res.body).not.toHaveProperty('bookings')
    })

    test('GetRoomWithDetails:WithBookings', async () => {
      const res = await uc.request((r) =>
        r.get(`/room/${createdRoomId}/details`).query({ includeTimeSlots: false, includeBookings: true }),
      )
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('roomId', createdRoomId)
      expect(res.body).toHaveProperty('bookings')
      expect(res.body).not.toHaveProperty('timeSlots')
    })

    test('GetRoomWithTimeSlotsForToday:Success', async () => {
      const res = await uc.request((r) => r.get(`/room/${createdRoomId}/with-todays-slots`))
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('roomId', createdRoomId)
      expect(res.body).toHaveProperty('timeSlots')
      // Check if returned timeslots are for today
      const today = new Date()
      const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][today.getDay()]
      if (res.body.timeSlots.length > 0) {
        res.body.timeSlots.forEach((slot: any) => {
          expect(slot.dows).toContain(dayOfWeek)
        })
      }
    })

    test('GetRoomWithInvalidId:NotFound', async () => {
      const invalidId = '00000000-0000-0000-0000-000000000000'
      const res = await uc.request((r) => r.get(`/room/${invalidId}/with-time-slots`))
      expect(res.status).toBe(404)
    })
  })
})
