import { Injectable } from '@nestjs/common'

@Injectable()
export class AiConfigService {
  get geminiApiKey(): string {
    return process.env.GEMINI_API_KEY || ''
  }

  get geminiModel(): string {
    return process.env.GEMINI_MODEL || 'gemini-2.0-flash'
  }

  get geminiMaxTokens(): number {
    return parseInt(process.env.GEMINI_MAX_TOKENS || '1000', 10)
  }

  get geminiTemperature(): number {
    return parseFloat(process.env.GEMINI_TEMPERATURE || '0.1')
  }

  get isEnabled(): boolean {
    return this.geminiApiKey.length > 0
  }
}
