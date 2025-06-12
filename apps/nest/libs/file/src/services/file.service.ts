import { BadRequestException, Injectable } from '@nestjs/common'
import { GenUploadS3Dto } from '../dtos/gen-upload-s3.dto'
import path from 'path'
import { FileType } from '../models/file.type'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { bucket, bucketName } from '../utils/s3.helper'
import { lookup } from 'mime-types'
import { UserJwtPayload } from '@app/auth/payloads/user-jwt.payload'

@Injectable()
export class FileService {
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
      default:
        throw new BadRequestException('Invalid file type')
    }

    return await this.createS3Presigned(s3Key, dto.contentType)
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
