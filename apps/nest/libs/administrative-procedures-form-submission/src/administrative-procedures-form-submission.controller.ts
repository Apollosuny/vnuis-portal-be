import { Body, Controller, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common'
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
  async submit(@CurUser() user: UserEntity, @Param('formId') formId: string, @Body() dto: SubmitDto) {
    const submission = await this._administrativeProceduresFormSubmissionService.submit(user, formId, dto.result)
    try {
      console.log('Raw submission data:', submission)
      const transformedData = th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, submission)
      console.log('Transformed data:', transformedData)
      return transformedData
    } catch (error) {
      console.error('Error transforming submission:', error)
      return submission // Fall back to returning raw data if transformation fails
    }
  }
}
