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
  NotificationType,
  NotificationStatus,
  NotificationPriority,
  NotificationTargetType,
  FeedbackCategory,
  SentimentType,
  FeedbackStatus,
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

    // Define question type that includes options for select type
    type FormQuestion = {
      id: number
      title: string
      type: string
      required: boolean
      options?: string[]
    }

    // Create a form data with questions array instead of JSON Schema
    const formData = {
      questions: [
        {
          id: 1,
          title: 'Full Name',
          type: 'text',
          required: true,
        },
        {
          id: 2,
          title: 'Student ID',
          type: 'text',
          required: true,
        },
        {
          id: 3,
          title: 'Reason',
          type: 'textarea',
          required: true,
        },
        {
          id: 4,
          title: 'Additional Information',
          type: 'textarea',
          required: false,
        },
      ] as FormQuestion[],
    }

    // Add form-specific fields
    if (formType === 'Transcript Request') {
      formData.questions.push(
        {
          id: 5,
          title: 'Transcript Type',
          type: 'select',
          options: ['Official Transcript', 'Unofficial Transcript'],
          required: true,
        },
        {
          id: 6,
          title: 'Delivery Method',
          type: 'select',
          options: ['Email', 'Mail', 'Pick-up in person'],
          required: true,
        },
      )
    } else if (formType === 'Scholarship Application') {
      formData.questions.push(
        {
          id: 5,
          title: 'Scholarship Type',
          type: 'select',
          options: ['Academic Merit', 'Financial Need', 'Athletic Achievement'],
          required: true,
        },
        {
          id: 6,
          title: 'Current GPA',
          type: 'number',
          required: true,
        },
      )
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
        type: 'PROCEDURES', // Changed to match test enum value
        data: formData,
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

    // Generate random submission answers array to match the form questions
    const submissionAnswers = []

    // Assuming formData exists and has questions
    if (form.data && Array.isArray(form.data.questions)) {
      form.data.questions.forEach((question, index) => {
        let answer = ''

        // Generate appropriate answers based on question type
        switch (question.type) {
          case 'text':
            if (question.title === 'Full Name') {
              answer = `${student.firstName} ${student.lastName}`
            } else if (question.title === 'Student ID') {
              answer = student.studentId
            } else {
              answer = faker.lorem.words(3)
            }
            break
          case 'textarea':
            answer = faker.lorem.paragraph()
            break
          case 'select':
            if (question.options && question.options.length > 0) {
              answer = question.options[Math.floor(Math.random() * question.options.length)]
            }
            break
          case 'number':
            answer = (3 + Math.random() * 1).toFixed(2) // For GPA or other numbers
            break
          default:
            answer = faker.lorem.words(3)
        }

        submissionAnswers.push({
          questionId: question.id,
          answer,
        })
      })
    }

    // Create result object with answers array
    const submissionResult = {
      answers: submissionAnswers,
    }

    const status = submissionStatuses[Math.floor(Math.random() * submissionStatuses.length)]
    const today = new Date()
    const submissionDate = randomDate(addDays(today, -30), today) // From 30 days ago to today

    const submission = await prisma.administrativeProceduresFormSubmission.create({
      data: {
        formId: form.id,
        studentId: student.id,
        result: submissionResult,
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
            studentName: student.firstName + ' ' + student.lastName,
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

// Create Notifications (200 notifications across different types)
async function createNotificationsData() {
  console.log('CREATING NOTIFICATION SEED DATA...')

  // Get existing users first
  const students = await prisma.student.findMany({
    include: {
      user: true,
    },
  })

  const operators = await prisma.operator.findMany({
    include: {
      user: true,
    },
  })

  if (students.length === 0 || operators.length === 0) {
    console.log('Not enough users to create notifications, skipping')
    return
  }

  // Get some entities to reference in notifications
  const forms = await prisma.administrativeProceduresForm.findMany({
    take: 5,
  })

  const events = await prisma.event.findMany({
    take: 5,
  })

  const rooms = await prisma.room.findMany({
    take: 5,
  })

  // Find a valid admin to be the notification creator
  let admin = operators.find((op) => op.user && op.user.role === 'ADMIN')

  if (!admin || !admin.user) {
    console.log('No admin found to create notifications, using the first operator')
    admin = operators[0]
  }

  if (!admin || !admin.user) {
    console.log('No valid operator found to create notifications, skipping')
    return
  }

  const notificationsCount = 200

  // Define the notification types and their weights
  const notificationTypeDistribution = [
    { type: NotificationType.ACADEMIC, weight: 30 },
    { type: NotificationType.EVENT, weight: 30 },
    { type: NotificationType.SYSTEM, weight: 20 },
    { type: NotificationType.URGENT, weight: 10 },
    { type: NotificationType.GENERAL, weight: 10 },
  ]

  // Calculate total weight
  const totalWeight = notificationTypeDistribution.reduce((sum, item) => sum + item.weight, 0)

  // Function to select a weighted random type
  function getRandomType() {
    const rand = Math.random() * totalWeight
    let sum = 0

    for (const item of notificationTypeDistribution) {
      sum += item.weight
      if (rand <= sum) {
        return item.type
      }
    }

    return NotificationType.GENERAL // Fallback
  }

  // Priorities
  const priorities = [
    NotificationPriority.LOW,
    NotificationPriority.NORMAL,
    NotificationPriority.HIGH,
    NotificationPriority.CRITICAL,
  ]

  // Target types
  const targetTypes = [
    NotificationTargetType.ALL_STUDENTS,
    NotificationTargetType.SPECIFIC_STUDENTS,
    NotificationTargetType.BY_CLASS,
    NotificationTargetType.BY_MAJOR,
  ]

  for (let i = 0; i < notificationsCount; i++) {
    // Select a notification type with weighted distribution
    const notificationType = getRandomType()

    // Generate title and content based on type
    let title = ''
    let content = ''
    let metadata = {}

    switch (notificationType) {
      case NotificationType.ACADEMIC:
        if (forms.length > 0) {
          const form = forms[Math.floor(Math.random() * forms.length)]
          title = `Academic Update: ${form.name}`
          content = `Important information regarding ${form.name}: ${faker.lorem.paragraph()}`
          metadata = {
            formId: form.id,
            formName: form.name,
            formType: form.type,
            deadline: addDays(new Date(), Math.floor(Math.random() * 14) + 1).toISOString(),
          }
        } else {
          title = 'Academic Update'
          content = `Important academic information: ${faker.lorem.paragraph()}`
        }
        break

      case NotificationType.EVENT:
        if (events.length > 0) {
          const event = events[Math.floor(Math.random() * events.length)]
          title = `Event Reminder: ${event.name}`
          content = `Don't miss the upcoming event "${event.name}". ${faker.lorem.paragraph()}`
          metadata = {
            eventId: event.id,
            eventName: event.name,
            eventTime: event.startTime,
            location: event.location,
          }
        } else {
          title = 'Event Update'
          content = `New campus event announced: ${faker.lorem.paragraph()}`
        }
        break

      case NotificationType.SYSTEM:
        title = 'System Notification'
        content = `System update information: ${faker.lorem.paragraph()}`
        metadata = {
          systemName: faker.company.buzzNoun(),
          updateTime: new Date().toISOString(),
          importance: Math.random() > 0.5 ? 'high' : 'normal',
        }
        break

      case NotificationType.URGENT:
        title = `URGENT: ${faker.lorem.sentence(3)}`
        content = `Urgent notification regarding ${faker.lorem.words(3)}: ${faker.lorem.paragraph()}`
        metadata = {
          urgencyLevel: 'high',
          requiresAction: true,
          deadline: addDays(new Date(), 1).toISOString(),
        }
        break

      case NotificationType.GENERAL:
      default:
        title = `University Update: ${faker.lorem.words(3)}`
        content = faker.lorem.paragraph()
        metadata = {
          category: faker.commerce.department(),
          publishedBy: 'University Administration',
        }
        break
    }

    // Select priority (weighted more towards NORMAL)
    let priority
    const priorityRand = Math.random()
    if (priorityRand < 0.1) {
      priority = NotificationPriority.CRITICAL
    } else if (priorityRand < 0.3) {
      priority = NotificationPriority.HIGH
    } else if (priorityRand < 0.8) {
      priority = NotificationPriority.NORMAL
    } else {
      priority = NotificationPriority.LOW
    }

    // Urgent notifications should have HIGH or CRITICAL priority
    if (notificationType === NotificationType.URGENT) {
      priority = Math.random() > 0.5 ? NotificationPriority.CRITICAL : NotificationPriority.HIGH
    }

    // Status - most notifications should be SENT
    let status
    const statusRand = Math.random()
    if (statusRand < 0.05) {
      status = NotificationStatus.DRAFT
    } else if (statusRand < 0.15) {
      status = NotificationStatus.SCHEDULED
    } else if (statusRand < 0.95) {
      status = NotificationStatus.SENT
    } else {
      status = NotificationStatus.REVOKED
    }

    // Target type with weighted distribution
    let targetType
    const targetRand = Math.random()
    if (targetRand < 0.4) {
      targetType = NotificationTargetType.ALL_STUDENTS
    } else if (targetRand < 0.7) {
      targetType = NotificationTargetType.SPECIFIC_STUDENTS
    } else if (targetRand < 0.9) {
      targetType = NotificationTargetType.BY_MAJOR
    } else {
      targetType = NotificationTargetType.BY_CLASS
    }

    // Create targetIds based on targetType
    let targetIds: string[] = []
    if (targetType === NotificationTargetType.SPECIFIC_STUDENTS) {
      // Select a random subset of students (1-5)
      const count = Math.floor(Math.random() * 5) + 1
      for (let j = 0; j < count && j < students.length; j++) {
        if (students[j] && students[j].id) {
          targetIds.push(students[j].id)
        }
      }
    } else if (targetType === NotificationTargetType.BY_MAJOR) {
      targetIds = ['Computer Science', 'Information Technology', 'Business Administration'].slice(
        0,
        Math.floor(Math.random() * 3) + 1,
      )
    } else if (targetType === NotificationTargetType.BY_CLASS) {
      targetIds = ['2021', '2022', '2023', '2024', '2025'].slice(0, Math.floor(Math.random() * 3) + 1)
    }

    // Determine dates
    const today = new Date()
    const createdAt = randomDate(addDays(today, -30), today)
    const sentAt = status === NotificationStatus.SENT ? randomDate(createdAt, today) : null
    const scheduledAt =
      status === NotificationStatus.SCHEDULED ? addDays(today, Math.floor(Math.random() * 7) + 1) : null
    const revokedAt = status === NotificationStatus.REVOKED ? randomDate(addDays(createdAt, 1), today) : null

    // Generate a list of students who have read the notification
    const readBy: string[] = []
    if (status === NotificationStatus.SENT && Math.random() > 0.3) {
      // Between 1 and 10 students have read it
      const readCount = Math.floor(Math.random() * 10) + 1
      for (let j = 0; j < readCount && j < students.length; j++) {
        if (students[j] && students[j].id) {
          readBy.push(students[j].id)
        }
      }
    }

    try {
      // Create the notification
      await prisma.notification.create({
        data: {
          title,
          content,
          type: notificationType,
          priority,
          status,
          targetType,
          targetIds,
          scheduledAt,
          sentAt,
          revokedAt,
          readBy,
          metadata,
          createdById: admin.user.id,
        },
      })
    } catch (error) {
      console.error('Failed to create notification:', error)
    }
  }

  console.log('NOTIFICATION SEED DATA COMPLETED!')
}

// Create Feedback Data (100 feedbacks with AI sentiment analysis)
async function createFeedbackData() {
  console.log('CREATING FEEDBACK SEED DATA...')

  // Get existing students and operators
  const students = await prisma.student.findMany({
    include: {
      user: true,
    },
  })

  const operators = await prisma.operator.findMany({
    include: {
      user: true,
    },
  })

  if (students.length === 0 || operators.length === 0) {
    console.log('Not enough users to create feedback, skipping')
    return
  }

  const feedbackCount = 100
  const feedbackCategories = Object.values(FeedbackCategory)
  const sentimentTypes = Object.values(SentimentType)
  const feedbackStatuses = Object.values(FeedbackStatus)

  // Sample feedback content templates for different categories
  const feedbackTemplates = {
    [FeedbackCategory.GENERAL]: [
      'Overall experience with the system has been {sentiment}.',
      'The platform is {sentiment} for daily use.',
      'General feedback about the university services.',
    ],
    [FeedbackCategory.USER_EXPERIENCE]: [
      'The user interface is {sentiment} to navigate.',
      'Found the system {sentiment} to use.',
      'User experience could be {sentiment}.',
    ],
    [FeedbackCategory.FUNCTIONALITY]: [
      'The booking feature works {sentiment}.',
      'Form submission functionality is {sentiment}.',
      'Event registration process is {sentiment}.',
    ],
    [FeedbackCategory.PERFORMANCE]: [
      'The system loads {sentiment}.',
      'Response time is {sentiment}.',
      'Performance could be {sentiment}.',
    ],
    [FeedbackCategory.DESIGN]: [
      'The design looks {sentiment}.',
      'Visual appeal is {sentiment}.',
      'Layout is {sentiment}.',
    ],
    [FeedbackCategory.CONTENT]: [
      'The information provided is {sentiment}.',
      'Content quality is {sentiment}.',
      'Documentation is {sentiment}.',
    ],
    [FeedbackCategory.TECHNICAL_ISSUE]: [
      'Experienced technical issues: {issue}.',
      'Bug found in {feature}.',
      'System error occurred when {action}.',
    ],
    [FeedbackCategory.SUGGESTION]: [
      'Suggestion: {suggestion}.',
      'Would be great if {improvement}.',
      'Consider adding {feature}.',
    ],
    [FeedbackCategory.COMPLAINT]: [
      'Complaint about {issue}.',
      'Dissatisfied with {service}.',
      'Problem with {feature}.',
    ],
    [FeedbackCategory.COMPLIMENT]: [
      'Great work on {feature}!',
      'Excellent service provided.',
      'Very satisfied with {aspect}.',
    ],
  }

  // Keywords for different categories
  const categoryKeywords = {
    [FeedbackCategory.GENERAL]: ['system', 'experience', 'overall', 'service'],
    [FeedbackCategory.USER_EXPERIENCE]: ['interface', 'navigation', 'usability', 'user-friendly'],
    [FeedbackCategory.FUNCTIONALITY]: ['feature', 'function', 'work', 'process'],
    [FeedbackCategory.PERFORMANCE]: ['speed', 'loading', 'response', 'performance'],
    [FeedbackCategory.DESIGN]: ['design', 'layout', 'visual', 'appearance'],
    [FeedbackCategory.CONTENT]: ['information', 'content', 'documentation', 'details'],
    [FeedbackCategory.TECHNICAL_ISSUE]: ['error', 'bug', 'issue', 'problem'],
    [FeedbackCategory.SUGGESTION]: ['suggestion', 'improvement', 'enhancement', 'feature'],
    [FeedbackCategory.COMPLAINT]: ['complaint', 'problem', 'issue', 'dissatisfied'],
    [FeedbackCategory.COMPLIMENT]: ['great', 'excellent', 'satisfied', 'good'],
  }

  for (let i = 0; i < feedbackCount; i++) {
    // Select random category
    const category = feedbackCategories[Math.floor(Math.random() * feedbackCategories.length)]

    // Select random sentiment (weighted towards positive and neutral)
    let sentiment
    const sentimentRand = Math.random()
    if (sentimentRand < 0.4) {
      sentiment = SentimentType.POSITIVE
    } else if (sentimentRand < 0.7) {
      sentiment = SentimentType.NEUTRAL
    } else if (sentimentRand < 0.9) {
      sentiment = SentimentType.NEGATIVE
    } else {
      sentiment = SentimentType.MIXED
    }

    // Generate title and content based on category and sentiment
    const templates = feedbackTemplates[category]
    const template = templates[Math.floor(Math.random() * templates.length)]

    let content = template
    if (template.includes('{sentiment}')) {
      const sentimentWords = {
        [SentimentType.POSITIVE]: ['great', 'excellent', 'good', 'satisfactory'],
        [SentimentType.NEGATIVE]: ['poor', 'bad', 'difficult', 'frustrating'],
        [SentimentType.NEUTRAL]: ['okay', 'average', 'moderate', 'acceptable'],
        [SentimentType.MIXED]: ['mixed', 'varied', 'inconsistent'],
      }
      const sentimentWord = sentimentWords[sentiment][Math.floor(Math.random() * sentimentWords[sentiment].length)]
      content = template.replace('{sentiment}', sentimentWord)
    }

    // Replace other placeholders
    content = content
      .replace('{issue}', faker.lorem.words(3))
      .replace('{feature}', faker.lorem.words(2))
      .replace('{action}', faker.lorem.words(3))
      .replace('{suggestion}', faker.lorem.sentence())
      .replace('{improvement}', faker.lorem.words(4))
      .replace('{service}', faker.lorem.words(2))
      .replace('{aspect}', faker.lorem.words(2))

    // Add more detailed content
    content += ' ' + faker.lorem.paragraph()

    // Generate title
    const title = `${category.replace('_', ' ')} Feedback - ${faker.lorem.words(3)}`

    // Generate rating (1-5) based on sentiment
    let rating = null
    if (Math.random() > 0.3) {
      // 70% chance to have rating
      switch (sentiment) {
        case SentimentType.POSITIVE:
          rating = 4 + Math.floor(Math.random() * 2) // 4-5
          break
        case SentimentType.NEUTRAL:
          rating = 3 + Math.floor(Math.random() * 2) // 3-4
          break
        case SentimentType.NEGATIVE:
          rating = 1 + Math.floor(Math.random() * 2) // 1-2
          break
        case SentimentType.MIXED:
          rating = 2 + Math.floor(Math.random() * 3) // 2-4
          break
      }
    }

    // Generate AI analysis data
    const confidence = 0.7 + Math.random() * 0.3 // 0.7-1.0
    const keywords = categoryKeywords[category].slice(0, 2 + Math.floor(Math.random() * 3))

    const aiAnalysis = {
      model: 'gpt-4',
      version: '1.0',
      analysis: {
        sentiment: sentiment,
        confidence: confidence,
        keywords: keywords,
        summary: faker.lorem.sentence(),
        suggestions: Math.random() > 0.5 ? [faker.lorem.sentence()] : [],
      },
      timestamp: new Date().toISOString(),
    }

    // Select status (weighted distribution)
    let status
    const statusRand = Math.random()
    if (statusRand < 0.3) {
      status = FeedbackStatus.SUBMITTED
    } else if (statusRand < 0.5) {
      status = FeedbackStatus.UNDER_REVIEW
    } else if (statusRand < 0.7) {
      status = FeedbackStatus.IN_PROGRESS
    } else if (statusRand < 0.9) {
      status = FeedbackStatus.RESOLVED
    } else {
      status = FeedbackStatus.CLOSED
    }

    // Select random student
    const student = students[Math.floor(Math.random() * students.length)]

    // Select operator for review (if status requires it)
    let reviewedByOperator = null
    let reviewedAt = null
    if (status !== FeedbackStatus.SUBMITTED && operators.length > 0) {
      reviewedByOperator = operators[Math.floor(Math.random() * operators.length)]
      reviewedAt = randomDate(addDays(new Date(), -30), new Date())
    }

    // Create metadata
    const metadata = {
      source: Math.random() > 0.5 ? 'web' : 'mobile',
      browser: Math.random() > 0.5 ? 'Chrome' : 'Safari',
      userAgent: faker.internet.userAgent(),
      ipAddress: faker.internet.ip(),
      tags: [category.toLowerCase(), sentiment.toLowerCase()],
    }

    try {
      // Create the feedback
      const feedback = await prisma.feedback.create({
        data: {
          title,
          content,
          category,
          rating,
          sentiment,
          confidence,
          keywords,
          aiAnalysis,
          status,
          reviewedAt,
          reviewedByOperatorId: reviewedByOperator?.id,
          metadata,
          studentId: student.id,
        },
      })

      // Create responses for some feedback (30% chance)
      if (Math.random() > 0.7 && reviewedByOperator) {
        const responseCount = 1 + Math.floor(Math.random() * 3) // 1-3 responses

        for (let j = 0; j < responseCount; j++) {
          const isInternal = Math.random() > 0.7 // 30% chance internal note
          const responseContent = isInternal ? faker.lorem.sentence() + ' [INTERNAL NOTE]' : faker.lorem.paragraph()

          await prisma.feedbackResponse.create({
            data: {
              content: responseContent,
              isInternal,
              feedbackId: feedback.id,
              operatorId: reviewedByOperator.id,
            },
          })
        }
      }
    } catch (error) {
      console.error('Failed to create feedback:', error)
    }
  }

  console.log('FEEDBACK SEED DATA COMPLETED!')
}

// Create Feedback Analytics Data
async function createFeedbackAnalyticsData() {
  console.log('CREATING FEEDBACK ANALYTICS SEED DATA...')

  const feedbackCategories = Object.values(FeedbackCategory)
  const sentimentTypes = Object.values(SentimentType)

  // Generate analytics for the last 30 days
  const today = new Date()

  for (let day = 0; day < 30; day++) {
    const date = addDays(today, -day)

    for (const category of feedbackCategories) {
      for (const sentiment of sentimentTypes) {
        // Generate random count (0-10 per category/sentiment per day)
        const count = Math.floor(Math.random() * 11)

        if (count > 0) {
          // Calculate average rating based on sentiment
          let avgRating = null
          if (Math.random() > 0.3) {
            // 70% chance to have rating data
            switch (sentiment) {
              case SentimentType.POSITIVE:
                avgRating = 4.0 + Math.random() * 1.0 // 4.0-5.0
                break
              case SentimentType.NEUTRAL:
                avgRating = 3.0 + Math.random() * 1.0 // 3.0-4.0
                break
              case SentimentType.NEGATIVE:
                avgRating = 1.0 + Math.random() * 1.0 // 1.0-2.0
                break
              case SentimentType.MIXED:
                avgRating = 2.0 + Math.random() * 2.0 // 2.0-4.0
                break
            }
          }

          const totalResponses = Math.floor(Math.random() * (count + 1)) // 0 to count

          try {
            await prisma.feedbackAnalytics.create({
              data: {
                date,
                category,
                sentiment,
                count,
                avgRating,
                totalResponses,
              },
            })
          } catch (error) {
            // Ignore unique constraint violations (same date/category/sentiment combination)
            if (!error.message.includes('Unique constraint')) {
              console.error('Failed to create feedback analytics:', error)
            }
          }
        }
      }
    }
  }

  console.log('FEEDBACK ANALYTICS SEED DATA COMPLETED!')
}

main()
  .then(async () => {
    // Create notifications after other seed data
    await createNotificationsData()
    // Create feedback data
    await createFeedbackData()
    // Create feedback analytics data
    await createFeedbackAnalyticsData()
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
