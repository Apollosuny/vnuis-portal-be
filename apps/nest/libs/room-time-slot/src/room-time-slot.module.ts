import { Module, forwardRef } from '@nestjs/common'
import { RoomTimeSlotService } from './room-time-slot.service'
import { RoomTimeSlotController } from './room-time-slot.controller'
import { RoomBookingModule, RoomBookingService } from '@app/room-booking'

@Module({
  imports: [forwardRef(() => RoomBookingModule)],
  controllers: [RoomTimeSlotController],
  providers: [RoomTimeSlotService],
  exports: [RoomTimeSlotService],
})
export class RoomTimeSlotModule {}
