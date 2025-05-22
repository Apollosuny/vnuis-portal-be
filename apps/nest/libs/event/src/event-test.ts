import { TestContext, testHelper } from '@app/spec'
import { PrismaService } from 'nestjs-prisma'
import { EventModule } from './event.module'
import { CreateEventDto } from './dtos/create-event.dto'
import { DateTime } from 'luxon'

async function testEvent() {
  console.log('Starting event test')
  const tc = await testHelper.createContext({
    imports: [EventModule],
  })

  const prismaService = tc.app.get(PrismaService)
  const operatorContext = await tc.createOperatorContext()
  const operatorUc = operatorContext.context
  const operator = operatorContext.operator

  console.log('Created operator:', operator)

  try {
    // Create an event
    const payload: CreateEventDto = {
      name: 'Test Event',
      description: 'Test description',
      startTime: DateTime.now().plus({ days: 1 }).toISO(),
      endTime: DateTime.now().plus({ days: 1, hours: 2 }).toISO(),
      location: 'Test location',
      capacity: 50,
    }

    const createRes = await operatorUc.request((r) => r.post('/events')).send(payload)
    console.log('Create event response:', createRes.status)
    console.log('Created event:', createRes.body)

    const eventId = createRes.body.id

    // Query directly from the database to check
    const dbEvent = await prismaService.event.findUnique({
      where: { id: eventId },
    })
    console.log('Event from database:', dbEvent)

    // Try to update the event
    const updateRes = await operatorUc.request((r) => r.put(`/events/${eventId}`)).send({ name: 'Updated Event Name' })

    console.log('Update event response:', updateRes.status)
    console.log('Updated event:', updateRes.body)
  } catch (error) {
    console.error('Test error:', error)
  } finally {
    await prismaService.event.deleteMany()
    await tc.clean()
  }
}

testEvent().catch(console.error)
