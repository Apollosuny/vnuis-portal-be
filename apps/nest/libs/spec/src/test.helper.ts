import { AuthModule } from '@app/auth'
import { setupNestApp } from '@app/core/setup-nest-app'
import { UserModule } from '@app/user'
import { UserEntity } from '@app/user/entities/user.entity'
import { INestApplication, HttpStatus, ModuleMetadata } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { Role } from '@prisma/client'
import { randomUUID } from 'crypto'
import { PrismaService } from 'nestjs-prisma'
import request from 'supertest'
import { CoreModule } from '@app/core/core.module'
import { TokenResDto } from '@app/auth/dtos/token-res.dto'
import { StudentModule } from '@app/student'
import { OperatorModule } from '@app/operator'
import { Hash } from '@app/helper'

function buildExpectStatus(res: request.Response, expectedStatus: HttpStatus) {
  return {
    pass: res.statusCode == expectedStatus,
    message: () =>
      `expected ${res.statusCode} to be ${expectedStatus}, url=${(res as any)?.request?.url}, body=${JSON.stringify(
        res?.body || {},
      )}`,
  }
}

const toBeBad = (res: request.Response, message?: string | RegExp) => {
  const pass =
    res.statusCode == HttpStatus.BAD_REQUEST &&
    (!message || typeof message == 'string' ? message == res.body.message : message.test(res.body.message))
  let error = ''
  if (res.statusCode != HttpStatus.BAD_REQUEST) {
    error = `expected ${res.statusCode} to be ${HttpStatus.BAD_REQUEST}, `
  } else if (!!message) {
    error = `expected ${res.body.message} to be ${message}, `
  }
  return {
    pass,
    message: () => `${error}url=${(res as any)?.request?.url}, body=${JSON.stringify(res?.body || {})}`,
  }
}

expect.extend({
  toBeBad,
  toBeOK: (res: request.Response) => buildExpectStatus(res, HttpStatus.OK),
  toBeCreated: (res: request.Response) => buildExpectStatus(res, HttpStatus.CREATED),
  toBe404: (res: request.Response) => buildExpectStatus(res, HttpStatus.NOT_FOUND),
  toBeUnauthorized: (res: request.Response) => buildExpectStatus(res, HttpStatus.UNAUTHORIZED),
})

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeOK(): R
      toBeCreated(): R
      toBe404(): R
      toBeBad(message: string | RegExp): R
      toBeUnauthorized(): R
    }
  }
}

export interface IUserGenerator {
  username?: string
  password?: string
  role?: Role
  blocked?: boolean
}

export interface IStudentGenerator {
  studentId?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  dob?: Date
  enrollYear?: number
  major?: string
  email?: string
  phone?: string
  address?: string
}

export interface IOperatorGenerator {
  firstName?: string
  lastName?: string
  avatarUrl?: string
  email?: string
  phone?: string
}

// Helper functions to generate random data
const randomString = (prefix: string) => `${prefix}-${randomUUID().slice(0, 8)}`
const randomFirstName = () => {
  const names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Helen']
  return names[Math.floor(Math.random() * names.length)]
}
const randomLastName = () => {
  const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia', 'Wilson', 'Taylor']
  return names[Math.floor(Math.random() * names.length)]
}
const randomMajor = () => {
  const majors = [
    'Computer Science',
    'Engineering',
    'Business',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Arts',
    'Economics',
    'Psychology',
  ]
  return majors[Math.floor(Math.random() * majors.length)]
}
const randomPhone = () => `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`
const randomAddress = () =>
  `${Math.floor(100 + Math.random() * 900)} ${randomString('Street')} St, ${randomString('City')}, ${randomString('State')} ${Math.floor(10000 + Math.random() * 90000)}`

const defaultUserGen: () => IUserGenerator = () => ({
  username: randomString('user'),
  password: 'Password123!',
  role: 'STUDENT',
  blocked: false,
})

const defaultStudentGen: () => IStudentGenerator = () => ({
  studentId: `ST${Math.floor(100000 + Math.random() * 900000)}`,
  firstName: randomFirstName(),
  lastName: randomLastName(),
  dob: new Date(
    1990 + Math.floor(Math.random() * 15),
    Math.floor(Math.random() * 12),
    Math.floor(Math.random() * 28) + 1,
  ),
  enrollYear: 2020 + Math.floor(Math.random() * 5),
  major: randomMajor(),
  email: `${randomString('student')}@example.com`,
  phone: randomPhone(),
  address: randomAddress(),
})

const defaultOperatorGen: () => IOperatorGenerator = () => ({
  firstName: randomFirstName(),
  lastName: randomLastName(),
  email: `${randomString('operator')}@example.com`,
  phone: randomPhone(),
})

export class TestContext {
  prisma: PrismaService
  superAdmin: TokenResDto
  private _createdUsers: UserEntity[] = []

  constructor(
    public app: INestApplication,
    private _testModule: TestingModule,
  ) {
    this.prisma = app.get(PrismaService)
  }

  async setupSuperAdmin() {
    const res = await this.request()
      .post('/auth/local')
      .send({ username: process.env.SUPER_ADMIN_USERNAME, password: process.env.SUPER_ADMIN_PASSWORD })
    if (res.statusCode == HttpStatus.OK) {
      this.superAdmin = res.body
    } else {
      console.warn('super admin not found', res.body)
    }
  }

  request() {
    return request(this.app.getHttpServer())
  }

  requestSuperAdmin(callback: (st: request.Agent) => request.Test) {
    return callback(this.request()).set('Authorization', `Bearer ${this.superAdmin.jwt}`)
  }

  async createUser(userGen: IUserGenerator = defaultUserGen()) {
    const hash = Hash.make(userGen.password)

    const user = await this.prisma.user.create({
      data: {
        username: userGen.username,
        password: hash,
        role: userGen.role,
        blocked: userGen.blocked,
      },
    })
    this._createdUsers.push(user as UserEntity)
    return user
  }

  async createStudentUser(
    userGen: IUserGenerator = defaultUserGen(),
    studentGen: IStudentGenerator = defaultStudentGen(),
  ) {
    const user = await this.createUser({ ...userGen, role: 'STUDENT' })

    const student = await this.prisma.student.create({
      data: {
        userId: user.id,
        studentId: studentGen.studentId,
        firstName: studentGen.firstName,
        lastName: studentGen.lastName,
        avatarUrl: studentGen.avatarUrl,
        dob: studentGen.dob,
        enrollYear: studentGen.enrollYear,
        major: studentGen.major,
        email: studentGen.email,
        phone: studentGen.phone,
        address: studentGen.address,
      },
      include: {
        user: true,
      },
    })

    return { user, student }
  }

  async createOperatorUser(
    userGen: IUserGenerator = defaultUserGen(),
    operatorGen: IOperatorGenerator = defaultOperatorGen(),
  ) {
    const user = await this.createUser({ ...userGen, role: 'ADMIN' })

    const operator = await this.prisma.operator.create({
      data: {
        userId: user.id,
        firstName: operatorGen.firstName,
        lastName: operatorGen.lastName,
        avatarUrl: operatorGen.avatarUrl,
        email: operatorGen.email,
        phone: operatorGen.phone,
      },
      include: {
        user: true,
      },
    })

    return { user, operator }
  }

  async loginUser(username: string, password: string) {
    const res = await this.request().post('/auth/local').send({ username, password })

    if (res.statusCode !== HttpStatus.OK) {
      throw new Error(`Failed to login user ${username}: ${JSON.stringify(res.body)}`)
    }

    return res.body as TokenResDto
  }

  buildUserContext(userInfo: Partial<TokenResDto>) {
    const requestFunc = this.request.bind(this)
    let jwt = userInfo.jwt

    const setJwt = (_jwt: string) => {
      jwt = _jwt
    }

    return {
      userInfo,
      setJwt,
      request(callback: (st: request.Agent) => request.Test) {
        return callback(requestFunc()).set('Authorization', `Bearer ${jwt}`)
      },
    }
  }

  async createStudentContext(
    userGen: IUserGenerator = defaultUserGen(),
    studentGen: IStudentGenerator = defaultStudentGen(),
  ) {
    const { user, student } = await this.createStudentUser(userGen, studentGen)
    const tokenInfo = await this.loginUser(user.username, userGen.password)
    return {
      user,
      student,
      tokenInfo,
      context: this.buildUserContext(tokenInfo),
    }
  }

  async createOperatorContext(
    userGen: IUserGenerator = defaultUserGen(),
    operatorGen: IOperatorGenerator = defaultOperatorGen(),
  ) {
    const { user, operator } = await this.createOperatorUser(userGen, operatorGen)
    const tokenInfo = await this.loginUser(user.username, userGen.password)
    return {
      user,
      operator,
      tokenInfo,
      context: this.buildUserContext(tokenInfo),
    }
  }

  async clean(options = { cleanUsers: true }) {
    if (options.cleanUsers) {
      await this.prisma.student.deleteMany({
        where: {
          userId: {
            in: this._createdUsers.map((u) => u.id),
          },
        },
      })

      await this.prisma.operator.deleteMany({
        where: {
          userId: {
            in: this._createdUsers.map((u) => u.id),
          },
        },
      })

      // Then clean users
      await this.prisma.user.deleteMany({
        where: {
          id: {
            in: this._createdUsers.map((u) => u.id),
          },
        },
      })
    }

    await this.app.close()
    await this._testModule.close()
  }
}

const createContext = async (meta: ModuleMetadata = {}) => {
  let moduleFixture: TestingModule
  let app: INestApplication
  try {
    moduleFixture = await Test.createTestingModule({
      imports: [CoreModule, AuthModule, UserModule, StudentModule, OperatorModule, ...(meta.imports || [])],
      controllers: [...(meta.controllers || [])],
      providers: [...(meta.providers || [])],
    }).compile()

    app = moduleFixture.createNestApplication()

    setupNestApp(app)

    await app.init()

    const tc = new TestContext(app, moduleFixture)
    await tc.setupSuperAdmin()
    return tc
  } catch (error) {
    app?.close()
    moduleFixture?.close()
    throw error
  }
}

export type UserContextTestType = ReturnType<TestContext['buildUserContext']>

export const testHelper = {
  createContext,
}
