import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { RoomBookingService } from './room-booking.service'

@ApiTags('room-booking')
@Controller('room-booking')
export class RoomBookingController {
  constructor(private readonly _roomBookingService: RoomBookingService) {}
}
