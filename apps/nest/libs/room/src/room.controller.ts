import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common'
import { CacheTTL } from '@nestjs/cache-manager'
import { ApiTags, ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger'
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

  @Post()
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  createRoom(@Body() createRoomDto: CreateRoomDto, @CurUser() user: User) {
    return this._roomService.createRoom(createRoomDto, user)
  }

  @Put(':roomId')
  @ApiBearerAuth()
  @ApiOkResponse({ type: () => RoomEntity })
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
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
