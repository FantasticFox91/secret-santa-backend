import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class s3StorageService {
  private minioClient: Minio.Client;
  private bucketName: string;
  private imagesHost: string;

  constructor(private readonly configService: ConfigService) {
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get('MINIO_ENDPOINT'),
      port: Number(this.configService.get('MINIO_PORT')),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
    this.bucketName = this.configService.get('MINIO_BUCKET');
    this.imagesHost = `${this.configService.get('MINIO_ENDPOINT2')}:${this.configService.get('MINIO_PORT2')}`;
  }

  async createBucketIfNotExists() {
    const bucketExists = await this.minioClient.bucketExists(this.bucketName);
    if (!bucketExists) {
      await this.minioClient.makeBucket(this.bucketName, 'eu-west-1');
    }
  }

  async uploadFile(file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    try {
      await this.createBucketIfNotExists();
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
      );
      const url = await this.getFileUrl(fileName);
      return url;
    } catch (e) {
      console.log(e);
    }
  }

  async getFileUrl(fileName: string) {
    return `http://${this.imagesHost}/api/v1/buckets/${this.bucketName}/objects/download?preview=true&prefix=${fileName}&version_id=null`;
  }

  async deleteFile(fileName: string) {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }
}
