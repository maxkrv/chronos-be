import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { nanoid } from 'nanoid';

import { ApiConfigService } from '../../config/api-config.service';

@Injectable()
export class FileUploadService {
  private readonly s3: S3Client;
  private readonly bucketName: string;

  constructor(private readonly cs: ApiConfigService) {
    const aws = cs.getAWS();
    this.s3 = new S3Client({
      region: aws.s3.region,
      credentials: {
        accessKeyId: aws.s3.keyId,
        secretAccessKey: aws.s3.secretKey,
      },
    });
    this.bucketName = cs.getAWS().s3.bucketName;
  }

  async uploadFile(file: Express.Multer.File) {
    const params = {
      Bucket: this.bucketName,
      Key: `${nanoid()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: ObjectCannedACL.public_read,
    };

    const command = new PutObjectCommand(params);
    await this.s3.send(command);

    return {
      key: params.Key,
      location: `https://${this.bucketName}.s3.${this.cs.getAWS().s3.region}.amazonaws.com/${params.Key}`,
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
