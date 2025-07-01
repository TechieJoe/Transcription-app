import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { TranscriptService } from 'src/service/transcript/transcript.service';

@Controller('transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Get('/')
  async home(@Res() res: Response) {
    return res.render('home'); // Renders home.ejs or home.html
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/flac'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Invalid file type. Only MP3, WAV, and FLAC audio files are allowed.'
            ),
            false
          );
        }
        callback(null, true);
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    try {
      const result = await this.transcriptService.uploadAndTranscribe(file);
      return { transcript: result.transcript };
    } catch (error) {
      console.error('Transcription error:', error.message || error);
      throw new BadRequestException(
        error.message || 'Failed to process the transcription.'
      );
    }
  }
}
