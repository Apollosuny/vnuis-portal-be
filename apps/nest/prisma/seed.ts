import { Hash } from '../libs/helper/src/hash.helper'
import {
  PrismaClient,
  Role,
  RoomType,
  RoomBookingStatus,
  Frequency,
  FormSubmissionStatus,
  EventRegistrationStatus,
  BlockchainType,
  BlockchainTransactionType,
  BlockchainTransactionStatus,
} from '@prisma/client'
import { faker } from '@faker-js/faker/locale/vi'
import { DateTime } from 'luxon'

const prisma = new PrismaClient()

// Utility function to generate random date in a range
const randomDate = (start: Date | DateTime, end: Date | DateTime) => {
  const startDt = start instanceof Date ? DateTime.fromJSDate(start) : start
  const endDt = end instanceof Date ? DateTime.fromJSDate(end) : end

  const diffMillis = endDt.toMillis() - startDt.toMillis()
  const randomMillis = startDt.toMillis() + Math.random() * diffMillis

  return DateTime.fromMillis(randomMillis).toJSDate()
}

// Utility function to generate random BitMask for days of week (1-7)
const generateRandomDowsBit = () => {
  let dowsBit = 0
  for (let i = 0; i < 7; i++) {
    if (Math.random() > 0.5) {
      dowsBit |= 1 << i
    }
  }
  // Ensure at least one day is selected
  return dowsBit || 1 << Math.floor(Math.random() * 7)
}

// Utility function to generate random time slots
const generateTimeSlots = (startHour = 7, endHour = 21, slotDuration = 1) => {
  const slots = []
  for (let hour = startHour; hour < endHour; hour += slotDuration) {
    slots.push({
      startHour: hour,
      endHour: hour + slotDuration,
    })
  }
  return slots
}

// Luxon helper functions to replace date-fns
const setHours = (date: Date | DateTime, hours: number): Date => {
  const dt = date instanceof Date ? DateTime.fromJSDate(date) : date
  return dt.set({ hour: hours }).toJSDate()
}

const addHours = (date: Date | DateTime, hours: number): Date => {
  const dt = date instanceof Date ? DateTime.fromJSDate(date) : date
  return dt.plus({ hours }).toJSDate()
}

const addDays = (date: Date | DateTime, days: number): Date => {
  const dt = date instanceof Date ? DateTime.fromJSDate(date) : date
  return dt.plus({ days }).toJSDate()
}

const addMonths = (date: Date | DateTime, months: number): Date => {
  const dt = date instanceof Date ? DateTime.fromJSDate(date) : date
  return dt.plus({ months }).toJSDate()
}

const timeSlots = generateTimeSlots()

async function main() {
  console.log('PRISMA DATABASE SEEDING...')

  // Create SuperAdmin user
  const superAdminUsername = (process.env.SUPER_ADMIN_USERNAME || 'superadmin@example.com').toLowerCase()
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'superadmin123'

  const existingSuperAdmin = await prisma.user.findUnique({
    where: { username: superAdminUsername },
  })

  if (!existingSuperAdmin) {
    const superAdmin = await prisma.user.create({
      data: {
        username: superAdminUsername,
        password: Hash.make(superAdminPassword),
        role: Role.SUPERADMIN,
        operator: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
            email: superAdminUsername,
            phone: '0900000000',
          },
        },
      },
    })
    console.log(`SuperAdmin created with ID: ${superAdmin.id}`)
  } else {
    console.log('SuperAdmin already exists, skipping creation')
  }

  // Create Admin users (5 admins)
  const adminCount = 5
  const admins = []

  for (let i = 0; i < adminCount; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const username = `admin${i + 1}@virtuuni.edu.vn`.toLowerCase()
    const password = 'admin123'

    const existingAdmin = await prisma.user.findUnique({
      where: { username },
    })

    if (!existingAdmin) {
      const admin = await prisma.user.create({
        data: {
          username,
          password: Hash.make(password),
          role: Role.ADMIN,
          operator: {
            create: {
              firstName,
              lastName,
              email: username,
              phone: `09${faker.string.numeric(8)}`,
              avatarUrl: faker.image.avatar(),
            },
          },
        },
        include: {
          operator: true,
        },
      })
      admins.push(admin)
      console.log(`Admin ${username} created with ID: ${admin.id}`)
    }
  }

  // Create Student users (50 students)
  const studentCount = 50
  const students = []
  const majors = [
    'Computer Science',
    'Information Technology',
    'Business Administration',
    'Marketing',
    'Finance',
    'Civil Engineering',
    'Electrical Engineering',
    'Biotechnology',
  ]

  for (let i = 0; i < studentCount; i++) {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const studentId = `ST${String(2000 + i).padStart(5, '0')}`
    const username = `${studentId.toLowerCase()}@student.virtuuni.edu.vn`.toLowerCase()
    const password = 'student123'
    const enrollYear = 2020 + Math.floor(Math.random() * 5)
    const major = majors[Math.floor(Math.random() * majors.length)]

    const existingStudent = await prisma.user.findUnique({
      where: { username },
    })

    if (!existingStudent) {
      const student = await prisma.user.create({
        data: {
          username,
          password: Hash.make(password),
          role: Role.STUDENT,
          student: {
            create: {
              studentId,
              firstName,
              lastName,
              email: username,
              dob: faker.date.birthdate({ min: 18, max: 30, mode: 'age' }),
              enrollYear,
              major,
              phone: `09${faker.string.numeric(8)}`,
              address: faker.location.streetAddress(true),
              avatarUrl: faker.image.avatar(),
            },
          },
        },
        include: {
          student: true,
        },
      })
      students.push(student)
      console.log(`Student ${username} created with ID: ${student.id}`)
    }
  }

  // Create Rooms (20 rooms of different types)
  const roomsToCreate = 20
  const roomTypes = Object.values(RoomType)
  const rooms = []

  const locations = [
    'Building A - Floor 1',
    'Building A - Floor 2',
    'Building A - Floor 3',
    'Building B - Floor 1',
    'Building B - Floor 2',
    'Building B - Floor 3',
    'Building C - Floor 1',
    'Building C - Floor 2',
    'Library Building - Floor 1',
    'Library Building - Floor 2',
  ]

  for (let i = 0; i < roomsToCreate; i++) {
    const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)]
    const roomPrefix = roomType === RoomType.CLASSROOM ? 'CLR-' : roomType === RoomType.LAB ? 'LAB-' : 'EVT-'

    const roomNumber = `${roomPrefix}${String(i + 101).padStart(3, '0')}`
    const location = locations[Math.floor(Math.random() * locations.length)]
    const capacity =
      roomType === RoomType.CLASSROOM
        ? 30 + Math.floor(Math.random() * 40)
        : roomType === RoomType.LAB
          ? 20 + Math.floor(Math.random() * 20)
          : 50 + Math.floor(Math.random() * 150)

    // Check if room already exists
    const existingRoom = await prisma.room.findUnique({
      where: { name: roomNumber },
    })

    if (existingRoom) {
      console.log(`Room ${roomNumber} already exists, skipping creation`)
      rooms.push(existingRoom)
      continue
    }

    const room = await prisma.room.create({
      data: {
        name: roomNumber,
        description: `${roomType} room located at ${location}`,
        capacity,
        location,
        type: roomType,
        isAvailable: Math.random() > 0.1, // 90% chance room is available
      },
    })

    rooms.push(room)
    console.log(`Room ${roomNumber} created with ID: ${room.roomId}`)

    // Create time slots for each room
    for (const slot of timeSlots) {
      if (Math.random() > 0.3) {
        // 70% chance to create a time slot
        const today = new Date()
        const startTime = setHours(today, slot.startHour)
        const endTime = setHours(today, slot.endHour)

        await prisma.roomTimeSlot.create({
          data: {
            roomId: room.roomId,
            startTime,
            endTime,
            dowsBit: generateRandomDowsBit(),
          },
        })
      }
    }
  }

  // Create Room Bookings
  const bookingsCount = 100
  const bookingStatuses = Object.values(RoomBookingStatus)

  for (let i = 0; i < bookingsCount; i++) {
    // Make sure we have rooms and students with valid properties
    if (rooms.length === 0 || students.length === 0) {
      console.log('Not enough rooms or students to create bookings, skipping')
      break
    }

    const room = rooms[Math.floor(Math.random() * rooms.length)]

    // Get a valid student from the students array
    let studentIndex = Math.floor(Math.random() * students.length)
    let studentObj = students[studentIndex]
    // Make sure studentObj exists and has a student property
    while (!studentObj || !studentObj.student) {
      if (students.length === 0) break
      studentIndex = Math.floor(Math.random() * students.length)
      studentObj = students[studentIndex]
    }

    if (!studentObj || !studentObj.student) {
      console.log('Failed to find a valid student, skipping this booking')
      continue
    }

    const student = studentObj.student

    // Get a valid operator from the admins array
    let operator = null
    if (Math.random() > 0.3 && admins.length > 0) {
      let adminIndex = Math.floor(Math.random() * admins.length)
      let adminObj = admins[adminIndex]
      // Make sure adminObj exists and has an operator property
      while (!adminObj || !adminObj.operator) {
        if (admins.length === 0) break
        adminIndex = Math.floor(Math.random() * admins.length)
        adminObj = admins[adminIndex]
      }
      if (adminObj && adminObj.operator) {
        operator = adminObj.operator
      }
    }

    const today = new Date()
    const bookingDate = addDays(today, -15 + Math.floor(Math.random() * 30)) // From 15 days ago to 15 days ahead

    const startHour = 8 + Math.floor(Math.random() * 10) // Between 8 AM and 6 PM
    const startTime = setHours(bookingDate, startHour)
    const duration = 1 + Math.floor(Math.random() * 3) // 1 to 3 hours
    const endTime = addHours(startTime, duration)

    const status = bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)]
    const isRecurring = Math.random() > 0.7 // 30% chance it's recurring

    const booking = await prisma.roomBooking.create({
      data: {
        roomId: room.roomId,
        studentId: student.id,
        startTime,
        endTime,
        duration,
        purpose: faker.lorem.sentence(),
        handleByOperatorId: operator?.id,
        handleAt: status !== RoomBookingStatus.PENDING ? randomDate(addDays(today, -10), today) : null,
        remarks: Math.random() > 0.7 ? faker.lorem.sentence() : null,
        attendees: 5 + Math.floor(Math.random() * 20),
        isRecurring,
        status,
      },
    })

    // If recurring, create recurring pattern
    if (isRecurring) {
      await prisma.recurringPattern.create({
        data: {
          bookingId: booking.id,
          startDate: bookingDate,
          endDate: addMonths(bookingDate, 3), // 3 months recurrence
          frequency: Frequency.WEEKLY,
          interval: 1,
          dowsBit: generateRandomDowsBit(),
        },
      })
    }
  }

  // Create Administrative Forms (10 different forms)
  const formTypes = [
    'Attendance Certificate',
    'Transcript Request',
    'Scholarship Application',
    'Leave Request',
    'Exchange Program',
    'Dormitory Application',
    'Major Change',
    'Course Add/Drop',
    'Exam Reschedule',
    'Graduation Request',
  ]

  const forms = []

  for (let i = 0; i < formTypes.length; i++) {
    const formType = formTypes[i]
    const formName = `${formType} Form`
    const slug = formName.toLowerCase().replace(/\s+/g, '-')

    const requireApproval = Math.random() > 0.3 // 70% chance form requires approval

    // Create a form schema for each form type
    const formSchema: any = {
      title: formName,
      type: 'object',
      required: ['studentName', 'studentId', 'reason'],
      properties: {
        studentName: { type: 'string', title: 'Full Name' },
        studentId: { type: 'string', title: 'Student ID' },
        reason: { type: 'string', title: 'Reason' },
        additionalInfo: { type: 'string', title: 'Additional Information' },
      },
    }

    // Add form-specific fields
    if (formType === 'Transcript Request') {
      formSchema.properties.transcriptType = {
        type: 'string',
        title: 'Transcript Type',
        enum: ['Official', 'Unofficial'],
        enumNames: ['Official Transcript', 'Unofficial Transcript'],
      }
      formSchema.properties.deliveryMethod = {
        type: 'string',
        title: 'Delivery Method',
        enum: ['email', 'mail', 'pickup'],
        enumNames: ['Email', 'Mail', 'Pick-up in person'],
      }
      formSchema.required.push('transcriptType', 'deliveryMethod')
    } else if (formType === 'Scholarship Application') {
      formSchema.properties.scholarshipType = {
        type: 'string',
        title: 'Scholarship Type',
        enum: ['academic', 'financial', 'athletic'],
        enumNames: ['Academic Merit', 'Financial Need', 'Athletic Achievement'],
      }
      formSchema.properties.gpa = {
        type: 'number',
        title: 'Current GPA',
      }
      formSchema.required.push('scholarshipType', 'gpa')
    }

    // Get a valid operator from the admins array
    let operator = null
    if (admins.length > 0) {
      let adminIndex = Math.floor(Math.random() * admins.length)
      let adminObj = admins[adminIndex]
      // Make sure adminObj exists and has an operator property
      while (!adminObj || !adminObj.operator) {
        if (admins.length === 0) break
        adminIndex = Math.floor(Math.random() * admins.length)
        adminObj = admins[adminIndex]
      }
      if (adminObj && adminObj.operator) {
        operator = adminObj.operator
      }
    }

    if (!operator) {
      console.log(`No valid operator found to create form ${formName}, skipping`)
      continue
    }

    // Check if form already exists
    const existingForm = await prisma.administrativeProceduresForm.findUnique({
      where: { name: formName },
    })

    if (existingForm) {
      console.log(`Form ${formName} already exists, skipping creation`)
      forms.push(existingForm)
      continue
    }

    const form = await prisma.administrativeProceduresForm.create({
      data: {
        name: formName,
        slug,
        description: `Form for ${formType}`,
        type: formType,
        data: formSchema,
        isActive: Math.random() > 0.1, // 90% chance form is active
        allowEditAfterSubmit: Math.random() > 0.7, // 30% chance edit is allowed
        requireApproval,
        createdByOperatorId: operator.id,
        fileUrl: Math.random() > 0.5 ? `https://virtuuni.edu.vn/forms/${slug}.pdf` : null,
        metadata: {
          department: faker.commerce.department(),
          processingTime: `${1 + Math.floor(Math.random() * 5)} business days`,
        },
      },
    })

    forms.push(form)
    console.log(`Form ${formName} created with ID: ${form.id}`)
  }

  // Create Form Submissions (100 submissions across different forms)
  const submissionsCount = 100
  const submissionStatuses = Object.values(FormSubmissionStatus)

  for (let i = 0; i < submissionsCount; i++) {
    if (forms.length === 0 || students.length === 0) {
      console.log('Not enough forms or students to create submissions, skipping')
      break
    }

    const form = forms[Math.floor(Math.random() * forms.length)]

    // Get a valid student from the students array
    let studentIndex = Math.floor(Math.random() * students.length)
    let studentObj = students[studentIndex]
    // Make sure studentObj exists and has a student property
    while (!studentObj || !studentObj.student) {
      if (students.length === 0) break
      studentIndex = Math.floor(Math.random() * students.length)
      studentObj = students[studentIndex]
    }

    if (!studentObj || !studentObj.student) {
      console.log('Failed to find a valid student, skipping this submission')
      continue
    }

    const student = studentObj.student

    // Get a valid operator from the admins array if needed
    let operator = null
    if (Math.random() > 0.3 && admins.length > 0) {
      let adminIndex = Math.floor(Math.random() * admins.length)
      let adminObj = admins[adminIndex]
      // Make sure adminObj exists and has an operator property
      while (!adminObj || !adminObj.operator) {
        if (admins.length === 0) break
        adminIndex = Math.floor(Math.random() * admins.length)
        adminObj = admins[adminIndex]
      }
      if (adminObj && adminObj.operator) {
        operator = adminObj.operator
      }
    }

    // Generate random submission data based on form type
    const submissionData = {
      studentName: `${student.firstName} ${student.lastName}`,
      studentId: student.studentId,
      reason: faker.lorem.paragraph(),
      additionalInfo: Math.random() > 0.5 ? faker.lorem.paragraph() : '',
    }

    // Add form-specific fields
    if (form.type === 'Transcript Request') {
      submissionData['transcriptType'] = Math.random() > 0.5 ? 'Official' : 'Unofficial'
      submissionData['deliveryMethod'] = ['email', 'mail', 'pickup'][Math.floor(Math.random() * 3)]
    } else if (form.type === 'Scholarship Application') {
      submissionData['scholarshipType'] = ['academic', 'financial', 'athletic'][Math.floor(Math.random() * 3)]
      submissionData['gpa'] = (3 + Math.random() * 1).toFixed(2) // GPA between 3.0 and 4.0
    }

    const status = submissionStatuses[Math.floor(Math.random() * submissionStatuses.length)]
    const today = new Date()
    const submissionDate = randomDate(addDays(today, -30), today) // From 30 days ago to today

    const submission = await prisma.administrativeProceduresFormSubmission.create({
      data: {
        formId: form.id,
        studentId: student.id,
        result: submissionData,
        status,
        handleByOperatorId: status !== FormSubmissionStatus.PENDING ? operator?.id : null,
        handleAt:
          status !== FormSubmissionStatus.PENDING ? randomDate(submissionDate, addDays(submissionDate, 5)) : null,
        remarks: status !== FormSubmissionStatus.PENDING ? faker.lorem.sentence() : null,
      },
    })

    // Create blockchain signature for some approved forms
    if (status === FormSubmissionStatus.APPROVED && Math.random() > 0.7) {
      const transaction = await prisma.blockchainTransaction.create({
        data: {
          txHash: `0x${faker.string.hexadecimal({ length: 64 }).substring(2)}`,
          chain: BlockchainType.SOLANA,
          txType: BlockchainTransactionType.FORM_SIGNATURE,
          status: BlockchainTransactionStatus.CONFIRMED,
          senderAddress: `0x${faker.string.hexadecimal({ length: 40 }).substring(2)}`,
          receiverAddress: `0x${faker.string.hexadecimal({ length: 40 }).substring(2)}`,
          executedAt: new Date(),
          metadata: {
            formName: form.name,
            studentName: submissionData.studentName,
            timestamp: new Date().toISOString(),
          },
          userId: student.userId,
        },
      })

      await prisma.formSignatureOnChain.create({
        data: {
          formSubmissionId: submission.id,
          transactionId: transaction.id,
          formHash: `0x${faker.string.hexadecimal({ length: 64 }).substring(2)}`,
        },
      })
    }
  }

  // Create Events (15 events)
  const eventsCount = 15
  const eventCategories = ['Academic', 'Cultural', 'Sports', 'Career', 'Workshop', 'Conference', 'Social']
  const events = []

  for (let i = 0; i < eventsCount; i++) {
    const today = new Date()
    const eventStartDate = addDays(today, -10 + Math.floor(Math.random() * 30)) // From 10 days ago to 20 days ahead

    const startHour = 8 + Math.floor(Math.random() * 10) // Between 8 AM and 6 PM
    const startTime = setHours(eventStartDate, startHour)
    const duration = 1 + Math.floor(Math.random() * 6) // 1 to 6 hours
    const endTime = addHours(startTime, duration)

    const category = eventCategories[Math.floor(Math.random() * eventCategories.length)]

    // Get a valid operator from the admins array
    let operator = null
    if (admins.length > 0) {
      let adminIndex = Math.floor(Math.random() * admins.length)
      let adminObj = admins[adminIndex]
      // Make sure adminObj exists and has an operator property
      while (!adminObj || !adminObj.operator) {
        if (admins.length === 0) break
        adminIndex = Math.floor(Math.random() * admins.length)
        adminObj = admins[adminIndex]
      }
      if (adminObj && adminObj.operator) {
        operator = adminObj.operator
      }
    }

    if (!operator) {
      console.log(`No valid operator found to create event, skipping`)
      continue
    }

    const eventName = `${category} ${faker.company.buzzNoun()} ${faker.company.buzzAdjective()} Event`

    // Check if event already exists
    const existingEvent = await prisma.event.findFirst({
      where: { name: eventName },
    })

    if (existingEvent) {
      console.log(`Event ${eventName} already exists, skipping creation`)
      events.push(existingEvent)
      continue
    }

    const event = await prisma.event.create({
      data: {
        name: eventName,
        description: faker.lorem.paragraphs(2),
        startTime,
        endTime,
        location: locations[Math.floor(Math.random() * locations.length)],
        capacity: 30 + Math.floor(Math.random() * 200),
        isPublished: Math.random() > 0.2, // 80% chance event is published
        imageUrl: faker.image.url({ width: 640, height: 480 }),
        category,
        registrationDeadline: addDays(startTime, -1),
        requireApproval: Math.random() > 0.7, // 30% chance approval is required
        createdByOperatorId: operator.id,
        metadata: {
          organizers: [faker.company.name(), faker.company.name()],
          contactEmail: faker.internet.email(),
          contactPhone: `09${faker.string.numeric(8)}`,
          additionalDetails: faker.lorem.paragraph(),
        },
      },
    })

    events.push(event)
    console.log(`Event ${event.name} created with ID: ${event.id}`)
  }

  // Create Event Registrations (200 registrations across different events)
  const registrationsCount = 200
  const registrationStatuses = Object.values(EventRegistrationStatus)

  for (let i = 0; i < registrationsCount; i++) {
    const event = events[Math.floor(Math.random() * events.length)]

    // Get a student who hasn't registered for this event yet
    let validStudent = null
    let attempts = 0

    while (!validStudent && attempts < 10) {
      attempts++
      // Get a valid student from the students array
      let studentIndex = Math.floor(Math.random() * students.length)
      let studentObj = students[studentIndex]
      // Make sure studentObj exists and has a student property
      while (!studentObj || !studentObj.student) {
        if (students.length === 0) break
        studentIndex = Math.floor(Math.random() * students.length)
        studentObj = students[studentIndex]
      }

      if (!studentObj || !studentObj.student) {
        console.log('Failed to find a valid student for event registration, skipping')
        continue
      }

      const candidateStudent = studentObj.student

      // Check if student already registered for this event
      const existingRegistration = await prisma.eventRegistration.findUnique({
        where: {
          eventId_studentId: {
            eventId: event.id,
            studentId: candidateStudent.id,
          },
        },
      })

      if (!existingRegistration) {
        validStudent = candidateStudent
      }
    }

    // If all students are taken, skip this registration
    if (!validStudent) continue

    const status = registrationStatuses[Math.floor(Math.random() * registrationStatuses.length)]
    const operator = Math.random() > 0.3 ? admins[Math.floor(Math.random() * admins.length)].operator : null

    await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        studentId: validStudent.id,
        status,
        handleByOperatorId: status !== EventRegistrationStatus.PENDING ? operator?.id : null,
        handleAt: status !== EventRegistrationStatus.PENDING ? randomDate(addDays(new Date(), -10), new Date()) : null,
        remarks: status !== EventRegistrationStatus.PENDING ? faker.lorem.sentence() : null,
        additionalInfo: {
          dietaryRestrictions: Math.random() > 0.8 ? faker.lorem.words(2) : null,
          specialNeeds: Math.random() > 0.9 ? faker.lorem.sentence() : null,
          emergencyContact:
            Math.random() > 0.7
              ? {
                  name: faker.person.fullName(),
                  phone: `09${faker.string.numeric(8)}`,
                }
              : null,
        },
      },
    })
  }

  // Create Blockchain Transactions (50 transactions)
  const transactionsCount = 50
  const blockchainTypes = Object.values(BlockchainType)
  const transactionTypes = Object.values(BlockchainTransactionType)

  for (let i = 0; i < transactionsCount; i++) {
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)]
    const blockchainType = blockchainTypes[Math.floor(Math.random() * blockchainTypes.length)]
    const status =
      Object.values(BlockchainTransactionStatus)[
        Math.floor(Math.random() * Object.values(BlockchainTransactionStatus).length)
      ]

    // Get a valid student user from the students array
    if (students.length === 0) {
      console.log('No valid student users available for blockchain transaction, skipping')
      break
    }

    let studentIndex = Math.floor(Math.random() * students.length)
    let user = students[studentIndex]
    // Make sure user exists
    while (!user) {
      if (students.length === 0) break
      studentIndex = Math.floor(Math.random() * students.length)
      user = students[studentIndex]
    }

    if (!user) {
      console.log('Failed to find a valid student user for blockchain transaction, skipping')
      continue
    }

    await prisma.blockchainTransaction.create({
      data: {
        txHash: `0x${faker.string.hexadecimal({ length: 64 }).substring(2)}`,
        chain: blockchainType,
        txType: transactionType,
        status,
        senderAddress: `0x${faker.string.hexadecimal({ length: 40 }).substring(2)}`,
        receiverAddress: `0x${faker.string.hexadecimal({ length: 40 }).substring(2)}`,
        executedAt: status !== BlockchainTransactionStatus.PENDING ? new Date() : null,
        metadata: {
          timestamp: new Date().toISOString(),
          blockNumber: faker.number.int({ min: 10000000, max: 15000000 }),
          gasUsed: faker.number.int({ min: 21000, max: 500000 }).toString(),
        },
        userId: user.id,
      },
    })
  }

  console.log('SEED DATA COMPLETED!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
