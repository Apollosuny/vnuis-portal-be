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
  Put,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common'
import { FeedbackAnalyticsService } from './feedback-analytics.service'
import { QueryFeedbackAnalyticsDto } from './dtos/query-feedback-analytics.dto'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { th } from '@app/helper/transform.helper'
import { FeedbackAnalyticsEntity } from './entities/feedback-analytics.entity'
import { DateTime } from 'luxon'
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiCreatedResponse } from '@nestjs/swagger'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'

@ApiTags('Feedback Analytics')
@Controller('feedback-analytics')
@UseGuards(JwtGuard)
export class FeedbackAnalyticsController {
  constructor(private readonly feedbackAnalyticsService: FeedbackAnalyticsService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackAnalyticsEntity, isArray: true })
  @UseInterceptors(AppCacheInterceptor)
  async getFeedbackAnalytics(@Query() queryDto: QueryFeedbackAnalyticsDto) {
    const analytics = await this.feedbackAnalyticsService.getFeedbackAnalytics(queryDto)
    return th.toInstancesSafe(FeedbackAnalyticsEntity, analytics)
  }

  @Get('dashboard')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getDashboardOverview(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getDashboardOverview(start?.toISO(), end?.toISO())
  }

  @Get('stats')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getStats(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getDashboardOverview(start?.toISO(), end?.toISO())
  }

  @Get('sentiment')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getSentimentAnalysis(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getSentimentAnalysis(start?.toISO(), end?.toISO())
  }

  @Get('category')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getCategoryAnalysis(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getCategoryAnalysis(start?.toISO(), end?.toISO())
  }

  @Get('response-time')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getResponseTimeAnalysis(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getResponseTimeAnalysis(start?.toISO(), end?.toISO())
  }

  @Get('rating')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getRatingAnalysis(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getRatingAnalysis(start?.toISO(), end?.toISO())
  }

  @Get('trends')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getTrendAnalysis(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
    const start = startDate ? DateTime.fromISO(startDate) : undefined
    const end = endDate ? DateTime.fromISO(endDate) : undefined
    return await this.feedbackAnalyticsService.getTrendAnalysis(start?.toISO(), end?.toISO())
  }

  @Get('weekly-trends')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getWeeklyTrends(@Query('weeks') weeks: number = 4) {
    return await this.feedbackAnalyticsService.getWeeklyTrends(weeks)
  }

  @Get('monthly-trends')
  @ApiBearerAuth()
  @ApiOkResponse()
  @UseInterceptors(AppCacheInterceptor)
  async getMonthlyTrends(@Query('months') months: number = 12) {
    return await this.feedbackAnalyticsService.getMonthlyTrends(months)
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackAnalyticsEntity })
  @AppCacheKey((req) => `feedback-analytics-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  async getFeedbackAnalyticsById(@Param('id', ParseUUIDPipe) id: string) {
    const analytics = await this.feedbackAnalyticsService.getFeedbackAnalyticsById(id)
    return th.toInstanceSafe(FeedbackAnalyticsEntity, analytics)
  }

  @Post('generate')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => FeedbackAnalyticsEntity })
  async generateAnalyticsData(@Query('date') date: string) {
    const targetDate = date ? DateTime.fromISO(date) : DateTime.now()
    const analytics = await this.feedbackAnalyticsService.generateAnalyticsData(targetDate)
    return th.toInstanceSafe(FeedbackAnalyticsEntity, analytics)
  }

  // Test endpoint
  @Get('admin/test')
  @ApiBearerAuth()
  test() {
    return { message: 'Feedback Analytics module is working' }
  }
}
