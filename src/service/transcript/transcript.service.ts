import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class TranscriptService {
  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  // Upload file to Cloudinary and return the secure URL
  private async uploadToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'video' }, // 'video' allows audio files like .mp3
        (error, result) => {
          if (error) return reject(error);
          resolve(result.secure_url);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async uploadAndTranscribe(file: Express.Multer.File) {
    try {
      if (!file) {
        throw new Error('No file provided');
      }

      console.log('Received file:', file.originalname);

      // 1. Upload to Cloudinary
      const audioUrl = await this.uploadToCloudinary(file);
      console.log('Uploaded to Cloudinary:', audioUrl);

      // 2. Send URL to AssemblyAI
      const response = await axios.post(
        'https://api.assemblyai.com/v2/transcript',
        { audio_url: audioUrl },
        {
          headers: {
            authorization: this.configService.get<string>('ASSEMBLYAI_API_KEY'),
            'content-type': 'application/json',
          },
        }
      );

      // 3. Poll until the transcription is complete
      const transcriptId = response.data.id;
      const pollingUrl = `https://api.assemblyai.com/v2/transcript/${transcriptId}`;

      let transcript;
      while (true) {
        const pollingResponse = await axios.get(pollingUrl, {
          headers: {
            authorization: this.configService.get<string>('ASSEMBLYAI_API_KEY'),
          },
        });

        if (pollingResponse.data.status === 'completed') {
          transcript = pollingResponse.data.text;
          break;
        } else if (pollingResponse.data.status === 'error') {
          throw new Error(`Transcription error: ${pollingResponse.data.error}`);
        }

        // Wait a bit before polling again
        await new Promise(res => setTimeout(res, 2000));
      }

      return { transcript };
    } catch (error) {
      console.error('Transcription Error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe the audio');
    }
  }
}
