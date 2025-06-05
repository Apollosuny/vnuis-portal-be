import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { AdministrativeProceduresFormSubmissionService } from './administrative-procedures-form-submission.service'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { SubmitDto } from './dtos/submit.dto'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { AdministrativeProceduresFormSubmissionEntity } from './entities/administrative-procedures-form-submission.entity'
import { th } from '@app/helper'

@ApiTags('official-forms-submissions')
@Controller('official-forms-submissions')
export class AdministrativeProceduresFormSubmissionController {
  constructor(
    private readonly _administrativeProceduresFormSubmissionService: AdministrativeProceduresFormSubmissionService,
  ) {}

  @Post(':formId/submit')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity })
  @HttpCode(HttpStatus.CREATED)
  async submit(@CurUser() user: UserEntity, @Param('formId') formId: string, @Body() dto: any) {
    return await this._administrativeProceduresFormSubmissionService.submit(user, formId, dto)
  }

  @Get('user')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  async getUserSubmissions(@CurUser() user: UserEntity) {
    if (user.role !== 'STUDENT') {
      throw new UnauthorizedException('Only students can access their form submissions')
    }

    const submissions = await this._administrativeProceduresFormSubmissionService.getSubmissionsByStudentId(
      user.student.id,
    )
    try {
      return submissions.map((submission) =>
        th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, submission),
      )
    } catch (error) {
      console.error('Error transforming submissions:', error)
      return submissions
    }
  }

  @Get('form/:formId')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  async getSubmissionsByFormId(@CurUser() user: UserEntity, @Param('formId') formId: string) {
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new UnauthorizedException('Only administrators can access all form submissions')
    }

    const submissions = await this._administrativeProceduresFormSubmissionService.getSubmissionsByFormId(formId)
    try {
      return submissions.map((submission) =>
        th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, submission),
      )
    } catch (error) {
      console.error('Error transforming submissions:', error)
      return submissions
    }
  }
}
