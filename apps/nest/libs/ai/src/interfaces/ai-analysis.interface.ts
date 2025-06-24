export interface AiAnalysisResult {
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED'
  confidence: number // 0-1
  keywords: string[]
  category?: string
  summary?: string
  suggestions?: string[]
  rawResponse?: any
}

export interface FeedbackAnalysisRequest {
  title: string
  content: string
  category?: string
  rating?: number
}

export interface AiResponseOptions {
  maxTokens?: number
  temperature?: number
  model?: string
}
