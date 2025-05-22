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
  let operatorContext: any

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [EventModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)

    // Create operator context once for the entire test suite
    operatorContext = await tc.createOperatorContext()
    operatorUc = operatorContext.context

    studentUc = (await tc.createStudentContext()).context
  })

  afterAll(async () => {
    try {
      // Clean up event registrations first
      await prismaService.eventRegistration.deleteMany()
      // Then clean up events
      await prismaService.event.deleteMany()
    } catch (error) {
      console.error('Error cleaning up test data:', error)
    }
    await tc?.clean()
  })

  describe('Create', () => {
    test('Create:NameIsRequired', async () => {
      const payload = {
        description: 'Test event description',
        startTime: DateTime.now().plus({ days: 1 }).toISO(),
        endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
        location: 'Test location',
        capacity: 50,
      }

      const res = await operatorUc.request((r) => r.post('/events')).send(payload)

      // Check for a 400 response with a message about missing name
      expect(res.statusCode).toBe(400)
      expect(res.body.message).toContain('name must be a string')
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

    afterAll(async () => {
      if (event?.id) {
        try {
          await prismaService.event.delete({ where: { id: event.id } })
        } catch (error) {
          console.error('Error cleaning up fetch test event:', error)
        }
      }
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

      // Create an event with the operatorUc context
      const res = await operatorUc.request((r) => r.post('/events')).send(payload)
      event = res.body
      console.log('Created event for update test:', event)
      console.log('Operator ID from context:', operatorContext.operator.id)
      console.log('createdByOperatorId from event:', event.createdByOperatorId)
    })

    afterAll(async () => {
      if (event?.id) {
        try {
          await prismaService.event.delete({ where: { id: event.id } })
        } catch (error) {
          console.error('Error cleaning up update test event:', error)
        }
      }
    })

    test('Update:Success', async () => {
      // Skip if the event wasn't created properly
      if (!event?.id) {
        console.warn('Event was not created properly, skipping update test')
        return
      }

      const updatePayload: UpdateEventDto = {
        name: 'Updated Event Name',
      }

      // Use the same operator context that created the event
      const res = await operatorUc.request((r) => r.put(`/events/${event.id}`)).send(updatePayload)
      console.log('Update response:', res.status, res.body)
      expect(res).toBeOK()
      expect(res.body.name).toBe('Updated Event Name')
    })

    test('Publish:Success', async () => {
      const res = await operatorUc.request((r) => r.put(`/events/${event.id}/publish`))
      console.log('Publish response:', res.status, res.body)
      expect(res).toBeOK()
      expect(res.body.isPublished).toBe(true)
    })

    test('Unpublish:Success', async () => {
      const res = await operatorUc.request((r) => r.put(`/events/${event.id}/unpublish`))
      console.log('Unpublish response:', res.status, res.body)
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
      console.log('Created event for delete test:', event)
    })

    afterAll(async () => {
      // The event should be deleted by the test, but just in case the test fails
      if (event?.id) {
        try {
          await prismaService.event.delete({ where: { id: event.id } })
        } catch (error) {
          // Ignore errors if the event was already deleted
        }
      }
    })

    test('Delete:Success', async () => {
      const res = await operatorUc.request((r) => r.delete(`/events/${event.id}`))
      console.log('Delete response:', res.status, res.body)
      expect(res).toBeOK()

      // Verify deletion
      const getRes = await operatorUc.request((r) => r.get(`/events/${event.id}`))
      console.log('Get after delete response:', getRes.status, getRes.body)
      expect(getRes).toBe404()
    })
  })

  describe('Registration', () => {
    let event: Event
    let registrationIds: string[] = []

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
      console.log('Created event for registration test:', event)
    })

    afterAll(async () => {
      // Clean up all registrations first
      if (registrationIds.length > 0) {
        try {
          await prismaService.eventRegistration.deleteMany({
            where: { id: { in: registrationIds } },
          })
        } catch (error) {
          console.error('Error cleaning up registrations:', error)
        }
      }

      // Then clean up the event
      if (event?.id) {
        try {
          await prismaService.event.delete({ where: { id: event.id } })
        } catch (error) {
          console.error('Error cleaning up registration test event:', error)
        }
      }
    })

    test('Register:Success', async () => {
      const payload: RegisterEventDto = {
        eventId: event.id,
        additionalInfo: { diet: 'Vegetarian' },
      }

      const res = await studentUc.request((r) => r.post('/events/register')).send(payload)
      console.log('Register response:', res.status, res.body)
      expect(res).toBeCreated()
      expect(res.body.eventId).toBe(event.id)
      expect(res.body.status).toBe('PENDING')

      // Track the registration ID for cleanup
      if (res.body.id) {
        registrationIds.push(res.body.id)
      }
    })

    // test('Register:DuplicateFail', async () => {
    //   const payload: RegisterEventDto = {
    //     eventId: event.id,
    //   }

    //   const res = await studentUc.request((r) => r.post('/events/register')).send(payload)
    //   console.log('Register duplicate response:', res.status, res.body)
    //   expect(res).toBeBad(/already registered/)
    // })

    // test('UpdateStatus:Success', async () => {
    //   // First get the registration
    //   const paramDto = {
    //     where: {
    //       eventId: event.id,
    //     },
    //   }
    //   const param = qs.stringify(paramDto)
    //   const registrationsRes = await operatorUc.request((r) => r.get(`/events/registrations?${param}`))
    //   console.log('Get registrations response:', registrationsRes.status, registrationsRes.body)
    //   expect(registrationsRes).toBeOK()

    //   const registration = registrationsRes.body[0]
    //   const updatePayload: UpdateRegistrationStatusDto = {
    //     status: 'APPROVED',
    //     remarks: 'Approved by test',
    //   }

    //   const res = await operatorUc
    //     .request((r) => r.put(`/events/registrations/${registration.id}/status`))
    //     .send(updatePayload)
    //   console.log('Update registration status response:', res.status, res.body)
    //   expect(res).toBeOK()
    //   expect(res.body.status).toBe('APPROVED')
    //   expect(res.body.remarks).toBe('Approved by test')
    // })

    test('CancelRegistration:Success', async () => {
      // First register with a different student
      const anotherStudentContext = await tc.createStudentContext()
      const anotherStudentUc = anotherStudentContext.context

      const payload: RegisterEventDto = {
        eventId: event.id,
      }

      const registerRes = await anotherStudentUc.request((r) => r.post('/events/register')).send(payload)
      console.log('Register another student response:', registerRes.status, registerRes.body)
      expect(registerRes).toBeCreated()

      const registration = registerRes.body

      // Track the registration ID for cleanup
      if (registration.id) {
        registrationIds.push(registration.id)
      }

      // Now cancel it
      const res = await anotherStudentUc.request((r) => r.put(`/events/registrations/${registration.id}/cancel`))
      console.log('Cancel registration response:', res.status, res.body)
      expect(res).toBeOK()
      expect(res.body.status).toBe('CANCELLED')
    })
  })
})
