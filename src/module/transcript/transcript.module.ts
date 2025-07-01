import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranscriptController } from 'src/controller/transcript/transcript.controller';
import { TranscriptService } from 'src/service/transcript/transcript.service';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigService available everywhere
    }),
  ],
  controllers: [TranscriptController],
  providers: [TranscriptService],
})
export class TranscriptModule {}
