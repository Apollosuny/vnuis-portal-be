import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { GenUploadS3Dto } from '../dtos/gen-upload-s3.dto'
import { UploadFormPdfDto } from '../dtos/upload-form-pdf.dto'
import path from 'path'
import { FileType } from '../models/file.type'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { bucket, bucketName } from '../utils/s3.helper'
import { lookup } from 'mime-types'
import { UserJwtPayload } from '@app/auth/payloads/user-jwt.payload'
import { PrismaService } from 'nestjs-prisma'

@Injectable()
export class FileService {
  constructor(private readonly prisma: PrismaService) {}
  async genS3Upload(user: UserJwtPayload, dto: GenUploadS3Dto) {
    if (!user.id) {
      throw new BadRequestException('User ID not provided')
    }

    const fileExt = path.extname(dto.fileName)
    const nameOnly = dto.fileName.substring(0, dto.fileName.length - fileExt.length)

    let s3Key = ''
    const timestamp = Date.now()
    const userId = user.id

    switch (dto.fileType) {
      case FileType.public:
        s3Key = `users/${userId}/${dto.fileType}/${nameOnly}_${timestamp}${fileExt}`
        break
      case FileType.private:
        s3Key = `users/${userId}/${dto.fileType}/${nameOnly}_${timestamp}${fileExt}`
        break
      case FileType.avatar:
        s3Key = `users/${userId}/avatars/${nameOnly}_${timestamp}${fileExt}`
        break
      case FileType.document:
        s3Key = `documents/${userId}/${nameOnly}_${timestamp}${fileExt}`
        break
      case FileType.form:
        s3Key = `forms/${userId}/${nameOnly}_${timestamp}${fileExt}`
        break
      case FileType.event:
        s3Key = `events/${userId}/${nameOnly}_${timestamp}${fileExt}`
        break
      case FileType.formPdf:
      case FileType.adminForm:
        // Validate PDF extension for form PDF files
        if (fileExt.toLowerCase() !== '.pdf') {
          throw new BadRequestException('Only PDF files are allowed for form documents')
        }

        // If formId is provided, check if form exists
        if (dto.metadata?.formId) {
          const form = await this.prisma.administrativeProceduresForm.findUnique({
            where: { id: dto.metadata.formId },
          })

          if (!form) {
            throw new NotFoundException(`Form with ID ${dto.metadata.formId} not found`)
          }
        }

        // Extract formId from metadata if provided
        const formId = dto.metadata?.formId ? `${dto.metadata.formId}/` : ''
        s3Key = `admin/forms/${formId}${nameOnly}_${timestamp}${fileExt}`
        break
      default:
        throw new BadRequestException('Invalid file type')
    }

    // Create presigned URL
    const result = await this.createS3Presigned(s3Key, dto.contentType)

    // For admin form PDF files, include additional information in the response
    if ((dto.fileType === FileType.formPdf || dto.fileType === FileType.adminForm) && dto.metadata?.formId) {
      // Generate the expected S3 URL for frontend reference
      const expectedS3Url = `https://${bucketName}.s3.amazonaws.com/${s3Key}`

      // Return enriched result with metadata
      return {
        ...result,
        expectedUrl: expectedS3Url,
        fileName: dto.fileName,
        filePath: s3Key,
        formId: dto.metadata.formId,
        uploadedBy: userId,
      }
    }

    return result
  }

  async createS3Presigned(s3Key: string, contentType = undefined) {
    const fileSize = 5 * 1024 * 1024
    const res = await createPresignedPost(bucket, {
      Bucket: bucketName,
      Key: s3Key,
      Expires: 5 * 600,
      Conditions: [['content-length-range', 1, fileSize]],
      Fields: {
        Key: s3Key,
        'Content-Type': contentType || lookup(s3Key),
        success_action_status: '200',
      },
    })

    delete res.fields.key
    return res
  }
}
