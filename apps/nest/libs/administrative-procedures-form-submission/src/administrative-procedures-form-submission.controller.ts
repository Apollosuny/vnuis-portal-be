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
  BadRequestException,
} from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { AdministrativeProceduresFormSubmissionService } from './administrative-procedures-form-submission.service'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { PrismaService } from 'nestjs-prisma'
import { SubmitDto } from './dtos/submit.dto'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { AdministrativeProceduresFormSubmissionEntity } from './entities/administrative-procedures-form-submission.entity'
import { th } from '@app/helper'
import { TransformerExposeAll } from '@app/core/decorators/transformer-expose-all.decorator'
import { FormSubmissionStatus } from '@prisma/client'

@ApiTags('official-forms-submissions')
@Controller('official-forms-submissions')
export class AdministrativeProceduresFormSubmissionController {
  constructor(
    private readonly _administrativeProceduresFormSubmissionService: AdministrativeProceduresFormSubmissionService,
    private readonly _prisma: PrismaService,
  ) {}

  @Get('all')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity, isArray: true })
  @HttpCode(HttpStatus.OK)
  async getAllSubmissions(@CurUser() user: UserEntity) {
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new UnauthorizedException('Only administrators can access all form submissions')
    }

    const submissions = await this._administrativeProceduresFormSubmissionService.getAllSubmissions()
    try {
      return submissions.map((submission) =>
        th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, submission),
      )
    } catch (error) {
      console.error('Error transforming submissions:', error)
      return submissions
    }
  }

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

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity })
  @HttpCode(HttpStatus.OK)
  @TransformerExposeAll()
  async getSubmissionById(@CurUser() user: UserEntity, @Param('id') id: string) {
    const submission = await this._administrativeProceduresFormSubmissionService.getSubmissionById(id, {
      includeForm: true, // Include the related form data
    })

    // Check if the user has permission to view this submission
    if (
      user.role !== 'ADMIN' &&
      user.role !== 'SUPERADMIN' &&
      user.role === 'STUDENT' &&
      user.student.id !== submission.studentId
    ) {
      throw new UnauthorizedException('You do not have permission to access this submission')
    }

    try {
      // Make sure the result field is properly handled before transformation
      if (submission.result && typeof submission.result === 'object') {
        // Create a clean copy to avoid mutating the original object
        const submissionWithProcessedResult = {
          ...submission,
          result: { ...submission.result }, // Ensure result is a proper object
        }

        return th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, submissionWithProcessedResult)
      }

      return th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, submission)
    } catch (error) {
      console.error('Error transforming submission:', error)
      return submission
    }
  }

  @Post(':id/approve')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity })
  @HttpCode(HttpStatus.OK)
  @TransformerExposeAll()
  async approveSubmission(@CurUser() user: UserEntity, @Param('id') id: string, @Body() dto: { remarks?: string }) {
    // Only admin users can approve submissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new UnauthorizedException('Only administrators can approve form submissions')
    }

    if (!user.operator) {
      throw new BadRequestException('User does not have operator permissions')
    }

    try {
      const updatedSubmission = await this._prisma.administrativeProceduresFormSubmission.update({
        where: { id },
        data: {
          status: FormSubmissionStatus.APPROVED,
          remarks: dto.remarks || null,
          handleAt: new Date(),
          handleBy: {
            connect: { id: user.operator.id },
          },
        },
        include: {
          form: true,
          student: true,
          handleBy: true,
        },
      })

      return th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, updatedSubmission)
    } catch (error) {
      console.error('Error approving submission:', error)
      throw new BadRequestException(`Failed to approve submission: ${error.message}`)
    }
  }

  @Post(':id/reject')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => AdministrativeProceduresFormSubmissionEntity })
  @HttpCode(HttpStatus.OK)
  @TransformerExposeAll()
  async rejectSubmission(@CurUser() user: UserEntity, @Param('id') id: string, @Body() dto: { remarks: string }) {
    // Only admin users can reject submissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPERADMIN') {
      throw new UnauthorizedException('Only administrators can reject form submissions')
    }

    if (!user.operator) {
      throw new BadRequestException('User does not have operator permissions')
    }

    // Remarks are required for rejection
    if (!dto.remarks) {
      throw new BadRequestException('Remarks are required when rejecting a submission')
    }

    try {
      const updatedSubmission = await this._prisma.administrativeProceduresFormSubmission.update({
        where: { id },
        data: {
          status: FormSubmissionStatus.REJECTED,
          remarks: dto.remarks,
          handleAt: new Date(),
          handleBy: {
            connect: { id: user.operator.id },
          },
        },
        include: {
          form: true,
          student: true,
          handleBy: true,
        },
      })

      return th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, updatedSubmission)
    } catch (error) {
      console.error('Error rejecting submission:', error)
      throw new BadRequestException(`Failed to reject submission: ${error.message}`)
    }
  }
}
