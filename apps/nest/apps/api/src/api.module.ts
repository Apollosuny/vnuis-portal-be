import { Module } from '@nestjs/common'

import { CoreModule } from '@app/core/core.module'
import { AuthModule } from '@app/auth'
import { OperatorModule } from '@app/operator'
import { StudentModule } from '@app/student'
import { RoomModule } from '@app/room'
import { RoomBookingModule } from '@app/room-booking'
import { RoomTimeSlotModule } from '@app/room-time-slot'
import { RecurringPatternModule } from '@app/recurring-pattern'
import { AdministrativeProceduresFormModule } from '@app/administrative-procedures-form'
import { AdministrativeProceduresFormSubmissionModule } from '@app/administrative-procedures-form-submission'
import { EventModule } from '@app/event'
import { FileModule } from '@app/file'

@Module({
  imports: [
    CoreModule,
    AuthModule,
    OperatorModule,
    StudentModule,
    FileModule,
    RoomModule,
    RoomBookingModule,
    RoomTimeSlotModule,
    RecurringPatternModule,
    AdministrativeProceduresFormModule,
    AdministrativeProceduresFormSubmissionModule,
    EventModule,
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
