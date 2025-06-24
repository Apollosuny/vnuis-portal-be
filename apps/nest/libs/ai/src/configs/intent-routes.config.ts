import { IntentRouteConfig } from '../interfaces/chatbot-intent.interface'
import {
  generateIntentRoutesConfig,
  getRouteByIntent,
  getIntentsByKeywords,
  getRoutesByCategory,
} from './route-mapper.config'

// Re-export the dynamic route generation functions
export { generateIntentRoutesConfig, getRouteByIntent, getIntentsByKeywords, getRoutesByCategory }

// For backward compatibility, generate routes dynamically
export const INTENT_ROUTES_CONFIG: IntentRouteConfig[] = generateIntentRoutesConfig()

// Helper function to get routes by category
export const getRoutesByCategoryHelper = () => {
  return getRoutesByCategory()
}

// Helper function to get route by intent
export const getRouteByIntentHelper = (intent: string): IntentRouteConfig | undefined => {
  return getRouteByIntent(intent)
}

// Helper function to get intents by keywords
export const getIntentsByKeywordsHelper = (keywords: string[]): IntentRouteConfig[] => {
  return getIntentsByKeywords(keywords)
}
