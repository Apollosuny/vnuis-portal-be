import { ParseUUIDPipe } from '@nestjs/common'
import { CreateFeedbackResponseDto } from './dtos/create-feedback-response.dto'
import { FeedbackResponseService } from './feedback-response.service'

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common'
import { UpdateFeedbackResponseDto } from './dtos/update-feedback-response.dto'
import { QueryFeedbackResponseDto } from './dtos/query-feedback-response.dto'
import { ApiBearerAuth, ApiOkResponse, ApiTags, ApiCreatedResponse } from '@nestjs/swagger'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { FeedbackResponseEntity } from './entities/feedback-response.entity'
import { CacheTTL } from '@nestjs/cache-manager'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'
import { CurUser } from '@app/core/decorators/user.decorator'
import { User } from '@prisma/client'
import { RawQuery } from '@app/core/decorators/query.decorator'
import { th } from '@app/helper/transform.helper'
import { DateTime } from 'luxon'
import { UserEntity } from '@app/user/entities/user.entity'

@ApiTags('Feedback Response')
@Controller('feedback-response')
@UseGuards(JwtGuard)
export class FeedbackResponseController {
  constructor(private readonly feedbackResponseService: FeedbackResponseService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackResponseEntity, isArray: true })
  @UseInterceptors(AppCacheInterceptor)
  async getFeedbackResponses(@Query() queryDto: QueryFeedbackResponseDto) {
    const responses = await this.feedbackResponseService.getFeedbackResponses(queryDto)
    return th.toInstancesSafe(FeedbackResponseEntity, responses)
  }

  @Get('feedback/:feedbackId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackResponseEntity, isArray: true })
  @UseInterceptors(AppCacheInterceptor)
  async getResponsesByFeedback(@Param('feedbackId', ParseUUIDPipe) feedbackId: string) {
    const responses = await this.feedbackResponseService.getResponsesByFeedback(feedbackId)
    return th.toInstancesSafe(FeedbackResponseEntity, responses)
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getResponseStats(@Query('operatorId') operatorId?: string) {
    return await this.feedbackResponseService.getResponseStats(operatorId)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackResponseEntity })
  @AppCacheKey((req) => `feedback-response-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  async getFeedbackResponse(@Param('id', ParseUUIDPipe) id: string) {
    const response = await this.feedbackResponseService.getFeedbackResponse(id)
    return th.toInstanceSafe(FeedbackResponseEntity, response)
  }

  @Post()
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => FeedbackResponseEntity })
  async createFeedbackResponse(@Body() createDto: CreateFeedbackResponseDto, @Request() req) {
    // This endpoint is deprecated - use POST /feedback-response/feedback/:feedbackId/responses instead
    throw new Error(
      'Please use POST /feedback-response/feedback/:feedbackId/responses to create a response for a specific feedback',
    )
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackResponseEntity })
  async updateFeedbackResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateFeedbackResponseDto,
    @Request() req,
  ) {
    const response = await this.feedbackResponseService.updateFeedbackResponse(id, updateDto, req.user.id)
    return th.toInstanceSafe(FeedbackResponseEntity, response)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse()
  async deleteFeedbackResponse(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    await this.feedbackResponseService.deleteFeedbackResponse(id, req.user.id)
    return { message: 'Feedback response deleted successfully' }
  }

  // Get responses for a specific feedback
  @Get('feedback/:feedbackId/responses')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackResponseEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getResponsesByFeedbackId(
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Query('includeInternal') includeInternal?: string,
  ) {
    const includeInternalBool = includeInternal === 'true'
    return this.feedbackResponseService.getResponsesByFeedbackId(feedbackId, includeInternalBool)
  }

  // Create response for a specific feedback
  @Post('feedback/:feedbackId/responses')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: () => FeedbackResponseEntity })
  async createResponseForFeedback(
    @Param('feedbackId', ParseUUIDPipe) feedbackId: string,
    @Body() createDto: CreateFeedbackResponseDto,
    @CurUser() user: UserEntity,
  ) {
    const response = await this.feedbackResponseService.createFeedbackResponse(createDto, user.operator.id, feedbackId)
    return th.toInstanceSafe(FeedbackResponseEntity, response)
  }

  // Get responses by operator
  @Get('operator/:operatorId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackResponseEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getResponsesByOperator(@Param('operatorId', ParseUUIDPipe) operatorId: string) {
    return this.feedbackResponseService.getResponsesByOperator(operatorId)
  }
}
