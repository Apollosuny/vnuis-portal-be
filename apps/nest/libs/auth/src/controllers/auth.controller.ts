import { Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { AuthService } from '../services/auth.service'
import { LocalGuard } from '../guards/local.guard'
import { TokenResDto } from '../dtos/token-res.dto'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { JwtGuard } from '../guards/jwt.guard'
import { ExcludeStudent } from '@app/core/decorators/exclude-student.decorator'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Post('local')
  @UseGuards(LocalGuard)
  @ApiCreatedResponse({ type: () => TokenResDto })
  @HttpCode(HttpStatus.OK)
  login(@CurUser() user: UserEntity) {
    return this._authService.issueToken(user, { updateLastLogin: true })
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOkResponse({ type: () => UserEntity })
  @HttpCode(HttpStatus.OK)
  me(@Req() req) {
    return req.user
  }
}
