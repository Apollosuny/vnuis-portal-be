import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { AdministrativeProceduresFormService } from './administrative-procedures-form.service'
import { AdministrativeProceduresFormEntity } from './entities/administrative-procedures-form.entity'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { CreateFormDto } from './dtos/create-form.dto'
import { JwtGuard } from '@app/auth/guards/jwt.guard'

@ApiTags('official-forms')
@Controller('official-forms')
export class AdministrativeProceduresFormController {
  constructor(private readonly _administrativeProceduresFormService: AdministrativeProceduresFormService) {}

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  getAllForms() {
    return this._administrativeProceduresFormService.getAllForms()
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity })
  @HttpCode(HttpStatus.OK)
  getFormById(@Param('id') id: string) {
    return this._administrativeProceduresFormService.getFormById(id)
  }

  @Post('create')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity })
  @HttpCode(HttpStatus.CREATED)
  create(@CurUser() user: UserEntity, @Body() dto: CreateFormDto) {
    return this._administrativeProceduresFormService.create(user, dto)
  }
}
