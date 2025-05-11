import { Module } from '@nestjs/common'
import { AdministrativeProceduresFormService } from './administrative-procedures-form.service'
import { AdministrativeProceduresFormController } from './administrative-procedures-form.controller'

@Module({
  controllers: [AdministrativeProceduresFormController],
  providers: [AdministrativeProceduresFormService],
  exports: [AdministrativeProceduresFormService],
})
export class AdministrativeProceduresFormModule {}
