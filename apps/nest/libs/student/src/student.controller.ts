import { Controller, Get, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { StudentService } from './student.service'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private _studentService: StudentService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse()
  @HttpCode(HttpStatus.OK)
  me(@CurUser() user: UserEntity) {
    return this._studentService.findStudentByUserId(user.id)
  }
}
