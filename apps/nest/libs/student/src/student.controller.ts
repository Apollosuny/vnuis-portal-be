import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger'
import { StudentService } from './student.service'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { CreateStudentDto } from './dtos/create-student.dto'
import { UpdateStudentDto } from './dtos/update-student.dto'
import { GetStudentsDto } from './dtos/get-students.dto'
import { StudentEntity } from './entities/student.entity'

@ApiTags('student')
@Controller('student')
export class StudentController {
  constructor(private _studentService: StudentService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user student profile' })
  @ApiOkResponse({ type: StudentEntity })
  @HttpCode(HttpStatus.OK)
  me(@CurUser() user: UserEntity) {
    return this._studentService.findStudentByUserId(user.id)
  }

  @Get()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all students with pagination and search' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        students: { type: 'array', items: { $ref: '#/components/schemas/StudentEntity' } },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'page', required: false, type: 'number', description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: 'number', description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: 'string', description: 'Search by name or email' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'],
    description: 'Filter by status',
  })
  @HttpCode(HttpStatus.OK)
  async findAll(@Query(ValidationPipe) query: GetStudentsDto) {
    return this._studentService.findAll(query)
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get student by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Student ID' })
  @ApiOkResponse({ type: StudentEntity })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    console.log('id', id)
    return this._studentService.findOne(id)
  }

  @Post()
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new student' })
  @ApiCreatedResponse({ type: StudentEntity })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body(ValidationPipe) createStudentDto: CreateStudentDto, @CurUser() user: UserEntity) {
    console.log('createStudentDto', createStudentDto)
    return this._studentService.create(createStudentDto, user.id)
  }

  @Put(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update student by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Student ID' })
  @ApiOkResponse({ type: StudentEntity })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body(ValidationPipe) updateStudentDto: UpdateStudentDto) {
    return this._studentService.update(id, updateStudentDto)
  }

  @Delete(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete student by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Student ID' })
  @ApiNoContentResponse({ description: 'Student successfully deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this._studentService.remove(id)
  }
}
