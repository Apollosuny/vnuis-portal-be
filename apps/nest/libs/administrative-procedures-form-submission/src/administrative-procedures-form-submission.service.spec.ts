import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativeProceduresFormSubmissionService } from './administrative-procedures-form-submission.service';

describe('AdministrativeProceduresFormSubmissionService', () => {
  let service: AdministrativeProceduresFormSubmissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministrativeProceduresFormSubmissionService],
    }).compile();

    service = module.get<AdministrativeProceduresFormSubmissionService>(AdministrativeProceduresFormSubmissionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
