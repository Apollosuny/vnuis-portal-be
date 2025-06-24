import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackResponseService } from './feedback-response.service';

describe('FeedbackResponseService', () => {
  let service: FeedbackResponseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackResponseService],
    }).compile();

    service = module.get<FeedbackResponseService>(FeedbackResponseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
