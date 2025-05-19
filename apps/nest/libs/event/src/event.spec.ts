import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { EventModule } from './event.module'
import { CreateEventDto } from './dtos/create-event.dto'
import { Event } from '@prisma/client'
import { UpdateEventDto } from './dtos/update-event.dto'
import { RegisterEventDto } from './dtos/register-event.dto'
import { UpdateRegistrationStatusDto } from './dtos/update-registration-status.dto'
import qs from 'qs'
import { DateTime } from 'luxon'

describe('EventSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let operatorUc: UserContextTestType
  let studentUc: UserContextTestType

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [EventModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)
    operatorUc = (await tc.createOperatorContext()).context
    studentUc = (await tc.createStudentContext()).context
  })

  afterAll(async () => {
    await tc?.clean()
  })

  describe('Create', () => {
    test('Create:NameIsRequired', async () => {
      const payload: CreateEventDto = {
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
      } as CreateEventDto

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      expect(res).toBeBad(/name should not be empty/)
    })

    test('Create:Success', async () => {
      const payload: CreateEventDto = {
        name: 'Test Event',
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
      }

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      expect(res).toBeCreated()
      expect(res.body.name).toBe('Test Event')
      expect(res.body.description).toBe('Test event description')
    })
  })

  describe('Fetch', () => {
    let event: Event
    beforeAll(async () => {
      const payload: CreateEventDto = {
        name: 'Test Event for Fetch',
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
      }

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      event = res.body
    })

    test('GetEvent', async () => {
      const res = await operatorUc.request((r) => r.get(`/events/${event.id}`))
      expect(res).toBeOK()
      expect(res.body.id).toBe(event.id)
    })

    test('GetEvents', async () => {
      const paramDto = {
        where: {
          id: {
            equals: event.id,
          },
        },
        include: ['createdBy'],
        take: 10,
      }
      const param = qs.stringify(paramDto)
      const res = await operatorUc.request((r) => r.get(`/events?${param}`))
      expect(res).toBeOK()
      expect(res.body.length).toBeGreaterThan(0)
      expect(res.body[0].createdBy).toBeDefined()
    })
  })

  describe('Update', () => {
    let event: Event
    beforeAll(async () => {
      const payload: CreateEventDto = {
        name: 'Test Event for Update',
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
      }

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      event = res.body
    })

    test('Update:Success', async () => {
      const updatePayload: UpdateEventDto = {
        name: 'Updated Event Name',
      }

      const res = await operatorUc.request((r) => r.put(`/events/${event.id}`)).send(updatePayload)
      expect(res).toBeOK()
      expect(res.body.name).toBe('Updated Event Name')
    })

    test('Publish:Success', async () => {
      const res = await operatorUc.request((r) => r.put(`/events/${event.id}/publish`))
      expect(res).toBeOK()
      expect(res.body.isPublished).toBe(true)
    })

    test('Unpublish:Success', async () => {
      const res = await operatorUc.request((r) => r.put(`/events/${event.id}/unpublish`))
      expect(res).toBeOK()
      expect(res.body.isPublished).toBe(false)
    })
  })

  describe('Delete', () => {
    let event: Event
    beforeAll(async () => {
      const payload: CreateEventDto = {
        name: 'Test Event for Delete',
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
      }

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      event = res.body
    })

    test('Delete:Success', async () => {
      const res = await operatorUc.request((r) => r.delete(`/events/${event.id}`))
      expect(res).toBeOK()

      // Verify deletion
      const getRes = await operatorUc.request((r) => r.get(`/events/${event.id}`))
      expect(getRes).toBe404()
    })
  })

  describe('Registration', () => {
    let event: Event

    beforeAll(async () => {
      const payload: CreateEventDto = {
        name: 'Test Event for Registration',
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
        isPublished: true,
      }

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      event = res.body
    })

    test('Register:Success', async () => {
      const payload: RegisterEventDto = {
        eventId: event.id,
        additionalInfo: { diet: 'Vegetarian' },
      }

      const res = await studentUc.request((r) => r.post('/events/register')).send(payload)
      expect(res).toBeCreated()
      expect(res.body.eventId).toBe(event.id)
      expect(res.body.status).toBe('PENDING')
    })

    test('Register:DuplicateFail', async () => {
      const payload: RegisterEventDto = {
        eventId: event.id,
      }

      const res = await studentUc.request((r) => r.post('/events/register')).send(payload)
      expect(res).toBeBad(/already registered/)
    })

    test('UpdateStatus:Success', async () => {
      // First get the registration
      const paramDto = {
        where: {
          eventId: event.id,
        },
      }
      const param = qs.stringify(paramDto)
      const registrationsRes = await operatorUc.request((r) => r.get(`/events/registrations?${param}`))
      expect(registrationsRes).toBeOK()

      const registration = registrationsRes.body[0]
      const updatePayload: UpdateRegistrationStatusDto = {
        status: 'APPROVED',
        remarks: 'Approved by test',
      }

      const res = await operatorUc
        .request((r) => r.put(`/events/registrations/${registration.id}/status`))
        .send(updatePayload)

      expect(res).toBeOK()
      expect(res.body.status).toBe('APPROVED')
      expect(res.body.remarks).toBe('Approved by test')
    })

    test('CancelRegistration:Success', async () => {
      // First register with a different student
      const anotherStudentUc = (await tc.createStudentContext()).context

      const payload: RegisterEventDto = {
        eventId: event.id,
      }

      const registerRes = await anotherStudentUc.request((r) => r.post('/events/register')).send(payload)
      expect(registerRes).toBeCreated()

      const registration = registerRes.body

      // Now cancel it
      const res = await anotherStudentUc.request((r) => r.put(`/events/registrations/${registration.id}/cancel`))
      expect(res).toBeOK()
      expect(res.body.status).toBe('CANCELLED')
    })
  })
})
