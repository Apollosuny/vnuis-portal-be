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
    // if (!user.profileId) {
    //   throw new BadRequestException('User has not profile');
    // }
    // const fileExt = path.extname(dto.fileName);
    // const nameOnly = dto.fileName.substring(
    //   0,
    //   dto.fileName.length - fileExt.length,
    // );
    // let s3Key = '';
    // switch (dto.fileType) {
    //   case FileType.public:
    //     s3Key = `users/${user.profileId}/${dto.fileType}/${nameOnly}_${Date.now()}${fileExt}`;
    //     return await this.createS3Presigned(s3Key, dto.contentType);
    // }
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
