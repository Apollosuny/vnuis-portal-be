import { Module } from '@nestjs/common';
import { RoomBookingService } from './room-booking.service';

@Module({
  providers: [RoomBookingService],
  exports: [RoomBookingService],
})
export class RoomBookingModule {}
