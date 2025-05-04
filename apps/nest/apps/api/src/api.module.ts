import { Module } from '@nestjs/common'

import { CoreModule } from '@app/core/core.module'
import { AuthModule } from '@app/auth'
import { OperatorModule } from '@app/operator'
import { StudentModule } from '@app/student'
import { RoomModule } from '@app/room'
import { RoomBookingModule } from '@app/room-booking'
import { RoomTimeSlotModule } from '@app/room-time-slot'
import { RecurringPatternModule } from '@app/recurring-pattern'

@Module({
  imports: [
    CoreModule,
    AuthModule,
    OperatorModule,
    StudentModule,
    RoomModule,
    RoomBookingModule,
    RoomTimeSlotModule,
    RecurringPatternModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
