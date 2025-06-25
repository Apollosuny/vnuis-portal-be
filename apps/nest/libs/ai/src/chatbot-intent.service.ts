import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaService } from 'nestjs-prisma'
import {
  ChatbotIntentRoute,
  IntentRouteConfig,
  IntentAnalysis,
  ChatbotResponse,
  QuickAction,
} from './interfaces/chatbot-intent.interface'
import { generateIntentRoutesConfig, getRouteByIntent } from './configs/route-mapper.config'
import { AiService } from './ai.service'

@Injectable()
export class ChatbotIntentService implements OnModuleInit {
  private readonly logger = new Logger(ChatbotIntentService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  /**
   * Auto-sync routes on module initialization
   */
  async onModuleInit() {
    try {
      await this.syncIntentRoutes()
    } catch (error) {
      this.logger.error('Failed to sync intent routes on startup:', error)
    }
  }

  /**
   * Sync intent routes from configuration to database
   * This ensures database is always up-to-date with the latest routes
   */
  async syncIntentRoutes(): Promise<void> {
    this.logger.log('Starting intent routes sync...')

    try {
      // Generate routes from frontend route mapping
      const INTENT_ROUTES_CONFIG = generateIntentRoutesConfig()

      // Get all existing intent routes from database
      const existingRoutes = await this.prisma.chatbotIntentRoute.findMany()
      const existingIntents = new Set(existingRoutes.map((route) => route.intent))

      let createdCount = 0
      let updatedCount = 0
      let deactivatedCount = 0

      // Process each route from configuration
      for (const configRoute of INTENT_ROUTES_CONFIG) {
        const existingRoute = existingRoutes.find((route) => route.intent === configRoute.intent)

        if (existingRoute) {
          // Check if route needs updating
          const needsUpdate = this.routeNeedsUpdate(existingRoute, configRoute)
          if (needsUpdate) {
            await this.updateIntentRoute(existingRoute.id, configRoute)
            updatedCount++
          }
        } else {
          // Create new route
          await this.createIntentRoute(configRoute)
          createdCount++
        }
      }

      // Deactivate routes that are no longer in configuration
      const configIntents = new Set(INTENT_ROUTES_CONFIG.map((route) => route.intent))
      const routesToDeactivate = existingRoutes.filter((route) => !configIntents.has(route.intent))

      for (const route of routesToDeactivate) {
        await this.prisma.chatbotIntentRoute.update({
          where: { id: route.id },
          data: { isActive: false },
        })
        deactivatedCount++
      }

      this.logger.log(
        `Intent routes sync completed: ${createdCount} created, ${updatedCount} updated, ${deactivatedCount} deactivated`,
      )
    } catch (error) {
      this.logger.error('Error syncing intent routes:', error)
      throw error
    }
  }

  /**
   * Check if an existing route needs updating based on configuration
   */
  private routeNeedsUpdate(existingRoute: any, configRoute: IntentRouteConfig): boolean {
    return (
      existingRoute.routePath !== configRoute.routePath ||
      existingRoute.routeName !== configRoute.routeName ||
      existingRoute.description !== configRoute.description ||
      existingRoute.priority !== configRoute.priority ||
      existingRoute.responseTemplate !== configRoute.responseTemplate ||
      JSON.stringify(existingRoute.keywords) !== JSON.stringify(configRoute.keywords) ||
      JSON.stringify(existingRoute.quickActions) !== JSON.stringify(configRoute.quickActions)
    )
  }

  /**
   * Create a new intent route
   */
  async createIntentRoute(config: IntentRouteConfig): Promise<ChatbotIntentRoute> {
    const route = await this.prisma.chatbotIntentRoute.create({
      data: {
        intent: config.intent,
        routePath: config.routePath,
        routeName: config.routeName,
        description: config.description,
        keywords: config.keywords,
        priority: config.priority,
        isActive: true,
        responseTemplate: config.responseTemplate,
        quickActions: config.quickActions as any,
      },
    })

    this.logger.log(`Created intent route: ${config.intent}`)
    return this.transformPrismaResult(route)
  }

  /**
   * Update an existing intent route
   */
  async updateIntentRoute(id: string, config: IntentRouteConfig): Promise<ChatbotIntentRoute> {
    const route = await this.prisma.chatbotIntentRoute.update({
      where: { id },
      data: {
        routePath: config.routePath,
        routeName: config.routeName,
        description: config.description,
        keywords: config.keywords,
        priority: config.priority,
        responseTemplate: config.responseTemplate,
        quickActions: config.quickActions as any,
        isActive: true, // Reactivate if it was deactivated
      },
    })

    this.logger.log(`Updated intent route: ${config.intent}`)
    return this.transformPrismaResult(route)
  }

  /**
   * Get all active intent routes
   */
  async getActiveIntentRoutes(): Promise<ChatbotIntentRoute[]> {
    const routes = await this.prisma.chatbotIntentRoute.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    })

    return routes.map((route) => this.transformPrismaResult(route))
  }

  /**
   * Get intent route by intent name
   */
  async getIntentRouteByIntent(intent: string): Promise<ChatbotIntentRoute | null> {
    const route = await this.prisma.chatbotIntentRoute.findFirst({
      where: { intent, isActive: true },
    })

    return route ? this.transformPrismaResult(route) : null
  }

  /**
   * Transform Prisma result to ChatbotIntentRoute interface
   */
  private transformPrismaResult(prismaResult: any): ChatbotIntentRoute {
    return {
      id: prismaResult.id,
      intent: prismaResult.intent,
      routePath: prismaResult.routePath,
      routeName: prismaResult.routeName,
      description: prismaResult.description,
      keywords: prismaResult.keywords,
      priority: prismaResult.priority,
      isActive: prismaResult.isActive,
      responseTemplate: prismaResult.responseTemplate,
      quickActions: prismaResult.quickActions,
    }
  }

  /**
   * Find relevant routes based on keywords
   */
  async findRelevantRoutes(keywords: string[]): Promise<ChatbotIntentRoute[]> {
    const allRoutes = await this.getActiveIntentRoutes()

    return allRoutes
      .filter((route) =>
        keywords.some((keyword) => route.keywords.some((k) => k.toLowerCase().includes(keyword.toLowerCase()))),
      )
      .sort((a, b) => b.priority - a.priority)
  }

  /**
   * Process student message and generate response
   */
  async processMessage(message: string): Promise<ChatbotResponse> {
    // 1. Analyze intent using AI
    const intentAnalysis = await this.analyzeIntent(message)

    // 2. Check if this is a general conversation (low confidence or no clear intent)
    if (intentAnalysis.confidence < 0.6 || intentAnalysis.intent === 'help') {
      // Generate a natural conversation response using AI
      const conversationResponse = await this.generateConversationResponse(message)

      return {
        message: conversationResponse,
        suggestedLinks: [], // No forced redirects for general conversation
        quickActions: this.getConversationQuickActions(), // Add helpful quick actions
        confidence: intentAnalysis.confidence,
        intent: 'conversation',
      }
    }

    // 3. Get the best matching route for service-related intents
    const route = await this.getIntentRouteByIntent(intentAnalysis.intent)

    if (!route) {
      // Fallback to help intent
      const helpRoute = await this.getIntentRouteByIntent('help')
      return {
        message:
          helpRoute?.responseTemplate ||
          'Tôi có thể giúp bạn với các vấn đề về đặt phòng, sự kiện, đơn hành chính. Bạn cần gì?',
        suggestedLinks: helpRoute
          ? [
              {
                name: helpRoute.routeName,
                route: helpRoute.routePath,
                description: helpRoute.description,
              },
            ]
          : [],
        quickActions: helpRoute?.quickActions as any,
        confidence: 0.5,
        intent: 'help',
      }
    }

    // 4. Generate response for service-related intents
    return {
      message: route.responseTemplate || `Tôi sẽ đưa bạn đến ${route.routeName}.`,
      suggestedLinks: [
        {
          name: route.routeName,
          route: route.routePath,
          description: route.description,
        },
      ],
      quickActions: route.quickActions as any,
      confidence: intentAnalysis.confidence,
      intent: route.intent,
    }
  }

  /**
   * Check if message is a simple greeting or casual conversation
   */
  private isSimpleGreeting(message: string): boolean {
    const greetings = [
      'hello',
      'hi',
      'hey',
      'chào',
      'xin chào',
      'chào bạn',
      'chào em',
      'chào anh',
      'chào chị',
      'good morning',
      'good afternoon',
      'good evening',
      'chào buổi sáng',
      'chào buổi chiều',
      'chào buổi tối',
      'how are you',
      'bạn khỏe không',
      'em khỏe không',
      'anh khỏe không',
      'chị khỏe không',
      "what's up",
      'có gì mới',
      'thế nào',
      'sao rồi',
    ]

    const normalizedMessage = message.toLowerCase().trim()
    return greetings.some((greeting) => normalizedMessage.includes(greeting))
  }

  /**
   * Generate natural conversation response for general chat
   */
  private async generateConversationResponse(message: string): Promise<string> {
    // Handle simple greetings with quick responses
    if (this.isSimpleGreeting(message)) {
      const greetings = [
        'Xin chào! Rất vui được gặp bạn! 😊',
        'Chào bạn! Tôi có thể giúp gì cho bạn hôm nay?',
        'Xin chào! Bạn cần hỗ trợ gì không?',
        'Chào bạn! Tôi sẵn sàng hỗ trợ bạn với các dịch vụ của trường.',
        'Xin chào! Bạn có muốn tìm hiểu về các dịch vụ nào không?',
      ]
      return greetings[Math.floor(Math.random() * greetings.length)]
    }

    const prompt = `
    You are a friendly student assistant chatbot. A student has sent you a message that doesn't seem to be about specific services (like room booking, events, forms, etc.).
    
    Student message: "${message}"
    
    Please respond naturally and conversationally in Vietnamese. You can:
    - Greet them back if they're greeting you
    - Ask how you can help them
    - Have a casual conversation
    - Be friendly and supportive
    - If they ask about what you can do, mention that you can help with room booking, events, forms, and other student services
    
    Keep your response under 100 words and make it feel natural, not like a customer service bot.
    
    If they seem to need help with something specific, you can gently ask what they need help with.
    `

    try {
      const aiResponse = await this.aiService.generateContent(prompt, { temperature: 0.7 })
      if (!aiResponse) {
        return 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?'
      }

      return aiResponse.trim()
    } catch (error) {
      this.logger.error('Error generating conversation response:', error)
      return 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?'
    }
  }

  /**
   * Get quick actions for general conversation
   */
  private getConversationQuickActions(): QuickAction[] {
    return [
      {
        label: 'Đặt phòng',
        action: 'navigate',
        route: '/student-dashboard/rooms',
      },
      {
        label: 'Xem sự kiện',
        action: 'navigate',
        route: '/student-dashboard/events',
      },
      {
        label: 'Nộp đơn',
        action: 'navigate',
        route: '/student-dashboard/forms',
      },
    ]
  }

  /**
   * Analyze message intent using AI
   */
  private async analyzeIntent(message: string): Promise<IntentAnalysis> {
    const activeRoutes = await this.getActiveIntentRoutes()
    const routeOptions = activeRoutes.map((route) => route.intent).join(', ')

    const prompt = `
    Analyze the following student message and identify the most appropriate intent.
    
    Message: "${message}"
    
    Available intents: ${routeOptions}
    
    Consider the keywords and context. Respond with JSON format:
    {
      "intent": "intent_name",
      "confidence": 0.95,
      "entities": {
        "action": "book|view|cancel|register|submit",
        "resource": "room|booking|event|form|feedback"
      }
    }
    
    IMPORTANT GUIDELINES:
    - Only match to specific intents if the message clearly relates to services (room booking, events, forms, etc.)
    - If the message is just general conversation (greetings, casual chat, questions not about services), use "help" with low confidence (< 0.6)
    - Examples of general conversation: "hello", "hi", "how are you", "what's up", "thanks", etc.
    - Examples of service-related: "book a room", "view events", "submit form", "cancel booking", etc.
    
    If no clear service-related intent is found, use "help" as the intent with confidence < 0.6.
    `

    try {
      const aiResponse = await this.aiService.generateContent(prompt)
      if (!aiResponse) {
        return { intent: 'help', confidence: 0.3 }
      }

      return this.parseIntentResponse(aiResponse)
    } catch (error) {
      this.logger.error('Error analyzing intent:', error)
      return { intent: 'help', confidence: 0.3 }
    }
  }

  /**
   * Parse AI response to extract intent analysis
   */
  private parseIntentResponse(response: string): IntentAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])

      return {
        intent: parsed.intent || 'help',
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        entities: parsed.entities || {},
      }
    } catch (error) {
      this.logger.error('Error parsing intent response:', error)
      return { intent: 'help', confidence: 0.3 }
    }
  }

  /**
   * Get routes by category for admin management
   */
  async getRoutesByCategory(): Promise<Record<string, ChatbotIntentRoute[]>> {
    const routes = await this.getActiveIntentRoutes()

    const categories = {
      booking: ['book_room', 'view_bookings', 'cancel_booking'],
      events: ['view_events', 'register_event'],
      forms: ['submit_form', 'view_forms'],
      feedback: ['submit_feedback'],
      notifications: ['view_notifications'],
      settings: ['settings'],
      general: ['dashboard', 'help'],
    }

    const result: Record<string, ChatbotIntentRoute[]> = {}

    for (const [category, intents] of Object.entries(categories)) {
      result[category] = routes.filter((route) => intents.includes(route.intent))
    }

    return result
  }

  /**
   * Update route priority (for admin management)
   */
  async updateRoutePriority(intent: string, priority: number): Promise<ChatbotIntentRoute> {
    const route = await this.prisma.chatbotIntentRoute.update({
      where: { intent },
      data: { priority },
    })

    return this.transformPrismaResult(route)
  }

  /**
   * Toggle route active status (for admin management)
   */
  async toggleRouteStatus(intent: string): Promise<ChatbotIntentRoute> {
    const route = await this.getIntentRouteByIntent(intent)
    if (!route) {
      throw new Error(`Intent route not found: ${intent}`)
    }

    const updatedRoute = await this.prisma.chatbotIntentRoute.update({
      where: { id: route.id },
      data: { isActive: !route.isActive },
    })

    return this.transformPrismaResult(updatedRoute)
  }
}
