import { S3Client } from '@aws-sdk/client-s3';

export const bucketName = process.env.S3_BUCKET;
export const bucket = new S3Client({ region: process.env.AWS_REGION });
