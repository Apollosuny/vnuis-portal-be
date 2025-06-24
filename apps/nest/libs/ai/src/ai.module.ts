import { Module } from '@nestjs/common'
import { AiService } from './ai.service'
import { AiConfigService } from './ai-config.service'

@Module({
  providers: [AiService, AiConfigService],
  exports: [AiService],
})
export class AiModule {}
