import { UserEntity } from '@app/user/entities/user.entity'
import { PickType } from '@nestjs/swagger'

export class UserJwtPayload extends PickType(UserEntity, ['id', 'username', 'jwtValidFrom', 'blocked', 'role']) {}
