import { th } from '@app/helper'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { StudentEntity } from './entities/student.entity'

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
}
