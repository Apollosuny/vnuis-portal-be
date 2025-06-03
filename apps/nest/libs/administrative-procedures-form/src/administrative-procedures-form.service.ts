import { UserEntity } from '@app/user/entities/user.entity'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { CreateFormDto } from './dtos/create-form.dto'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import { th } from '@app/helper'
import { AdministrativeProceduresFormEntity } from './entities/administrative-procedures-form.entity'
import { UpdateFormDto } from './dtos/update-form.dto'

@Injectable()
export class AdministrativeProceduresFormService {
  constructor(private readonly _prisma: PrismaService) {}

  async getPublishedForms() {
    try {
      const forms = await this._prisma.administrativeProceduresForm.findMany({
        where: { isActive: true },
      })
      return th.toInstancesSafe(AdministrativeProceduresFormEntity, forms)
    } catch (error) {
      throw new BadRequestException('Error fetching published forms')
    }
  }

  async getAllForms() {
    try {
      const forms = await this._prisma.administrativeProceduresForm.findMany({})
      return th.toInstancesSafe(AdministrativeProceduresFormEntity, forms)
    } catch (error) {
      throw new BadRequestException('Error fetching forms')
    }
  }

  async getFormById(id: string) {
    try {
      const form = await this._prisma.administrativeProceduresForm.findUnique({
        where: { id },
      })

      if (!form) {
        throw new BadRequestException(`Form with id ${id} not found`)
      }

      return th.toInstanceSafe(AdministrativeProceduresFormEntity, form)
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Error fetching form')
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

  async update(id: string, dto: UpdateFormDto) {
    try {
      const form = await this._prisma.administrativeProceduresForm.findUnique({
        where: { id },
      })

      if (!form) {
        throw new NotFoundException(`Form with id ${id} not found`)
      }

      const updatedForm = await this._prisma.administrativeProceduresForm.update({
        where: { id },
        data: dto,
      })

      return th.toInstanceSafe(AdministrativeProceduresFormEntity, updatedForm)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      if (error instanceof PrismaClientKnownRequestError && error.message.includes('Unique constraint failed')) {
        throw new BadRequestException('Form with this name already exists')
      }
      throw new BadRequestException('Error updating form')
    }
  }

  async delete(id: string) {
    try {
      const form = await this._prisma.administrativeProceduresForm.findUnique({
        where: { id },
        include: {
          submissions: true,
        },
      })

      if (!form) {
        throw new NotFoundException(`Form with id ${id} not found`)
      }

      if (form.submissions && form.submissions.length > 0) {
        throw new BadRequestException('Cannot delete form with existing submissions')
      }

      await this._prisma.administrativeProceduresForm.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Error deleting form')
    }
  }

  async setActiveStatus(id: string, isActive: boolean) {
    try {
      const form = await this._prisma.administrativeProceduresForm.findUnique({
        where: { id },
      })

      if (!form) {
        throw new NotFoundException(`Form with id ${id} not found`)
      }

      const updatedForm = await this._prisma.administrativeProceduresForm.update({
        where: { id },
        data: { isActive },
      })

      return th.toInstanceSafe(AdministrativeProceduresFormEntity, updatedForm)
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException(`Error ${isActive ? 'activating' : 'deactivating'} form`)
    }
  }
}
