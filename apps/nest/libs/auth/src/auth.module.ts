import { Module } from '@nestjs/common'
import { AuthService } from './services/auth.service'
import { UserModule } from '@app/user'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'
import { LocalStrategy } from './strategies/local.strategy'
import { LocalGuard } from './guards/local.guard'
import { AuthController } from './controllers/auth.controller'
import { JwtStrategy } from './strategies/jwt.strategy'
import { JwtGuard } from './guards/jwt.guard'

@Module({
  imports: [UserModule, PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, LocalGuard, JwtStrategy, JwtGuard],
  exports: [AuthService],
})
export class AuthModule {}
