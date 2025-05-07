import { Module } from '@nestjs/common'
import { RoomBookingService } from './room-booking.service'
import { RoomService } from '@app/room'
import { RoomTimeSlotModule } from '@app/room-time-slot'

@Module({
  imports: [RoomTimeSlotModule],
  providers: [RoomBookingService, RoomService],
  exports: [RoomBookingService],
})
export class RoomBookingModule {}
