import { Test, TestingModule } from '@nestjs/testing';
import { ThankYouController } from './thank-you.controller';

describe('ThankYouController', () => {
  let controller: ThankYouController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThankYouController],
    }).compile();

    controller = module.get<ThankYouController>(ThankYouController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
