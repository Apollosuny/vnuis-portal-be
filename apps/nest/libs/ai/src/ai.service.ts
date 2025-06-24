import { Injectable, Logger } from '@nestjs/common'
import { GoogleGenAI } from '@google/genai'
import { AiConfigService } from './ai-config.service'
import { AiAnalysisResult, FeedbackAnalysisRequest, AiResponseOptions } from './interfaces/ai-analysis.interface'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private ai: GoogleGenAI | null = null

  constructor(private readonly configService: AiConfigService) {
    this.initializeAi()
  }

  private initializeAi(): void {
    if (!this.configService.isEnabled) {
      this.logger.warn('Gemini API key not configured. AI features will be disabled.')
      return
    }

    try {
      this.ai = new GoogleGenAI({
        apiKey: this.configService.geminiApiKey,
      })
      this.logger.log('Gemini AI initialized successfully')
    } catch (error) {
      this.logger.error('Failed to initialize Gemini AI', error)
    }
  }

  async analyzeFeedback(request: FeedbackAnalysisRequest): Promise<AiAnalysisResult | null> {
    if (!this.ai || !this.configService.isEnabled) {
      this.logger.warn('AI service not available')
      return null
    }

    try {
      const prompt = this.buildFeedbackAnalysisPrompt(request)
      const response = await this.generateContent(prompt)

      if (!response) {
        return null
      }

      return this.parseAnalysisResponse(response)
    } catch (error) {
      this.logger.error('Error analyzing feedback with AI', error)
      return null
    }
  }

  async generateContent(prompt: string, options: AiResponseOptions = {}): Promise<string | null> {
    if (!this.ai) {
      return null
    }

    try {
      const model = this.ai.models.generateContent({
        model: options.model || this.configService.geminiModel,
        contents: prompt,
        config: {
          maxOutputTokens: options.maxTokens || this.configService.geminiMaxTokens,
          temperature: options.temperature || this.configService.geminiTemperature,
        },
      })

      const response = await model
      return response.text || null
    } catch (error) {
      this.logger.error('Error generating content with Gemini', error)
      return null
    }
  }

  private buildFeedbackAnalysisPrompt(request: FeedbackAnalysisRequest): string {
    return `
Analyze the following feedback and provide a structured analysis in JSON format.

Feedback Title: ${request.title}
Feedback Content: ${request.content}
Category: ${request.category || 'Not specified'}
Rating: ${request.rating || 'Not provided'}

Please analyze the sentiment, extract keywords, and provide insights. Respond with a JSON object containing:

{
  "sentiment": "POSITIVE|NEGATIVE|NEUTRAL|MIXED",
  "confidence": 0.85,
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "category": "suggested_category",
  "summary": "Brief summary of the feedback",
  "suggestions": ["suggestion1", "suggestion2"]
}

Focus on:
1. Sentiment analysis (positive, negative, neutral, or mixed)
2. Confidence score (0-1)
3. Key terms and concepts mentioned
4. Suggested category if different from provided
5. Brief summary
6. Actionable suggestions for improvement

Ensure the response is valid JSON only.
`
  }

  private parseAnalysisResponse(response: string): AiAnalysisResult {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        sentiment: parsed.sentiment || 'NEUTRAL',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
        category: parsed.category,
        summary: parsed.summary,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        rawResponse: response,
      }
    } catch (error) {
      this.logger.error('Error parsing AI analysis response', error)

      // Fallback analysis
      return {
        sentiment: 'NEUTRAL',
        confidence: 0.5,
        keywords: [],
        rawResponse: response,
      }
    }
  }

  async generateResponseSuggestion(feedbackContent: string): Promise<string | null> {
    if (!this.ai) {
      return null
    }

    const prompt = `
Based on the following feedback, suggest a professional and helpful response:

Feedback: ${feedbackContent}

Please provide a concise, empathetic, and actionable response that:
1. Acknowledges the feedback
2. Shows understanding of the concern
3. Provides specific next steps or solutions
4. Maintains a professional tone

Keep the response under 200 words.
`

    return this.generateContent(prompt, { temperature: 0.3 })
  }

  async categorizeFeedback(title: string, content: string): Promise<string | null> {
    if (!this.ai) {
      return null
    }

    const prompt = `
Categorize the following feedback into one of these categories:
- GENERAL
- USER_EXPERIENCE
- FUNCTIONALITY
- PERFORMANCE
- DESIGN
- CONTENT
- TECHNICAL_ISSUE
- SUGGESTION
- COMPLAINT
- COMPLIMENT

Title: ${title}
Content: ${content}

Respond with only the category name, nothing else.
`

    const response = await this.generateContent(prompt, { temperature: 0.1 })
    return response?.trim() || null
  }
}
