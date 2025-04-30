import { th } from '@app/helper'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { OperatorEntity } from './entities/operator.entity'

@Injectable()
export class OperatorService {
  constructor(private _prisma: PrismaService) {}

  async findOperatorByUserId(userId: string) {
    const operator = await this._prisma.operator.findUnique({
      where: {
        userId,
      },
    })
    return th.toInstanceSafe(OperatorEntity, operator)
  }
}
