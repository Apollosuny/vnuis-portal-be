import { Module } from '@nestjs/common'
import { FeedbackAnalyticsController } from './feedback-analytics.controller'
import { FeedbackAnalyticsService } from './feedback-analytics.service'

@Module({
  controllers: [FeedbackAnalyticsController],
  providers: [FeedbackAnalyticsService],
  exports: [FeedbackAnalyticsService],
})
export class FeedbackAnalyticsModule {}
