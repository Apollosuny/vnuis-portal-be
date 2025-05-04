import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { RoomTimeSlotService } from './room-time-slot.service'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { Roles } from '@app/core/decorators/role.decorator'
import { Role } from '@prisma/client'
import { CreateTimeSlotDto, CreateTimeSlotResponseDto } from './dtos/create-time-slot.dto'

@ApiTags('room-time-slot')
@Controller('room-time-slot')
export class RoomTimSlotController {
  constructor(private readonly _roomTimeSlotService: RoomTimeSlotService) {}

  @Post('create')
  @UseGuards(JwtGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: CreateTimeSlotResponseDto })
  createTimeSlot(@Body() dto: CreateTimeSlotDto) {
    return this._roomTimeSlotService.create(dto)
  }
}
