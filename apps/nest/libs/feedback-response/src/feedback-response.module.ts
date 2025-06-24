import { Module } from '@nestjs/common'
import { FeedbackResponseController } from './feedback-response.controller'
import { FeedbackResponseService } from './feedback-response.service'

@Module({
  controllers: [FeedbackResponseController],
  providers: [FeedbackResponseService],
  exports: [FeedbackResponseService],
})
export class FeedbackResponseModule {}
