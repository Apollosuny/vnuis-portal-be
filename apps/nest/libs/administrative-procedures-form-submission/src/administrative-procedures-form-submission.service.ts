import { UserEntity } from '@app/user/entities/user.entity'
import { Injectable } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class AdministrativeProceduresFormSubmissionService {
  constructor(private readonly _prisma: PrismaService) {}

  // async submit(user: UserEntity, )
}
