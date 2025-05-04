import { Module } from '@nestjs/common';
import { RoomTimeSlotService } from './room-time-slot.service';

@Module({
  providers: [RoomTimeSlotService],
  exports: [RoomTimeSlotService],
})
export class RoomTimeSlotModule {}
