import { Module } from '@nestjs/common'
import { AdministrativeProceduresFormSubmissionService } from './administrative-procedures-form-submission.service'
import { AdministrativeProceduresFormSubmissionController } from './administrative-procedures-form-submission.controller'

@Module({
  controllers: [AdministrativeProceduresFormSubmissionController],
  providers: [AdministrativeProceduresFormSubmissionService],
  exports: [AdministrativeProceduresFormSubmissionService],
})
export class AdministrativeProceduresFormSubmissionModule {}
