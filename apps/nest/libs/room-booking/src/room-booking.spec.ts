import { TestContext, testHelper, UserContextTestType } from '@app/spec'
import { INestApplication } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateRoomBookingDto } from './dtos/create-room-booking.dto'
import { RoomBookingModule } from './room-booking.module'
import { UpdateRoomBookingDto } from './dtos/update-room-booking.dto'
import { HandleRoomBookingDto } from './dtos/handle-room-booking.dto'
import { RoomBooking, RoomBookingStatus } from '@prisma/client'
import qs from 'qs'

describe('RoomBookingSpec', () => {
  let tc: TestContext
  let app: INestApplication
  let prismaService: PrismaService
  let studentUc: UserContextTestType
  let adminUc: UserContextTestType

  beforeAll(async () => {
    tc = await testHelper.createContext({
      imports: [RoomBookingModule],
    })
    app = tc.app
    prismaService = app.get(PrismaService)

    // Create student context
    const studentContext = await tc.createStudentContext()
    studentUc = studentContext.context

    // Create admin context
    const adminContext = await tc.createOperatorContext({ role: 'ADMIN' })
    adminUc = adminContext.context
  })

  afterAll(async () => await tc?.clean())

  describe('Create', () => {
    // Create a test room for the Create tests with a unique name
    let testRoom

    beforeAll(async () => {
      testRoom = await prismaService.room.create({
        data: {
          name: `Test Room Create ${Date.now()}`,
          description: 'A test room for create operations',
          capacity: 30,
          location: 'Building A',
          type: 'CLASSROOM',
          isAvailable: true,
        },
      })
    })

    test('Create:PurposeIsRequired', async () => {
      // Arrange
      const invalidDto = {
        startTime: new Date('2025-06-04T09:00:00Z'),
        duration: 2,
        isRecurring: false,
        roomId: 'room1',
        offset: '0',
      } as CreateRoomBookingDto

      // Act & Assert
      const res = await studentUc.request((r) => r.post('/room-booking/create')).send(invalidDto)
      expect(res).toBeBad(/purpose should not be empty/)
    })

    test('Create:Success', async () => {
      // Arrange - use the previously created room
      const room = testRoom

      const createDto = {
        startTime: new Date('2025-06-04T09:00:00Z'),
        duration: 2,
        purpose: 'Study group meeting',
        isRecurring: false,
        roomId: room.roomId,
        offset: '0',
      } as CreateRoomBookingDto

      // Act
      const res = await studentUc.request((r) => r.post('/room-booking/create')).send(createDto)

      // Assert
      expect(res.status).toBe(201) // Use explicit status check instead of toBeCreated()
      expect(res.body.purpose).toBe('Study group meeting')
      expect(res.body.roomId).toBe(room.roomId)
      expect(res.body.status).toBe(RoomBookingStatus.PENDING)
    })
  })

  describe('Fetch', () => {
    // Define a valid UUID for testing
    const testBookingId = '12345678-1234-1234-1234-123456789012'
    let bookingData: RoomBooking

    beforeAll(async () => {
      // Create a test room with unique name
      const room = await prismaService.room.create({
        data: {
          name: `Test Room for Fetch ${Date.now()}`,
          description: 'A test room for fetch operations',
          capacity: 30,
          location: 'Building A',
          type: 'CLASSROOM',
          isAvailable: true,
        },
      })

      // Create a booking directly in the database with our test ID
      bookingData = await prismaService.roomBooking.create({
        data: {
          id: testBookingId,
          purpose: 'Test booking for fetch',
          startTime: new Date('2025-06-04T09:00:00Z'),
          endTime: new Date('2025-06-04T11:00:00Z'),
          duration: 2,
          isRecurring: false,
          status: RoomBookingStatus.PENDING,
          roomId: room.roomId,
          studentId: (await studentUc.request((r) => r.get('/me'))).body.id,
        },
      })

      // We've already created the booking directly in the database, no need to create via API
      // We'll use the testBookingId for all tests in this suite
    })

    test('GetBooking', async () => {
      // Act
      const res = await studentUc.request((r) => r.get(`/room-booking/${testBookingId}`))

      // Assert
      expect(res.status).toBe(200) // Use explicit status check instead of toBeOK()
      expect(res.body.id).toBe(testBookingId)
    })

    test('GetMyBookings', async () => {
      // Act
      const res = await studentUc.request((r) => r.get('/room-booking/my-bookings'))

      // Assert
      expect(res.status).toBe(200) // Use explicit status check instead of toBeOK()
      // Adding null checks for response body
      expect(res.body && res.body.data && Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.meta).toHaveProperty('total')
    })

    test('GetAllBookings:Admin', async () => {
      // Arrange
      const paramDto = {
        startDate: '2025-06-01',
        endDate: '2025-06-30',
        status: RoomBookingStatus.PENDING,
      }
      const param = qs.stringify(paramDto)

      // Act
      const res = await adminUc.request((r) => r.get(`/room-booking?${param}`))

      // Assert
      expect(res).toBeOK()
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('Update', () => {
    // Define a valid UUID for testing
    const testBookingId = '22345678-1234-1234-1234-123456789012'
    let bookingData: RoomBooking

    beforeAll(async () => {
      // Create a test room with unique name
      const room = await prismaService.room.create({
        data: {
          name: `Test Room for Update ${Date.now()}`,
          description: 'A test room for update operations',
          capacity: 25,
          location: 'Building B',
          type: 'CLASSROOM',
          isAvailable: true,
        },
      })

      // Create a booking directly in the database with our test ID
      bookingData = await prismaService.roomBooking.create({
        data: {
          id: testBookingId,
          purpose: 'Original purpose',
          startTime: new Date('2025-06-05T10:00:00Z'),
          endTime: new Date('2025-06-05T12:00:00Z'),
          duration: 2,
          isRecurring: false,
          status: RoomBookingStatus.PENDING,
          roomId: room.roomId,
          studentId: (await studentUc.request((r) => r.get('/me'))).body.id,
        },
      })
    })

    test('Update:Success', async () => {
      // Arrange
      const updateDto = {
        purpose: 'Updated purpose',
        attendees: 5,
        offset: '0',
      } as UpdateRoomBookingDto

      // Act
      const res = await studentUc.request((r) => r.put(`/room-booking/${bookingData.id}`)).send(updateDto)

      // Assert
      expect(res).toBeOK()
      expect(res.body.purpose).toBe('Updated purpose')
      expect(res.body.attendees).toBe(5)
    })
  })

  describe('Delete', () => {
    let bookingData: RoomBooking

    beforeAll(async () => {
      // Create a test room with unique name
      const room = await prismaService.room.create({
        data: {
          name: `Test Room for Delete ${Date.now()}`,
          description: 'A test room for delete operations',
          capacity: 15,
          location: 'Building C',
          type: 'CLASSROOM',
          isAvailable: true,
        },
      })

      const createDto = {
        startTime: new Date('2025-06-06T14:00:00Z'),
        duration: 1,
        purpose: 'Booking to be cancelled',
        isRecurring: false,
        roomId: room.roomId,
        offset: '0',
      } as CreateRoomBookingDto

      const res = await studentUc.request((r) => r.post('/room-booking/create')).send(createDto)
      bookingData = res.body
    })

    test('Cancel:Success', async () => {
      // Act
      const res = await studentUc.request((r) => r.delete(`/room-booking/${bookingData.id}`))

      // Assert
      expect(res).toBeOK()
      expect(res.body.status).toBe(RoomBookingStatus.CANCELLED)
    })
  })

  describe('Handle', () => {
    let bookingData: RoomBooking

    beforeAll(async () => {
      // Create a test room with unique name
      const room = await prismaService.room.create({
        data: {
          name: `Test Room for Handle ${Date.now()}`,
          description: 'A test room for handle operations',
          capacity: 20,
          location: 'Building D',
          type: 'CLASSROOM',
          isAvailable: true,
        },
      })

      const createDto = {
        startTime: new Date('2025-06-07T15:00:00Z'),
        duration: 3,
        purpose: 'Booking to be handled',
        isRecurring: false,
        roomId: room.roomId,
        offset: '0',
      } as CreateRoomBookingDto

      const res = await studentUc.request((r) => r.post('/room-booking/create')).send(createDto)
      bookingData = res.body
    })

    test('Handle:Approve', async () => {
      // Arrange
      const handleDto = {
        status: RoomBookingStatus.APPROVED,
        remarks: 'Approved by admin',
      } as HandleRoomBookingDto

      // Act
      const res = await adminUc.request((r) => r.patch(`/room-booking/${bookingData.id}/handle`)).send(handleDto)

      // Assert
      expect(res).toBeOK()
      expect(res.body.status).toBe(RoomBookingStatus.APPROVED)
      expect(res.body.remarks).toBe('Approved by admin')
      expect(res.body.handleAt).not.toBeNull()
    })

    test('Handle:StudentForbidden', async () => {
      // Arrange
      const handleDto = {
        status: RoomBookingStatus.APPROVED,
        remarks: 'Approval attempt',
      } as HandleRoomBookingDto

      // Act
      const res = await studentUc.request((r) => r.patch(`/room-booking/${bookingData.id}/handle`)).send(handleDto)

      // Assert
      expect(res.status).toBe(403)
    })
  })
})
