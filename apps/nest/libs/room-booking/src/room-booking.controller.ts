import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger'
import { RoomBookingService } from './room-booking.service'
import { JwtGuard } from '@app/auth/guards/jwt.guard'
import { Roles } from '@app/core/decorators/role.decorator'
import { Role } from '@prisma/client'
import { CurUser } from '@app/core/decorators/user.decorator'
import { UserEntity } from '@app/user/entities/user.entity'
import { CreateRoomBookingDto } from './dtos/create-room-booking.dto'

@ApiTags('room-booking')
@Controller('room-booking')
export class RoomBookingController {
  constructor(private readonly _roomBookingService: RoomBookingService) {}

  @Post('create')
  @UseGuards(JwtGuard)
  @Roles(Role.STUDENT)
  @ApiBearerAuth()
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  create(@CurUser() user: UserEntity, dto: CreateRoomBookingDto) {
    return this._roomBookingService.create(user, dto)
  }
}
