import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { OperatorService } from './operator.service'
import { OperatorEntity } from './entities/operator.entity'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { JwtGuard } from '@app/auth/guards/jwt.guard'

@ApiTags('operator')
@Controller('operator')
export class OperatorController {
  constructor(private readonly _operatorService: OperatorService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: OperatorEntity })
  me(@CurUser() user: UserEntity) {
    return this._operatorService.findOperatorByUserId(user.id)
  }
}
