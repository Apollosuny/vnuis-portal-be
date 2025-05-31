import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { CacheTTL } from '@nestjs/cache-manager'
import { ApiTags, ApiBearerAuth, ApiOkResponse, ApiQuery } from '@nestjs/swagger'
import { RoomService } from './room.service'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { CurUser } from '@app/core/decorators/user.decorator'
import { Role, User } from '@prisma/client'
import { RoomEntity } from './entities/room.entity'
import { CreateRoomDto } from './dtos/create-room.dto'
import { UpdateRoomDto } from './dtos/update-room.dto'
import { QueryRoomDto } from './dtos/query-room.dto'
import { RawQuery } from '@app/core/decorators/query.decorator'
import { AppCacheInterceptor } from '@app/core/interceptors/app-cache-interceptor'
import { AppCacheKey } from '@app/core/decorators/app-cache-key.decorator'
import { Roles } from '@app/core/decorators/role.decorator'

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly _roomService: RoomService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity, isArray: true })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @UseInterceptors(AppCacheInterceptor)
  getRooms(@RawQuery() queryRoomDto: QueryRoomDto) {
    return this._roomService.getRooms(queryRoomDto)
  }

  @Get(':roomId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `room-${req.params.roomId}`)
  @UseInterceptors(AppCacheInterceptor)
  getRoom(@Param('roomId') roomId: string) {
    return this._roomService.getRoom(roomId)
  }

  @Get(':roomId/with-time-slots')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get room with its time slots included',
    type: RoomEntity,
  })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => `room-${req.params.roomId}-with-time-slots`)
  @UseInterceptors(AppCacheInterceptor)
  getRoomWithTimeSlots(@Param('roomId') roomId: string) {
    return this._roomService.getRoomWithTimeSlots(roomId)
  }

  @Get(':roomId/with-todays-slots')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get room with time slots for today only',
    type: RoomEntity,
  })
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => {
    const now = new Date()
    return `room-${req.params.roomId}-with-todays-slots-${now.toISOString().split('T')[0]}`
  })
  @UseInterceptors(AppCacheInterceptor)
  getRoomWithTimeSlotsForToday(@Param('roomId') roomId: string) {
    return this._roomService.getRoomWithTimeSlotsForToday(roomId)
  }

  @Get(':roomId/details')
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @CacheTTL(2000)
  @AppCacheKey((req) => {
    const includeTimeSlots = req.query.includeTimeSlots === undefined ? 'true' : req.query.includeTimeSlots
    const includeBookings = req.query.includeBookings === undefined ? 'false' : req.query.includeBookings
    return `room-${req.params.roomId}-details-ts${includeTimeSlots}-b${includeBookings}`
  })
  @UseInterceptors(AppCacheInterceptor)
  @ApiOkResponse({
    description: 'Get room details with optional timeslots and bookings included',
    type: RoomEntity,
  })
  @ApiQuery({
    name: 'includeTimeSlots',
    required: false,
    type: Boolean,
    description: 'Include time slots in the response (defaults to true)',
  })
  @ApiQuery({
    name: 'includeBookings',
    required: false,
    type: Boolean,
    description: 'Include bookings in the response (defaults to false)',
  })
  getRoomWithDetails(
    @Param('roomId') roomId: string,
    @Query('includeTimeSlots') includeTimeSlots?: string,
    @Query('includeBookings') includeBookings?: string,
  ) {
    const includeTimeSlotsBool = includeTimeSlots === undefined ? true : includeTimeSlots === 'true'
    const includeBookingsBool = includeBookings === undefined ? false : includeBookings === 'true'
    return this._roomService.getRoomWithDetails(roomId, includeTimeSlotsBool, includeBookingsBool)
  }

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  createRoom(@Body() createRoomDto: CreateRoomDto, @CurUser() user: User) {
    return this._roomService.createRoom(createRoomDto, user)
  }

  @Put(':roomId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  updateRoom(@Param('roomId') roomId: string, @Body() updateRoomDto: UpdateRoomDto, @CurUser() user: User) {
    return this._roomService.updateRoom(roomId, updateRoomDto, user)
  }

  @Delete(':roomId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  deleteRoom(@Param('roomId') roomId: string, @CurUser() user: User) {
    return this._roomService.deleteRoom(roomId, user)
  }
}
