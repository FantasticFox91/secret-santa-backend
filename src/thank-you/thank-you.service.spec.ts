import { Test, TestingModule } from '@nestjs/testing';
import { ThankYouService } from './thank-you.service';

describe('ThankYouService', () => {
  let service: ThankYouService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThankYouService],
    }).compile();

    service = module.get<ThankYouService>(ThankYouService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
