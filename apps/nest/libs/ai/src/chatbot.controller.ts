import { Controller, Post, Get, Body, UseGuards, Param, Put, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { ChatbotIntentService } from './chatbot-intent.service'
import { ChatbotResponse, ChatbotIntentRoute } from './interfaces/chatbot-intent.interface'

// DTOs for API documentation
class ProcessMessageDto {
  message: string
}

class UpdatePriorityDto {
  priority: number
}

@ApiTags('Chatbot')
@Controller('chatbot')
@UseGuards(JwtGuard)
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotIntentService) {}

  @Post('process-message')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Process student message and get chatbot response' })
  @ApiBody({ type: ProcessMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Chatbot response with suggested links',
    type: Object,
  })
  @HttpCode(HttpStatus.OK)
  async processMessage(@Body() body: ProcessMessageDto): Promise<ChatbotResponse> {
    return this.chatbotService.processMessage(body.message)
  }

  @Post('sync-routes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync intent routes from configuration to database' })
  @ApiResponse({ status: 200, description: 'Routes synced successfully' })
  async syncRoutes(): Promise<{ message: string }> {
    await this.chatbotService.syncIntentRoutes()
    return { message: 'Intent routes synced successfully' }
  }

  @Get('routes')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active intent routes' })
  @ApiResponse({
    status: 200,
    description: 'List of active intent routes',
    type: [Object],
  })
  async getRoutes(): Promise<ChatbotIntentRoute[]> {
    return this.chatbotService.getActiveIntentRoutes()
  }

  @Get('routes/by-category')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get intent routes grouped by category' })
  @ApiResponse({
    status: 200,
    description: 'Intent routes grouped by category',
    type: Object,
  })
  async getRoutesByCategory(): Promise<Record<string, ChatbotIntentRoute[]>> {
    return this.chatbotService.getRoutesByCategory()
  }

  @Get('routes/:intent')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific intent route' })
  @ApiResponse({
    status: 200,
    description: 'Intent route details',
    type: Object,
  })
  async getRouteByIntent(@Param('intent') intent: string): Promise<ChatbotIntentRoute | null> {
    return this.chatbotService.getIntentRouteByIntent(intent)
  }

  @Put('routes/:intent/priority')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update intent route priority' })
  @ApiBody({ type: UpdatePriorityDto })
  @ApiResponse({
    status: 200,
    description: 'Priority updated successfully',
    type: Object,
  })
  async updatePriority(@Param('intent') intent: string, @Body() body: UpdatePriorityDto): Promise<ChatbotIntentRoute> {
    return this.chatbotService.updateRoutePriority(intent, body.priority)
  }

  @Put('routes/:intent/toggle')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle intent route active status' })
  @ApiResponse({
    status: 200,
    description: 'Status toggled successfully',
    type: Object,
  })
  async toggleStatus(@Param('intent') intent: string): Promise<ChatbotIntentRoute> {
    return this.chatbotService.toggleRouteStatus(intent)
  }
}
