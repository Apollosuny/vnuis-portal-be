import { Test, TestingModule } from '@nestjs/testing'
import { AiService } from './ai.service'
import { AiConfigService } from './ai-config.service'

describe('AiService', () => {
  let service: AiService
  let configService: AiConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AiConfigService,
          useValue: {
            geminiApiKey: 'test-api-key',
            geminiModel: 'gemini-2.0-flash',
            geminiMaxTokens: 1000,
            geminiTemperature: 0.1,
            isEnabled: true,
          },
        },
      ],
    }).compile()

    service = module.get<AiService>(AiService)
    configService = module.get<AiConfigService>(AiConfigService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('analyzeFeedback', () => {
    it('should return null when AI is not enabled', async () => {
      jest.spyOn(configService, 'isEnabled', 'get').mockReturnValue(false)

      const result = await service.analyzeFeedback({
        title: 'Test Feedback',
        content: 'This is a test feedback',
        category: 'GENERAL',
      })

      expect(result).toBeNull()
    })

    it('should handle API errors gracefully', async () => {
      // Mock the AI service to throw an error
      jest.spyOn(service as any, 'generateContent').mockRejectedValue(new Error('API Error'))

      const result = await service.analyzeFeedback({
        title: 'Test Feedback',
        content: 'This is a test feedback',
        category: 'GENERAL',
      })

      expect(result).toBeNull()
    })
  })

  describe('generateResponseSuggestion', () => {
    it('should return null when AI is not available', async () => {
      jest.spyOn(configService, 'isEnabled', 'get').mockReturnValue(false)

      const result = await service.generateResponseSuggestion('Test feedback content')

      expect(result).toBeNull()
    })
  })

  describe('categorizeFeedback', () => {
    it('should return null when AI is not available', async () => {
      jest.spyOn(configService, 'isEnabled', 'get').mockReturnValue(false)

      const result = await service.categorizeFeedback('Test Title', 'Test Content')

      expect(result).toBeNull()
    })
  })
})
