import { UserEntity } from '@app/user/entities/user.entity'
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import { FormSubmissionStatus } from '@prisma/client'

@Injectable()
export class AdministrativeProceduresFormSubmissionService {
  constructor(private readonly _prisma: PrismaService) {}
  async submit(user: UserEntity, formId: string, result: Record<string, any>) {
    try {
      console.log('Attempting to find form with ID:', formId)
      console.log('ID type:', typeof formId)

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
      if (!result || Object.keys(result).length === 0) {
        throw new BadRequestException('result is required')
      }

      // Create the submission
      // Check that the form exists (will throw NotFoundException if not found)
      await this._prisma.administrativeProceduresForm.findUniqueOrThrow({
        where: { id: formId },
      })

      const submission = await this._prisma.administrativeProceduresFormSubmission.create({
        data: {
          result: result as any, // Cast to any to help with Prisma type issues
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

      // Debug the response
      console.log('Submission created successfully:', responseData)

      return responseData
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
}
