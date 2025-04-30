import { ROLES_KEY } from '@app/core/decorators/role.decorator'
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { Role } from '@prisma/client'

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(private _reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean
    if (!result) return result

    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest()

      if (request.user.blocked) {
        throw new UnauthorizedException('You are blocked')
      }

      const requiredRoles = this._reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ])
      if (requiredRoles) {
        const role: Role = request.user.role
        return requiredRoles.includes(role)
      }
    }
    return result
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException()
    }
    return user
  }
}
