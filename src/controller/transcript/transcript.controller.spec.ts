import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptController } from './transcript.controller';

describe('TranscriptController', () => {
  let controller: TranscriptController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TranscriptController],
    }).compile();

    controller = module.get<TranscriptController>(TranscriptController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
