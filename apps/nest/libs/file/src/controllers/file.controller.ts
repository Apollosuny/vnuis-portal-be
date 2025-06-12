import { Body, Controller, Post, SerializeOptions, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FileService } from '../services/file.service'
import { JwtSimpleGuard } from '@app/core/modules/simple-auth/jwt.simple.guard'
import { GenUploadS3Dto } from '../dtos/gen-upload-s3.dto'
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
  async genS3Upload(@CurUser() user: UserJwtPayload, @Body() dto: GenUploadS3Dto) {
    return await this.fileService.genS3Upload(user, dto)
  }
}
