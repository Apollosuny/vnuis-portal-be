import { th } from '@app/helper'
import { ph } from '@app/helper'
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { StudentEntity } from './entities/student.entity'
import { CreateStudentDto } from './dtos/create-student.dto'
import { UpdateStudentDto } from './dtos/update-student.dto'
import { GetStudentsDto } from './dtos/get-students.dto'
import { GetStudentListResDto } from './dtos/get-student-list-res.dto'

@Injectable()
export class StudentService {
  constructor(private _prisma: PrismaService) {}

  async findStudentByUserId(userId: string) {
    const student = await this._prisma.student.findUnique({
      where: {
        userId,
      },
    })
    return th.toInstanceSafe(StudentEntity, student)
  }

  async findAll(query: GetStudentsDto) {
    const { page = 1, limit = 10, search, major, enrollYear } = query
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { studentId: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (major) {
      where.major = { contains: major, mode: 'insensitive' }
    }

    if (enrollYear) {
      where.enrollYear = enrollYear
    }

    const [students, total] = await Promise.all([
      this._prisma.student.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this._prisma.student.count({ where }),
    ])

    const items = students.map((student) => th.toInstanceSafe(StudentEntity, student))

    return th.toInstanceSafe(GetStudentListResDto, {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  }

  async findOne(id: string) {
    const student = await this._prisma.student.findUnique({
      where: { id },
    })

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`)
    }

    return th.toInstanceSafe(StudentEntity, student)
  }

  async create(createStudentDto: CreateStudentDto, userId: string) {
    try {
      // Check if student ID or email already exists
      const existingStudent = await this._prisma.student.findFirst({
        where: {
          OR: [{ studentId: createStudentDto.studentId }, { email: createStudentDto.email }],
        },
      })

      if (existingStudent) {
        throw new BadRequestException('Student ID or email already exists')
      }

      const student = await this._prisma.student.create({
        data: {
          ...createStudentDto,
          dob: new Date(createStudentDto.dob),
          userId,
        },
      })

      return th.toInstanceSafe(StudentEntity, student)
    } catch (error) {
      if (ph.isMutationUniqueError(error, {})) {
        throw new BadRequestException('Student ID or email already exists')
      }
      throw error
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto) {
    try {
      // Check if student exists
      const existingStudent = await this._prisma.student.findUnique({
        where: { id },
      })

      if (!existingStudent) {
        throw new NotFoundException(`Student with ID ${id} not found`)
      }

      // Check for unique constraints if updating studentId or email
      if (updateStudentDto.studentId || updateStudentDto.email) {
        const conflictingStudent = await this._prisma.student.findFirst({
          where: {
            AND: [
              { id: { not: id } },
              {
                OR: [
                  ...(updateStudentDto.studentId ? [{ studentId: updateStudentDto.studentId }] : []),
                  ...(updateStudentDto.email ? [{ email: updateStudentDto.email }] : []),
                ],
              },
            ],
          },
        })

        if (conflictingStudent) {
          throw new BadRequestException('Student ID or email already exists')
        }
      }

      const updateData: any = { ...updateStudentDto }
      if (updateStudentDto.dob) {
        updateData.dob = new Date(updateStudentDto.dob)
      }

      const student = await this._prisma.student.update({
        where: { id },
        data: updateData,
      })

      return th.toInstanceSafe(StudentEntity, student)
    } catch (error) {
      if (ph.isUpdateNotFound(error, {})) {
        throw new NotFoundException(`Student with ID ${id} not found`)
      }
      if (ph.isMutationUniqueError(error, {})) {
        throw new BadRequestException('Student ID or email already exists')
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      const student = await this._prisma.student.delete({
        where: { id },
      })

      return th.toInstanceSafe(StudentEntity, student)
    } catch (error) {
      if (ph.isDeleteNotFound(error, {})) {
        throw new NotFoundException(`Student with ID ${id} not found`)
      }
      throw error
    }
  }
}
