import { Module } from '@nestjs/common'
import { FeedbackController } from './feedback.controller'
import { FeedbackService } from './feedback.service'
import { AiModule } from '@app/ai'
import { ThrottlerModule } from '@nestjs/throttler'

@Module({
  imports: [
    AiModule,
    ThrottlerModule.forRoot({
      ttl: 60000, // 60s (ms)
      limit: 3, // 3 requests mỗi 60s cho mỗi IP
    }),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
