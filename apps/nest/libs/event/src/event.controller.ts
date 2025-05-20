import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { CacheTTL } from '@nestjs/cache-manager'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'
import { CurUser } from '@app/core/decorators/user.decorator'
import { Role, User } from '@prisma/client'
import { RawQuery } from '@app/core/decorators/query.decorator'
import { EventService } from './event.service'
import { CreateEventDto } from './dtos/create-event.dto'
import { UpdateEventDto } from './dtos/update-event.dto'
import { QueryEventDto } from './dtos/query-event.dto'
import { EventEntity } from './entities/event.entity'
import { RegisterEventDto } from './dtos/register-event.dto'
import { EventRegistrationEntity } from './entities/event-registration.entity'
import { QueryEventRegistrationDto } from './dtos/query-event-registration.dto'
import { UpdateRegistrationStatusDto } from './dtos/update-registration-status.dto'
import { Roles } from '@app/core/decorators/role.decorator'
import { UserEntity } from '@app/user/entities/user.entity'

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  @ApiOkResponse({ type: () => EventEntity, isArray: true })
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getEvents(@RawQuery() queryEventDto: QueryEventDto) {
    return this.eventService.getEvents(queryEventDto)
  }

  @Get(':id')
  @ApiOkResponse({ type: () => EventEntity })
  @CacheTTL(2000)
  @AppCacheKey((req) => `event-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  getEvent(@Param('id') id: string) {
    return this.eventService.getEvent(id)
  }

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  createEvent(@Body() createEventDto: CreateEventDto, @CurUser() user: UserEntity) {
    return this.eventService.createEvent(createEventDto, user)
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  updateEvent(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @CurUser() user: User) {
    return this.eventService.updateEvent(id, updateEventDto, user)
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  deleteEvent(@Param('id') id: string, @CurUser() user: User) {
    return this.eventService.deleteEvent(id, user)
  }

  @Put(':id/publish')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  publishEvent(@Param('id') id: string, @CurUser() user: User) {
    return this.eventService.publishEvent(id, user)
  }

  @Put(':id/unpublish')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  unpublishEvent(@Param('id') id: string, @CurUser() user: User) {
    return this.eventService.unpublishEvent(id, user)
  }

  @Get('registrations')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventRegistrationEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getEventRegistrations(@RawQuery() queryEventRegistrationDto: QueryEventRegistrationDto) {
    return this.eventService.getEventRegistrations(queryEventRegistrationDto)
  }

  @Get('registrations/:id')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventRegistrationEntity })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `event-registration-${req.params.id}`)
  @UseInterceptors(AppCacheInterceptor)
  getEventRegistration(@Param('id') id: string) {
    return this.eventService.getEventRegistration(id)
  }

  @Post('register')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventRegistrationEntity })
  @UseGuards(JwtGuard)
  registerEvent(@Body() registerEventDto: RegisterEventDto, @CurUser() user: User) {
    return this.eventService.registerEvent(registerEventDto, user)
  }

  @Put('registrations/:id/status')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventRegistrationEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  updateRegistrationStatus(
    @Param('id') id: string,
    @Body() updateRegistrationStatusDto: UpdateRegistrationStatusDto,
    @CurUser() user: User,
  ) {
    return this.eventService.updateRegistrationStatus(id, updateRegistrationStatusDto, user)
  }

  @Put('registrations/:id/cancel')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => EventRegistrationEntity })
  @UseGuards(JwtGuard)
  cancelRegistration(@Param('id') id: string, @CurUser() user: User) {
    return this.eventService.cancelRegistration(id, user)
  }
}
