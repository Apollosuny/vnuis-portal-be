import { Hash } from '../libs/helper/src/hash.helper'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  console.log('PRISMA DATABASE SEEDING...')
  if (process.env.SUPER_ADMIN_USERNAME && process.env.SUPER_ADMIN_PASSWORD) {
    const admin = await prisma.user.findUnique({
      where: {
        username: process.env.SUPER_ADMIN_USERNAME,
      },
    })
    if (admin) {
      console.log('SUPER-ADMIN already exists')
      return
    }
    await prisma.user.create({
      data: {
        username: process.env.SUPER_ADMIN_USERNAME,
        password: Hash.make(process.env.SUPER_ADMIN_PASSWORD),
        role: 'SUPERADMIN',
        operator: {
          create: {
            firstName: 'Super',
            lastName: 'Admin',
            email: process.env.SUPER_ADMIN_USERNAME,
          },
        },
      },
    })
    console.log('SUPER-ADMIN created')
  }
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    const admin = await prisma.user.findUnique({
      where: {
        username: process.env.ADMIN_USERNAME,
      },
    })
    if (admin) {
      console.log('ADMIN already exists')
      return
    }
    await prisma.user.create({
      data: {
        username: process.env.ADMIN_USERNAME,
        password: Hash.make(process.env.ADMIN_PASSWORD),
        role: 'ADMIN',
        operator: {
          create: {
            firstName: 'Admin',
            lastName: 'User',
            email: process.env.ADMIN_USERNAME,
          },
        },
      },
    })
    console.log('ADMIN created')
  }
  if (process.env.USER_USERNAME && process.env.USER_PASSWORD) {
    const user = await prisma.user.findUnique({
      where: {
        username: process.env.USER_USERNAME,
      },
    })
    if (user) {
      console.log('USER already exists')
      return
    }
    await prisma.user.create({
      data: {
        username: process.env.USER_USERNAME,
        password: Hash.make(process.env.USER_PASSWORD),
        role: 'STUDENT',
        student: {
          create: {
            studentId: '111111',
            firstName: 'Student',
            lastName: 'User',
            email: process.env.USER_USERNAME,
            dob: new Date('2000-01-01'),
            enrollYear: 2025,
            major: 'Computer Science',
          },
        },
      },
    })
    console.log('USER created')
  }
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
