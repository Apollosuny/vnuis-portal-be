import { ExtractJwt, Strategy } from 'passport-jwt'
import { PassportStrategy } from '@nestjs/passport'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { UserService } from '@app/user'
import { UserJwtPayload } from '../payloads/user-jwt.payload'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly _userSerivce: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    })
  }

  async validate(payload: UserJwtPayload) {
    if (!payload.id) throw new UnauthorizedException()
    const user = await this._userSerivce.findOne(payload.id, {
      advantage: true,
    })
    if (!user) throw new UnauthorizedException()
    return user
  }
}
