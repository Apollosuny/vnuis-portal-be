import { Hash, th } from '@app/helper'
import { UserService } from '@app/user'
import { UserEntity } from '@app/user/entities/user.entity'
import { Injectable } from '@nestjs/common'
import { UserJwtPayload } from '../payloads/user-jwt.payload'
import { User } from '@prisma/client'
import { OperatorTokenResDto, StudentTokenResDto, TokenResDto } from '../dtos/token-res.dto'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class AuthService {
  constructor(
    private readonly _userService: UserService,
    private readonly _jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<UserEntity> {
    const user = await this._userService.findUser(username, { advantage: true })
    if (user && Hash.compare(password, user.password)) {
      return th.toInstanceSafe(UserEntity, user)
    }
    return null
  }

  async issueToken(user: User, options = { updateLastLogin: true }) {
    const payload = th.toInstanceSafe(UserJwtPayload, user)
    if (options.updateLastLogin) {
      await this._userService.update(user.id, { lastLoginAt: new Date() })
    }
    return th.toInstanceSafe(TokenResDto, {
      jwt: this._jwtService.sign(
        { ...payload },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_EXPIRES,
        },
      ),
      jwtRefresh: this._jwtService.sign(
        { ...payload },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_EXPIRES,
        },
      ),
      user: th.toInstanceSafe(UserEntity, user),
    })
  }
}
