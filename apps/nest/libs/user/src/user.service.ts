import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { UserEntity } from './entities/user.entity'
import { th } from '@app/helper'
import { Prisma } from '@prisma/client'

@Injectable()
export class UserService {
  constructor(private readonly _prisma: PrismaService) {}

  async findUser(username: string, options = { advantage: false }): Promise<UserEntity | undefined> {
    const user = await this._prisma.user.findUnique({
      where: {
        username,
      },
    })
    if (user) {
      if (options.advantage) {
        return th.toInstanceUnsafe(UserEntity, user)
      } else {
        return th.toInstanceSafe(UserEntity, user)
      }
    }
  }

  async findOne(id: string, options = { advantage: false }): Promise<UserEntity | undefined> {
    const user = await this._prisma.user.findUnique({
      where: { id },
      include: {
        student: true,
        operator: true,
      },
    })
    if (user) {
      if (options.advantage) {
        return th.toInstanceUnsafe(UserEntity, user)
      } else {
        return th.toInstanceSafe(UserEntity, user)
      }
    }
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this._prisma.user.update({
      where: {
        id,
      },
      data: data,
    })
  }
}
