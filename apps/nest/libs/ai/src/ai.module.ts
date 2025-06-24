import { Module } from '@nestjs/common'
import { AiService } from './ai.service'
import { AiConfigService } from './ai-config.service'
import { ChatbotIntentService } from './chatbot-intent.service'
import { ChatbotController } from './chatbot.controller'

@Module({
  providers: [AiService, AiConfigService, ChatbotIntentService],
  controllers: [ChatbotController],
  exports: [AiService, ChatbotIntentService],
})
export class AiModule {}
