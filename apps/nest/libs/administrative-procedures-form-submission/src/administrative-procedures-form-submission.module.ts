import { Module } from '@nestjs/common';
import { AdministrativeProceduresFormSubmissionService } from './administrative-procedures-form-submission.service';

@Module({
  providers: [AdministrativeProceduresFormSubmissionService],
  exports: [AdministrativeProceduresFormSubmissionService],
})
export class AdministrativeProceduresFormSubmissionModule {}
