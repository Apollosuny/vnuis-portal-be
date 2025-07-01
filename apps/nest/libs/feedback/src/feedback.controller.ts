import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
  Put,
  ParseUUIDPipe,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import { FeedbackService } from './feedback.service'
import { CreateFeedbackDto } from './dtos/create-feedback.dto'
import { UpdateFeedbackDto } from './dtos/update-feedback.dto'
import { QueryFeedbackDto } from './dtos/query-feedback.dto'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { th } from '@app/helper/transform.helper'
import { FeedbackEntity } from './entities/feedback.entity'
import { DateTime } from 'luxon'
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'
import { FeedbackStatus } from '@prisma/client'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { ExposeAll } from '@app/core/decorators/expose-all.decorator'
import { RawQuery } from '@app/core/decorators/query.decorator'

// @UseGuards(ThrottlerGuard)
@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity, isArray: true })
  @UseInterceptors(AppCacheInterceptor)
  @ExposeAll()
  async getMyFeedbacks(@CurUser() user: UserEntity, @RawQuery() queryFeedbackDto: QueryFeedbackDto) {
    return await this.feedbackService.getMyFeedbacks(user, queryFeedbackDto)
  }

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity, isArray: true })
  @UseInterceptors(AppCacheInterceptor)
  @ExposeAll()
  async getFeedbacks(@RawQuery() queryFeedbackDto: QueryFeedbackDto) {
    return await this.feedbackService.getFeedbacks(queryFeedbackDto)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  @AppCacheKey((req) => `feedback-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  async getFeedback(@Param('id', ParseUUIDPipe) id: string) {
    const feedback = await this.feedbackService.getFeedback(id)
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  async createFeedback(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req) {
    const feedback = await this.feedbackService.createFeedback(createFeedbackDto, req.user)
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  async updateFeedback(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
    @Request() req,
  ) {
    const feedback = await this.feedbackService.updateFeedback(id, updateFeedbackDto, req.user)
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  async deleteFeedback(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.feedbackService.deleteFeedback(id, req.user)
    return { message: 'Feedback deleted successfully' }
  }

  // Admin/Operator endpoints
  @Patch(':id/status')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  async updateFeedbackStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
    @CurUser() user: UserEntity,
  ) {
    const feedback = await this.feedbackService.updateFeedbackStatus(id, status as FeedbackStatus, user.operator.id)
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  @Post(':id/analyze')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  async analyzeSentiment(@Param('id', ParseUUIDPipe) id: string) {
    const feedback = await this.feedbackService.analyzeSentiment(id)
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }

  @Post(':id/suggest-response')
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'AI response suggestion' })
  async generateResponseSuggestion(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.feedbackService.generateResponseSuggestion(id)
    return result
  }

  @Post(':id/auto-categorize')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackEntity })
  async autoCategorizeFeedback(@Param('id', ParseUUIDPipe) id: string) {
    const feedback = await this.feedbackService.autoCategorizeFeedback(id)
    return th.toInstanceSafe(FeedbackEntity, feedback)
  }
}
