import { UserEntity } from '@app/user/entities/user.entity'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { FormSubmissionStatus } from '@prisma/client'
import { SubmitDto } from './dtos/submit.dto'
import { AdministrativeProceduresFormSubmissionEntity } from './entities/administrative-procedures-form-submission.entity'
import { th } from '@app/helper'

@Injectable()
export class AdministrativeProceduresFormSubmissionService {
  constructor(private readonly _prisma: PrismaService) {}

  async submit(user: UserEntity, formId: string, dto: SubmitDto) {
    try {
      // Validate UUID format before querying
      if (!this.isValidUUID(formId)) {
        throw new NotFoundException(`Form with id ${formId} not found`)
      }

      // Check if form exists
      const form = await this._prisma.administrativeProceduresForm.findUnique({
        where: { id: formId },
      })

      if (!form) {
        throw new NotFoundException(`Form with id ${formId} not found`)
      }

      // Get student ID
      const student = await this._prisma.student.findUnique({
        where: { userId: user.id },
      })

      if (!student) {
        throw new BadRequestException('Only students can submit forms')
      }

      // Check if result is provided
      if (!dto.result || Object.keys(dto.result).length === 0) {
        throw new BadRequestException('result is required')
      }

      // Create the submission
      // Check that the form exists (will throw NotFoundException if not found)
      await this._prisma.administrativeProceduresForm.findUniqueOrThrow({
        where: { id: formId },
      })

      // Ensure result is a proper JSON object before storing
      const resultData = typeof dto.result === 'string' ? JSON.parse(dto.result) : dto.result

      const submission = await this._prisma.administrativeProceduresFormSubmission.create({
        data: {
          result: resultData, // Store as a proper JSON object
          status: FormSubmissionStatus.PENDING,
          form: {
            connect: { id: formId },
          },
          student: {
            connect: { id: student.id },
          },
        },
        include: {
          form: true,
          student: true,
        },
      })

      // Return the submission with properly shaped response
      const responseData = {
        id: submission.id,
        formId: submission.formId,
        studentId: submission.studentId,
        status: submission.status,
        result: submission.result,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        handleAt: submission.handleAt,
        remarks: submission.remarks,
        handleByOperatorId: submission.handleByOperatorId,
      }

      return th.toInstanceSafe(AdministrativeProceduresFormSubmissionEntity, responseData)
    } catch (error) {
      console.log('Error submitting form:', error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException('Error submitting form')
    }
  }

  /**
   * Validates if a string is a valid UUID
   * @param uuid String to validate
   * @returns true if valid UUID format
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  /**
   * Get all form submissions for a student
   * @param studentId Student ID
   * @returns List of form submissions
   */
  async getSubmissionsByStudentId(studentId: string) {
    if (!this.isValidUUID(studentId)) {
      throw new BadRequestException(`Invalid student ID format: ${studentId}`)
    }

    try {
      const submissions = await this._prisma.administrativeProceduresFormSubmission.findMany({
        where: { studentId },
        include: {
          form: true,
          student: true,
          handleBy: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return submissions
    } catch (error) {
      console.error('Error fetching student submissions:', error)
      throw new BadRequestException('Error fetching student form submissions')
    }
  }

  /**
   * Get all submissions for a specific form
   * @param formId Form ID
   * @returns List of form submissions
   */
  async getSubmissionsByFormId(formId: string) {
    if (!this.isValidUUID(formId)) {
      throw new BadRequestException(`Invalid form ID format: ${formId}`)
    }

    try {
      const submissions = await this._prisma.administrativeProceduresFormSubmission.findMany({
        where: { formId },
        include: {
          form: true,
          student: true,
          handleBy: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return submissions
    } catch (error) {
      console.error('Error fetching form submissions:', error)
      throw new BadRequestException('Error fetching form submissions')
    }
  }

  /**
   * Get a specific form submission by ID
   * @param id Submission ID
   * @param options Options to customize the query
   * @returns The form submission
   */
  async getSubmissionById(id: string, options?: { includeForm?: boolean }) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException(`Invalid submission ID format: ${id}`)
    }

    try {
      const submission = await this._prisma.administrativeProceduresFormSubmission.findUnique({
        where: { id },
        include: {
          // Always include student and operator
          student: true,
          handleBy: true,
          // Conditionally include form
          form: options?.includeForm === true,
        },
      })

      if (!submission) {
        throw new NotFoundException(`Form submission with id ${id} not found`)
      }

      // Ensure the result field is properly processed
      if (submission.result) {
        try {
          // If result is a string (serialized JSON), parse it
          if (typeof submission.result === 'string') {
            submission.result = JSON.parse(submission.result)
          }

          // If result is already an object, ensure it's properly structured
          if (typeof submission.result === 'object') {
            // Prisma sometimes returns an empty object for JSON fields
            // Make sure it's a proper object with question ID keys
            if (Object.keys(submission.result).length === 0) {
              console.warn('Empty result object detected, checking for potential data loss')
            }
          }
        } catch (parseError) {
          console.error('Error processing submission result:', parseError)
          // Keep the original result if parsing fails
        }
      }

      return submission
    } catch (error) {
      console.error('Error fetching submission:', error)
      if (error instanceof NotFoundException) {
        throw error
      }
      throw new BadRequestException('Error fetching form submission details')
    }
  }

  /**
   * Approve a form submission
   * @param id Submission ID
   * @param operatorId ID of the operator approving the submission
   * @param remarks Optional remarks for the approval
   * @returns The updated form submission
   */
  async approveSubmission(id: string, operatorId: string, remarks?: string) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException(`Invalid submission ID format: ${id}`)
    }

    try {
      const submission = await this._prisma.administrativeProceduresFormSubmission.findUnique({
        where: { id },
      })

      if (!submission) {
        throw new NotFoundException(`Form submission with id ${id} not found`)
      }

      // Don't approve if not in pending state
      if (submission.status !== FormSubmissionStatus.PENDING) {
        throw new BadRequestException(`Form submission with id ${id} is not in pending state`)
      }

      const updatedSubmission = await this._prisma.administrativeProceduresFormSubmission.update({
        where: { id },
        data: {
          status: FormSubmissionStatus.APPROVED,
          remarks: remarks || null,
          handleAt: new Date(),
          handleByOperatorId: operatorId,
        },
        include: {
          form: true,
          student: {
            include: {
              user: true,
            },
          },
          handleBy: true,
        },
      })

      return updatedSubmission
    } catch (error) {
      console.error('Error approving submission:', error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException(`Failed to approve submission: ${error.message}`)
    }
  }

  /**
   * Reject a form submission
   * @param id Submission ID
   * @param operatorId ID of the operator rejecting the submission
   * @param remarks Rejection remarks (required)
   * @returns The updated form submission
   */
  async rejectSubmission(id: string, operatorId: string, remarks: string) {
    if (!this.isValidUUID(id)) {
      throw new BadRequestException(`Invalid submission ID format: ${id}`)
    }

    if (!remarks) {
      throw new BadRequestException('Remarks are required when rejecting a submission')
    }

    try {
      const submission = await this._prisma.administrativeProceduresFormSubmission.findUnique({
        where: { id },
      })

      if (!submission) {
        throw new NotFoundException(`Form submission with id ${id} not found`)
      }

      // Don't reject if not in pending state
      if (submission.status !== FormSubmissionStatus.PENDING) {
        throw new BadRequestException(`Form submission with id ${id} is not in pending state`)
      }

      const updatedSubmission = await this._prisma.administrativeProceduresFormSubmission.update({
        where: { id },
        data: {
          status: FormSubmissionStatus.REJECTED,
          remarks: remarks,
          handleAt: new Date(),
          handleByOperatorId: operatorId,
        },
        include: {
          form: true,
          student: {
            include: {
              user: true,
            },
          },
          handleBy: true,
        },
      })

      return updatedSubmission
    } catch (error) {
      console.error('Error rejecting submission:', error)
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error
      }
      throw new BadRequestException(`Failed to reject submission: ${error.message}`)
    }
  }
}
