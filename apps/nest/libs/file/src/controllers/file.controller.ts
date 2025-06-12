import { Body, Controller, Post, SerializeOptions, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { FileService } from '../services/file.service'
import { JwtSimpleGuard } from '@app/core/modules/simple-auth/jwt.simple.guard'
import { GenUploadS3Dto } from '../dtos/gen-upload-s3.dto'
import { UploadFormPdfDto } from '../dtos/upload-form-pdf.dto'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserJwtPayload } from '@app/auth/payloads/user-jwt.payload'

@ApiTags('storage')
@Controller('storage')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('genS3Upload')
  @ApiBearerAuth()
  @UseGuards(JwtSimpleGuard)
  @SerializeOptions({ strategy: 'exposeAll' })
  @ApiOperation({
    summary: 'Generate presigned URL for S3 upload',
    description:
      'Creates a presigned URL for direct upload to S3. For admin form PDF upload, use fileType=formPdf or adminForm and include formId in metadata.',
  })
  async genS3Upload(@CurUser() user: UserJwtPayload, @Body() dto: GenUploadS3Dto) {
    return await this.fileService.genS3Upload(user, dto)
  }
}
