import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackAnalyticsService } from './feedback-analytics.service';

describe('FeedbackAnalyticsService', () => {
  let service: FeedbackAnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FeedbackAnalyticsService],
    }).compile();

    service = module.get<FeedbackAnalyticsService>(FeedbackAnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
