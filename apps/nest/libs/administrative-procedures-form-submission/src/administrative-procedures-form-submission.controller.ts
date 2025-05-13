import { Controller } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AdministrativeProceduresFormSubmissionService } from './administrative-procedures-form-submission.service'

@ApiTags('official-forms-submissions')
@Controller('official-forms-submissions')
export class AdministrativeProceduresFormSubmissionController {
  constructor(
    private readonly _administrativeProceduresFormSubmissionService: AdministrativeProceduresFormSubmissionService,
  ) {}
}
