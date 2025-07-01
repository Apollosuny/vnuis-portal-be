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
import { faker } from '@faker-js/faker'
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

  // Common names for mockdata
  const firstNames = [
    'John',
    'Jane',
    'Michael',
    'Sarah',
    'David',
    'Emily',
    'James',
    'Ashley',
    'Robert',
    'Jessica',
    'William',
    'Amanda',
    'Christopher',
    'Jennifer',
    'Daniel',
    'Lisa',
    'Matthew',
    'Michelle',
    'Anthony',
    'Kimberly',
    'Mark',
    'Donna',
    'Donald',
    'Carol',
    'Steven',
    'Sandra',
    'Paul',
    'Ruth',
    'Andrew',
    'Sharon',
    'Joshua',
    'Nancy',
    'Kenneth',
    'Laura',
    'Kevin',
    'Cynthia',
    'Brian',
    'Kathleen',
    'George',
    'Helen',
    'Timothy',
    'Amy',
    'Ronald',
    'Shirley',
    'Jason',
    'Angela',
    'Edward',
    'Brenda',
    'Jeffrey',
    'Emma',
  ]

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
    'Hernandez',
    'Lopez',
    'Gonzalez',
    'Wilson',
    'Anderson',
    'Thomas',
    'Taylor',
    'Moore',
    'Jackson',
    'Martin',
    'Lee',
    'Perez',
    'Thompson',
    'White',
    'Harris',
    'Sanchez',
    'Clark',
    'Ramirez',
    'Lewis',
    'Robinson',
    'Walker',
    'Young',
    'Allen',
    'King',
    'Wright',
    'Scott',
    'Torres',
    'Nguyen',
    'Hill',
    'Flores',
    'Green',
    'Adams',
    'Nelson',
    'Baker',
    'Hall',
    'Rivera',
    'Campbell',
    'Mitchell',
    'Carter',
    'Roberts',
  ]

  for (let i = 0; i < adminCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
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
              phone: faker.phone.number(),
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
    } else {
      console.log(`Admin ${username} already exists, skipping creation`)
      // Still add to admins array if it exists
      const existingAdminWithOperator = await prisma.user.findUnique({
        where: { username },
        include: { operator: true },
      })
      if (existingAdminWithOperator) {
        admins.push(existingAdminWithOperator)
      }
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
    'Medicine',
    'Law',
    'Architecture',
    'Psychology',
    'Mathematics',
    'Physics',
    'Chemistry',
  ]

  for (let i = 0; i < studentCount; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const studentId = `ST${String(2024001 + i).padStart(7, '0')}`
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
              phone: faker.phone.number(),
              address: faker.location.streetAddress() + ', ' + faker.location.city() + ', ' + faker.location.state(),
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
    let studentObj = null
    // Try to find a valid student
    for (let attempt = 0; attempt < students.length; attempt++) {
      const studentIndex = Math.floor(Math.random() * students.length)
      const candidateStudent = students[studentIndex]
      if (candidateStudent && candidateStudent.student) {
        studentObj = candidateStudent
        break
      }
    }

    if (!studentObj || !studentObj.student) {
      console.log('Failed to find a valid student, skipping this booking')
      continue
    }

    const student = studentObj.student

    // Get a valid operator from the admins array
    let operator = null
    if (Math.random() > 0.3 && admins.length > 0) {
      // Try to find a valid admin with operator
      for (let attempt = 0; attempt < admins.length; attempt++) {
        const adminIndex = Math.floor(Math.random() * admins.length)
        const adminObj = admins[adminIndex]
        if (adminObj && adminObj.operator) {
          operator = adminObj.operator
          break
        }
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
        purpose: `Meeting for ${majors[Math.floor(Math.random() * majors.length)]} students - ${['Study Group', 'Project Discussion', 'Lab Session', 'Workshop', 'Presentation Practice', 'Team Meeting'][Math.floor(Math.random() * 6)]}`,
        handleByOperatorId: operator?.id,
        handleAt: status !== RoomBookingStatus.PENDING ? randomDate(addDays(today, -10), today) : null,
        remarks:
          Math.random() > 0.7
            ? ['Approved for academic use', 'Equipment needed', 'Additional setup required', 'Standard booking'][
                Math.floor(Math.random() * 4)
              ]
            : null,
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
    'Student ID Card Request',
    'Official Transcript Request',
    'Merit Scholarship Application',
    'Medical Leave Request',
    'Student Exchange Program Application',
    'Campus Housing Application',
    'Major Change Request',
    'Course Registration Form',
    'Exam Reschedule Request',
    'Graduation Application',
    'Library Card Renewal',
    'Parking Permit Application',
  ]

  const forms = []

  for (let i = 0; i < formTypes.length; i++) {
    const formType = formTypes[i]
    const formName = formType
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
          title: 'Contact Email',
          type: 'email',
          required: true,
        },
        {
          id: 4,
          title: 'Phone Number',
          type: 'text',
          required: true,
        },
        {
          id: 5,
          title: 'Reason for Request',
          type: 'textarea',
          required: true,
        },
        {
          id: 6,
          title: 'Additional Comments',
          type: 'textarea',
          required: false,
        },
      ] as FormQuestion[],
    }

    // Add form-specific fields
    if (formType.includes('Transcript')) {
      formData.questions.push(
        {
          id: 7,
          title: 'Transcript Type',
          type: 'select',
          options: ['Official Transcript', 'Unofficial Transcript', 'Grade Report'],
          required: true,
        },
        {
          id: 8,
          title: 'Delivery Method',
          type: 'select',
          options: ['Email', 'Mail', 'Pick-up in person'],
          required: true,
        },
      )
    } else if (formType.includes('Scholarship')) {
      formData.questions.push(
        {
          id: 7,
          title: 'Scholarship Type',
          type: 'select',
          options: ['Academic Merit', 'Financial Need', 'Athletic Achievement', 'Community Service'],
          required: true,
        },
        {
          id: 8,
          title: 'Current GPA',
          type: 'number',
          required: true,
        },
        {
          id: 9,
          title: 'Annual Family Income',
          type: 'select',
          options: ['Under $30,000', '$30,000 - $60,000', '$60,000 - $100,000', 'Over $100,000'],
          required: false,
        },
      )
    } else if (formType.includes('Leave')) {
      formData.questions.push(
        {
          id: 7,
          title: 'Leave Type',
          type: 'select',
          options: ['Medical Leave', 'Personal Leave', 'Academic Leave', 'Emergency Leave'],
          required: true,
        },
        {
          id: 8,
          title: 'Start Date',
          type: 'date',
          required: true,
        },
        {
          id: 9,
          title: 'Expected Return Date',
          type: 'date',
          required: true,
        },
      )
    }

    // Get a valid operator from the admins array
    let operator = null
    if (admins.length > 0) {
      // Try to find a valid admin with operator
      for (let attempt = 0; attempt < admins.length; attempt++) {
        const adminIndex = Math.floor(Math.random() * admins.length)
        const adminObj = admins[adminIndex]
        if (adminObj && adminObj.operator) {
          operator = adminObj.operator
          break
        }
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
        description: `Official university form for ${formType.toLowerCase()}. Please fill out all required fields and submit for processing.`,
        type: 'PROCEDURES', // Changed to match test enum value
        data: formData,
        isActive: Math.random() > 0.1, // 90% chance form is active
        allowEditAfterSubmit: Math.random() > 0.7, // 30% chance edit is allowed
        requireApproval,
        createdByOperatorId: operator.id,
        fileUrl: Math.random() > 0.5 ? `https://virtuuni.edu.vn/forms/${slug}.pdf` : null,
        metadata: {
          department: ['Academic Affairs', 'Student Services', 'Registrar Office', 'Financial Aid', 'Administration'][
            Math.floor(Math.random() * 5)
          ],
          processingTime: `${1 + Math.floor(Math.random() * 5)} business days`,
          contactEmail: `${slug}@virtuuni.edu.vn`,
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
    let studentObj = null
    // Try to find a valid student
    for (let attempt = 0; attempt < students.length; attempt++) {
      const studentIndex = Math.floor(Math.random() * students.length)
      const candidateStudent = students[studentIndex]
      if (candidateStudent && candidateStudent.student) {
        studentObj = candidateStudent
        break
      }
    }

    if (!studentObj || !studentObj.student) {
      console.log('Failed to find a valid student, skipping this submission')
      continue
    }

    const student = studentObj.student

    // Get a valid operator from the admins array if needed
    let operator = null
    if (Math.random() > 0.3 && admins.length > 0) {
      // Try to find a valid admin with operator
      for (let attempt = 0; attempt < admins.length; attempt++) {
        const adminIndex = Math.floor(Math.random() * admins.length)
        const adminObj = admins[adminIndex]
        if (adminObj && adminObj.operator) {
          operator = adminObj.operator
          break
        }
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
            } else if (question.title === 'Phone Number') {
              answer = student.phone
            } else {
              answer = ['Academic research', 'Graduate school application', 'Job application', 'Personal records'][
                Math.floor(Math.random() * 4)
              ]
            }
            break
          case 'email':
            if (question.title === 'Contact Email') {
              answer = student.email
            } else {
              answer = student.email
            }
            break
          case 'textarea':
            if (question.title.includes('Reason')) {
              answer = [
                'I need this document for graduate school application',
                'Required for job application process',
                'Needed for scholarship application',
                'Personal academic records',
                'Transfer to another university',
              ][Math.floor(Math.random() * 5)]
            } else {
              answer = Math.random() > 0.5 ? 'Please process as soon as possible. Thank you.' : ''
            }
            break
          case 'select':
            if (question.options && question.options.length > 0) {
              answer = question.options[Math.floor(Math.random() * question.options.length)]
            }
            break
          case 'number':
            if (question.title.includes('GPA')) {
              answer = (3.0 + Math.random() * 1.0).toFixed(2) // GPA between 3.0-4.0
            } else {
              answer = Math.floor(Math.random() * 100).toString()
            }
            break
          case 'date':
            if (question.title.includes('Start Date')) {
              answer = addDays(new Date(), Math.floor(Math.random() * 30))
                .toISOString()
                .split('T')[0]
            } else if (question.title.includes('Return Date')) {
              answer = addDays(new Date(), 30 + Math.floor(Math.random() * 60))
                .toISOString()
                .split('T')[0]
            } else {
              answer = new Date().toISOString().split('T')[0]
            }
            break
          default:
            answer = 'N/A'
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
        remarks:
          status !== FormSubmissionStatus.PENDING
            ? [
                'Form reviewed and approved',
                'Additional documentation required',
                'Form completed successfully',
                'Processing in progress',
              ][Math.floor(Math.random() * 4)]
            : null,
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
            studentId: student.studentId,
            timestamp: new Date().toISOString(),
            signatureType: 'Digital Certificate',
            issuer: 'VirtuUni Academic Office',
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

  const eventNames = {
    Academic: [
      'Research Symposium 2025',
      'Academic Excellence Awards',
      'Graduate Thesis Defense',
      'Science Fair Competition',
      'Mathematical Olympiad',
    ],
    Cultural: [
      'International Culture Festival',
      'Art Exhibition Opening',
      'Music Concert Series',
      'Poetry Reading Night',
      'Cultural Heritage Week',
    ],
    Sports: [
      'Annual Sports Day',
      'Basketball Championship',
      'Swimming Competition',
      'Tennis Tournament',
      'Athletic Meet 2025',
    ],
    Career: [
      'Career Fair 2025',
      'Job Interview Workshop',
      'Resume Building Session',
      'Industry Networking Event',
      'Entrepreneurship Summit',
    ],
    Workshop: [
      'Leadership Development Workshop',
      'Digital Skills Training',
      'Research Methods Workshop',
      'Communication Skills Seminar',
      'Time Management Workshop',
    ],
    Conference: [
      'Technology Innovation Conference',
      'Sustainability Summit',
      'Education Reform Conference',
      'Healthcare Symposium',
      'Business Strategy Conference',
    ],
    Social: [
      'Welcome Back Party',
      'Graduation Celebration',
      'Student Mixer Event',
      'Community Service Day',
      'Alumni Reunion',
    ],
  }

  for (let i = 0; i < eventsCount; i++) {
    const today = new Date()
    const eventStartDate = addDays(today, -10 + Math.floor(Math.random() * 30)) // From 10 days ago to 20 days ahead

    const startHour = 8 + Math.floor(Math.random() * 10) // Between 8 AM and 6 PM
    const startTime = setHours(eventStartDate, startHour)
    const duration = 1 + Math.floor(Math.random() * 6) // 1 to 6 hours
    const endTime = addHours(startTime, duration)

    const category = eventCategories[Math.floor(Math.random() * eventCategories.length)]
    const possibleNames = eventNames[category]
    const eventName = possibleNames[Math.floor(Math.random() * possibleNames.length)]

    // Get a valid operator from the admins array
    let operator = null
    if (admins.length > 0) {
      // Try to find a valid admin with operator
      for (let attempt = 0; attempt < admins.length; attempt++) {
        const adminIndex = Math.floor(Math.random() * admins.length)
        const adminObj = admins[adminIndex]
        if (adminObj && adminObj.operator) {
          operator = adminObj.operator
          break
        }
      }
    }

    if (!operator) {
      console.log(`No valid operator found to create event, skipping`)
      continue
    }

    // Check if event already exists
    const existingEvent = await prisma.event.findFirst({
      where: { name: eventName },
    })

    if (existingEvent) {
      console.log(`Event ${eventName} already exists, skipping creation`)
      events.push(existingEvent)
      continue
    }

    // Generate appropriate description based on category
    let description = ''
    switch (category) {
      case 'Academic':
        description = `Join us for an engaging academic event focusing on ${majors[Math.floor(Math.random() * majors.length)]}. This event will feature presentations, discussions, and networking opportunities for students and faculty.`
        break
      case 'Cultural':
        description = `Experience the rich diversity of our university community through cultural performances, exhibitions, and interactive activities. Open to all students and faculty members.`
        break
      case 'Sports':
        description = `Participate in competitive sports activities and showcase your athletic abilities. This event promotes fitness, teamwork, and school spirit among students.`
        break
      case 'Career':
        description = `Advance your career prospects through professional development opportunities, industry insights, and networking with employers and alumni.`
        break
      case 'Workshop':
        description = `Develop new skills and enhance your knowledge through hands-on learning experiences led by experienced instructors and industry professionals.`
        break
      case 'Conference':
        description = `Engage with leading experts and researchers in various fields through keynote speeches, panel discussions, and collaborative sessions.`
        break
      case 'Social':
        description = `Connect with fellow students and build lasting friendships through fun social activities and community building events.`
        break
      default:
        description = `Join us for this exciting university event designed to engage, educate, and inspire our academic community.`
    }

    const event = await prisma.event.create({
      data: {
        name: eventName,
        description: description,
        startTime,
        endTime,
        location: locations[Math.floor(Math.random() * locations.length)],
        capacity: 30 + Math.floor(Math.random() * 200),
        isPublished: Math.random() > 0.2, // 80% chance event is published
        imageUrl: `https://picsum.photos/800/600?random=${i}`, // Use picsum for consistent images
        category,
        registrationDeadline: addDays(startTime, -1),
        requireApproval: Math.random() > 0.7, // 30% chance approval is required
        createdByOperatorId: operator.id,
        metadata: {
          organizers: ['Student Affairs Office', 'Academic Department', 'Student Council'][
            Math.floor(Math.random() * 3)
          ],
          contactEmail: `events@virtuuni.edu.vn`,
          contactPhone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
          eventType: category,
          targetAudience: ['All Students', 'Undergraduate', 'Graduate', 'Faculty'][Math.floor(Math.random() * 4)],
        },
      },
    })

    events.push(event)
    console.log(`Event ${event.name} created with ID: ${event.id}`)
  }

  // Create Event Registrations (200 registrations across different events)
  const registrationsCount = 200
  const registrationStatuses = Object.values(EventRegistrationStatus)

  // Check if we have events and students before creating registrations
  if (events.length === 0) {
    console.log('No events created, skipping event registrations')
  } else if (students.length === 0) {
    console.log('No students created, skipping event registrations')
  } else {
    for (let i = 0; i < registrationsCount; i++) {
      const event = events[Math.floor(Math.random() * events.length)]

      // Get a student who hasn't registered for this event yet
      let validStudent = null
      let attempts = 0

      while (!validStudent && attempts < 10) {
        attempts++

        // Get a random student from the students array
        const studentIndex = Math.floor(Math.random() * students.length)
        const studentObj = students[studentIndex]

        // Make sure we have a valid student object with student property
        if (!studentObj || !studentObj.student) {
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
          break
        }
      }

      // If we couldn't find a valid student after 10 attempts, skip this registration
      if (!validStudent) {
        console.log(`Could not find available student for event ${event.name} after ${attempts} attempts, skipping`)
        continue
      }

      const status = registrationStatuses[Math.floor(Math.random() * registrationStatuses.length)]
      const operator = Math.random() > 0.3 ? admins[Math.floor(Math.random() * admins.length)].operator : null

      await prisma.eventRegistration.create({
        data: {
          eventId: event.id,
          studentId: validStudent.id,
          status,
          handleByOperatorId: status !== EventRegistrationStatus.PENDING ? operator?.id : null,
          handleAt:
            status !== EventRegistrationStatus.PENDING ? randomDate(addDays(new Date(), -10), new Date()) : null,
          remarks:
            status !== EventRegistrationStatus.PENDING
              ? [
                  'Registration approved',
                  'Waitlisted due to capacity',
                  'Please bring student ID',
                  'Confirmed attendance',
                ][Math.floor(Math.random() * 4)]
              : null,
          additionalInfo: {
            dietaryRestrictions:
              Math.random() > 0.8
                ? ['Vegetarian', 'Vegan', 'Gluten-free', 'No nuts'][Math.floor(Math.random() * 4)]
                : null,
            specialNeeds: Math.random() > 0.9 ? 'Wheelchair accessible seating needed' : null,
            emergencyContact:
              Math.random() > 0.7
                ? {
                    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                    phone: faker.phone.number(),
                  }
                : null,
          },
        },
      })
    }
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
          transactionType: transactionType,
          networkFee: (Math.random() * 0.01).toFixed(6) + ' SOL',
          confirmations: faker.number.int({ min: 1, max: 50 }),
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
          content = `Important information regarding ${form.name}. Please review the updated requirements and submit your application before the deadline. For assistance, contact the Academic Affairs Office.`
          metadata = {
            formId: form.id,
            formName: form.name,
            formType: form.type,
            deadline: addDays(new Date(), Math.floor(Math.random() * 14) + 1).toISOString(),
            department: 'Academic Affairs',
            priority: 'High',
          }
        } else {
          title = 'Academic Semester Update'
          content = `Important academic information for the current semester. Please check your course schedules and upcoming assignment deadlines. Contact your academic advisor if you have any questions.`
        }
        break

      case NotificationType.EVENT:
        if (events.length > 0) {
          const event = events[Math.floor(Math.random() * events.length)]
          title = `Event Reminder: ${event.name}`
          content = `Don't miss the upcoming event "${event.name}". Registration is now open and spaces are limited. This event offers great opportunities for learning and networking with fellow students and faculty.`
          metadata = {
            eventId: event.id,
            eventName: event.name,
            eventTime: event.startTime,
            location: event.location,
            category: event.category,
            registrationRequired: true,
          }
        } else {
          title = 'Campus Event Announcement'
          content = `New campus event announced! Join us for an exciting opportunity to engage with the university community. More details will be available soon on the student portal.`
        }
        break

      case NotificationType.SYSTEM:
        title = 'System Maintenance Notice'
        content = `Scheduled system maintenance will be performed on the student portal. During this time, some services may be temporarily unavailable. We apologize for any inconvenience and appreciate your patience.`
        metadata = {
          systemName: ['Student Portal', 'Library System', 'Course Management', 'Email System'][
            Math.floor(Math.random() * 4)
          ],
          updateTime: new Date().toISOString(),
          expectedDuration: ['2 hours', '4 hours', '30 minutes', '1 hour'][Math.floor(Math.random() * 4)],
          importance: Math.random() > 0.5 ? 'high' : 'normal',
        }
        break

      case NotificationType.URGENT:
        const urgentTopics = [
          'Emergency Campus Closure',
          'Important Security Update',
          'Immediate Action Required',
          'Critical System Alert',
          'Weather Emergency Notice',
        ]
        const urgentTopic = urgentTopics[Math.floor(Math.random() * urgentTopics.length)]
        title = `URGENT: ${urgentTopic}`
        content = `This is an urgent notification regarding ${urgentTopic.toLowerCase()}. Please read this message carefully and take appropriate action as needed. Contact campus security or administration for immediate assistance.`
        metadata = {
          urgencyLevel: 'critical',
          requiresAction: true,
          deadline: addDays(new Date(), 1).toISOString(),
          contactInfo: 'Campus Security: 555-HELP (4357)',
          alertType: urgentTopic,
        }
        break

      case NotificationType.GENERAL:
      default:
        const generalTopics = [
          'Library Hours Update',
          'Campus Facility News',
          'Student Services Information',
          'University Policy Update',
          'Community Announcement',
        ]
        const generalTopic = generalTopics[Math.floor(Math.random() * generalTopics.length)]
        title = `University Update: ${generalTopic}`
        content = `We want to inform you about important updates regarding ${generalTopic.toLowerCase()}. Please review this information and contact the appropriate department if you have any questions or concerns.`
        metadata = {
          category: generalTopic,
          publishedBy: 'University Administration',
          department: ['Student Services', 'Library', 'Campus Operations', 'Academic Affairs'][
            Math.floor(Math.random() * 4)
          ],
          effectiveDate: new Date().toISOString(),
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
      'Overall experience with the university system has been {sentiment}.',
      'The campus facilities and services are {sentiment} for student needs.',
      'General feedback about the university academic environment and support services.',
    ],
    [FeedbackCategory.USER_EXPERIENCE]: [
      'The student portal interface is {sentiment} to navigate and use effectively.',
      'Found the online registration system {sentiment} and user-friendly.',
      'The mobile app user experience could be improved to be more {sentiment}.',
    ],
    [FeedbackCategory.FUNCTIONALITY]: [
      'The room booking feature works {sentiment} and meets student needs.',
      'Form submission functionality is {sentiment} and processes requests efficiently.',
      'Event registration process is {sentiment} and handles large volumes well.',
    ],
    [FeedbackCategory.PERFORMANCE]: [
      'The student portal loads {sentiment} during peak usage times.',
      'System response time is {sentiment} when accessing course materials.',
      'Overall system performance could be {sentiment} during registration periods.',
    ],
    [FeedbackCategory.DESIGN]: [
      'The website design looks {sentiment} and professional.',
      'Visual appeal of the student interface is {sentiment} and modern.',
      'The mobile app layout is {sentiment} and follows good design principles.',
    ],
    [FeedbackCategory.CONTENT]: [
      'The course information provided is {sentiment} and comprehensive.',
      'Academic content quality is {sentiment} and up-to-date.',
      'Documentation and help resources are {sentiment} and easy to understand.',
    ],
    [FeedbackCategory.TECHNICAL_ISSUE]: [
      'Experienced technical issues with login authentication system.',
      'Bug found in the grade submission portal affecting multiple courses.',
      'System error occurred when accessing the library database.',
    ],
    [FeedbackCategory.SUGGESTION]: [
      'Suggestion: Add a dark mode option to the student portal.',
      'Would be great if the system had better notification management.',
      'Consider adding a mobile-first design for better accessibility.',
    ],
    [FeedbackCategory.COMPLAINT]: [
      'Complaint about slow response times during peak hours.',
      'Dissatisfied with the limited functionality of the mobile app.',
      'Problem with the course evaluation system not saving responses.',
    ],
    [FeedbackCategory.COMPLIMENT]: [
      'Great work on the new dashboard design and functionality!',
      'Excellent improvements to the online library system.',
      'Very satisfied with the responsive customer support team.',
    ],
  }

  // Keywords for different categories
  const categoryKeywords = {
    [FeedbackCategory.GENERAL]: ['university', 'campus', 'overall', 'services', 'academic', 'student life'],
    [FeedbackCategory.USER_EXPERIENCE]: [
      'interface',
      'navigation',
      'usability',
      'user-friendly',
      'intuitive',
      'accessibility',
    ],
    [FeedbackCategory.FUNCTIONALITY]: ['features', 'booking', 'registration', 'submission', 'workflow', 'process'],
    [FeedbackCategory.PERFORMANCE]: ['speed', 'loading', 'response time', 'efficiency', 'lag', 'performance'],
    [FeedbackCategory.DESIGN]: ['design', 'layout', 'visual', 'appearance', 'interface', 'graphics'],
    [FeedbackCategory.CONTENT]: ['information', 'content', 'documentation', 'details', 'accuracy', 'completeness'],
    [FeedbackCategory.TECHNICAL_ISSUE]: ['error', 'bug', 'issue', 'problem', 'crash', 'malfunction'],
    [FeedbackCategory.SUGGESTION]: ['suggestion', 'improvement', 'enhancement', 'feature request', 'recommendation'],
    [FeedbackCategory.COMPLAINT]: ['complaint', 'problem', 'issue', 'dissatisfied', 'frustration', 'difficulty'],
    [FeedbackCategory.COMPLIMENT]: ['excellent', 'great', 'satisfied', 'positive', 'helpful', 'impressive'],
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

    // Replace other placeholders with meaningful content
    content = content
      .replace('{issue}', 'course registration system')
      .replace('{feature}', 'student portal')
      .replace('{action}', 'submitting assignments')
      .replace('{suggestion}', 'implementing a better search function')
      .replace('{improvement}', 'the system had better mobile responsiveness')
      .replace('{service}', 'technical support response time')
      .replace('{aspect}', 'online learning platform')

    // Add more detailed content based on category
    if (category === FeedbackCategory.TECHNICAL_ISSUE) {
      content +=
        ' This issue has been affecting my ability to complete coursework efficiently. Please investigate and resolve as soon as possible.'
    } else if (category === FeedbackCategory.SUGGESTION) {
      content +=
        ' This enhancement would significantly improve the user experience for students and help streamline academic processes.'
    } else if (category === FeedbackCategory.COMPLIMENT) {
      content +=
        ' The recent updates have made a noticeable difference in daily usage and overall satisfaction with the platform.'
    } else {
      content +=
        ' I believe addressing this feedback will help improve the overall quality of services provided to students.'
    }

    // Generate title based on category and content
    const titlePrefixes = {
      [FeedbackCategory.GENERAL]: 'General Feedback',
      [FeedbackCategory.USER_EXPERIENCE]: 'User Experience Review',
      [FeedbackCategory.FUNCTIONALITY]: 'Feature Functionality',
      [FeedbackCategory.PERFORMANCE]: 'Performance Issue',
      [FeedbackCategory.DESIGN]: 'Design Feedback',
      [FeedbackCategory.CONTENT]: 'Content Quality',
      [FeedbackCategory.TECHNICAL_ISSUE]: 'Technical Issue Report',
      [FeedbackCategory.SUGGESTION]: 'Feature Suggestion',
      [FeedbackCategory.COMPLAINT]: 'Service Complaint',
      [FeedbackCategory.COMPLIMENT]: 'Positive Feedback',
    }

    const title = `${titlePrefixes[category]} - ${['Student Portal', 'Mobile App', 'Course System', 'Registration', 'Library System'][Math.floor(Math.random() * 5)]}`

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
        summary: `Feedback categorized as ${category.toLowerCase()} with ${sentiment.toLowerCase()} sentiment. Main concerns relate to ${keywords[0]} and ${keywords[1] || 'system usability'}.`,
        suggestions:
          Math.random() > 0.5
            ? [
                'Consider reviewing the reported issues and implementing improvements',
                'Follow up with the student to gather more specific details',
                'Monitor similar feedback patterns for system-wide improvements',
              ][Math.floor(Math.random() * 3)]
              ? ['Consider reviewing the reported issues and implementing improvements']
              : []
            : [],
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

    // Create metadata with realistic information
    const metadata = {
      source: Math.random() > 0.5 ? 'web' : 'mobile',
      browser: ['Chrome', 'Safari', 'Firefox', 'Edge'][Math.floor(Math.random() * 4)],
      userAgent: 'Mozilla/5.0 (compatible; Student Portal)',
      ipAddress: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      tags: [category.toLowerCase().replace('_', '-'), sentiment.toLowerCase()],
      submissionMethod: Math.random() > 0.7 ? 'anonymous' : 'authenticated',
      relatedSystem: ['Student Portal', 'Mobile App', 'Course Management', 'Library System'][
        Math.floor(Math.random() * 4)
      ],
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

          let responseContent = ''
          if (isInternal) {
            const internalNotes = [
              'Escalate to IT department for technical review',
              'Similar issue reported by 3 other students this week',
              'Requires coordination with academic affairs office',
              'Follow up required within 48 hours',
              'Add to next system update priority list',
            ]
            responseContent = internalNotes[Math.floor(Math.random() * internalNotes.length)] + ' [INTERNAL NOTE]'
          } else {
            const publicResponses = [
              'Thank you for your feedback. We are reviewing your concerns and will follow up with you soon.',
              'We appreciate you taking the time to provide this feedback. Your issue has been forwarded to the appropriate department.',
              'Your feedback is important to us. We are working on improvements to address the issues you mentioned.',
              'Thank you for reporting this issue. We will investigate and provide an update within 2-3 business days.',
              'We value your input and are committed to improving our services based on student feedback like yours.',
            ]
            responseContent = publicResponses[Math.floor(Math.random() * publicResponses.length)]
          }

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
