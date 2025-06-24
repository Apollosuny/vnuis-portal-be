export interface ChatbotIntentRoute {
  id?: string
  intent: string
  routePath: string
  routeName: string
  description?: string
  keywords: string[]
  priority: number
  isActive: boolean
  responseTemplate?: string
  quickActions?: QuickAction[] | any
  createdAt?: Date
  updatedAt?: Date
}

export interface QuickAction {
  label: string
  action: 'navigate' | 'copy' | 'external'
  route?: string
  url?: string
  data?: any
}

export interface IntentRouteConfig {
  intent: string
  routePath: string
  routeName: string
  description?: string
  keywords: string[]
  priority: number
  responseTemplate?: string
  quickActions?: QuickAction[]
}

export interface ChatbotResponse {
  message: string
  suggestedLinks: SuggestedLink[]
  quickActions?: QuickAction[]
  confidence: number
  intent: string
}

export interface SuggestedLink {
  name: string
  route: string
  description?: string
}

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities?: Record<string, any>
}
