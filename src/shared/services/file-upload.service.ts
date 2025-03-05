import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { nanoid } from 'nanoid';

@Injectable()
export class FileUploadService {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: configService.get('AWS_ACCESS_KEY') as string,
        secretAccessKey: configService.get('AWS_SECRET_KEY') as string,
      },
      region: configService.get('AWS_REGION'),
    });
    this.bucketName = configService.get('AWS_BUCKET') as string;
  }

  async uploadFile(file: Express.Multer.File) {
    const params = {
      Bucket: this.bucketName,
      Key: `${nanoid()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);

    return {
      key: params.Key,
      location: `https://${this.bucketName}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${params.Key}`,
    };
  }

  uploadFiles(files: Express.Multer.File[]) {
    const uploadPromises = files.map((file) => this.uploadFile(file));

    return Promise.all(uploadPromises);
  }

  async deleteFile(fileKey: string) {
    const params = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(params);
    await this.s3.send(command);
  }

  deleteFiles(fileKeys: string[]) {
    const promises = fileKeys.map((key) => this.deleteFile(key));

    return Promise.all(promises);
  }
}
