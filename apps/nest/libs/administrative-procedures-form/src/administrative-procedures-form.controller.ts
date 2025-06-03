import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { AdministrativeProceduresFormService } from './administrative-procedures-form.service'
import { AdministrativeProceduresFormEntity } from './entities/administrative-procedures-form.entity'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { CreateFormDto } from './dtos/create-form.dto'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { RolesGuard } from '@app/auth/guards/roles.guard'
import { Roles } from '@app/auth/decorators/roles.decorator'
import { Role } from '@prisma/client'
import { UpdateFormDto } from './dtos/update-form.dto'

@ApiTags('official-forms')
@Controller('official-forms')
export class AdministrativeProceduresFormController {
  constructor(private readonly _administrativeProceduresFormService: AdministrativeProceduresFormService) {}

  @Get('published')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  getPublishedForms() {
    return this._administrativeProceduresFormService.getPublishedForms()
  }

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
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
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity })
  @HttpCode(HttpStatus.CREATED)
  create(@CurUser() user: UserEntity, @Body() dto: CreateFormDto) {
    return this._administrativeProceduresFormService.create(user, dto)
  }

  @Patch(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity })
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this._administrativeProceduresFormService.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.SUPERADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string) {
    return this._administrativeProceduresFormService.delete(id)
  }

  @Patch(':id/activate')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity })
  @HttpCode(HttpStatus.OK)
  activate(@Param('id') id: string) {
    return this._administrativeProceduresFormService.setActiveStatus(id, true)
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormEntity })
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this._administrativeProceduresFormService.setActiveStatus(id, false)
  }
}
