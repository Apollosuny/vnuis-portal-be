import { Module } from '@nestjs/common'
import { RoomBookingService } from './room-booking.service'
import { RoomService } from '@app/room'
import { RoomTimeSlotModule } from '@app/room-time-slot'
import { RoomBookingController } from './room-booking.controller'

@Module({
  imports: [RoomTimeSlotModule],
  controllers: [RoomBookingController],
  providers: [RoomBookingService, RoomService],
  exports: [RoomBookingService],
})
export class RoomBookingModule {}
