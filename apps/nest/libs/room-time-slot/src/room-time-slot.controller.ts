import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger'
import { RoomTimeSlotService } from './room-time-slot.service'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { Roles } from '@app/core/decorators/role.decorator'
import { Role } from '@prisma/client'
import { CreateTimeSlotDto, CreateTimeSlotResponseDto } from './dtos/create-time-slot.dto'

@ApiTags('room-time-slot')
@Controller('room-time-slot')
export class RoomTimeSlotController {
  constructor(private readonly _roomTimeSlotService: RoomTimeSlotService) {}

  @Get(':roomId')
  @ApiOkResponse({ type: CreateTimeSlotResponseDto, isArray: true })
  getAvailableTimeByDate(
    @Query('date') date: string,
    @Param('roomId') roomId: string,
    @Query('offset') offset: string,
  ) {
    return this._roomTimeSlotService.getAvailableTimeByDate(roomId, date, offset)
  }

  @Post('create')
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN, Role.SUPERADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateTimeSlotResponseDto })
  createTimeSlot(@Body() dto: CreateTimeSlotDto) {
    return this._roomTimeSlotService.create(dto)
  }
}
