import { Module } from '@nestjs/common';
import { TranscriptModule } from './module/transcript/transcript.module';

@Module({
  imports: [TranscriptModule],
})
export class AppModule {}
