import { UserEntity } from '@app/user/entities/user.entity'
import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFormDto } from './dtos/create-form.dto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { th } from '@app/helper'
import { AdministrativeProceduresFormEntity } from './entities/administrative-procedures-form.entity'

@Injectable()
export class AdministrativeProceduresFormService {
  constructor(private readonly _prisma: PrismaService) {}

  async getAllForms() {
    try {
      const forms = await this._prisma.administrativeProceduresForm.findMany({})
      return th.toInstancesSafe(AdministrativeProceduresFormEntity, forms)
    } catch (error) {
      throw new BadRequestException('Error fetching forms')
    }
  }

  async create(user: UserEntity, dto: CreateFormDto) {
    try {
      const form = await this._prisma.administrativeProceduresForm.create({
        data: {
          ...dto,
          createdBy: {
            connect: {
              userId: user.id,
            },
          },
        },
      })
      return th.toInstanceSafe(AdministrativeProceduresFormEntity, form)
    } catch (err) {
      const error = err as PrismaClientKnownRequestError
      if (error.message.includes('Unique constraint failed')) {
        throw new BadRequestException('Form with this name already exists')
      }
      throw new BadRequestException('Error creating form')
    }
  }
}
