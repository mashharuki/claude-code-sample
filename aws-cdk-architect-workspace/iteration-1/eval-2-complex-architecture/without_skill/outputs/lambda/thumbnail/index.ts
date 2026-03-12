import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Readable } from 'stream';

const s3Client = new S3Client({});
const THUMBNAIL_BUCKET = process.env.THUMBNAIL_BUCKET!;
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 200;

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export async function handler(event: S3Event): Promise<void> {
  for (const record of event.Records) {
    const sourceBucket = record.s3.bucket.name;
    const sourceKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    console.log(`Processing: s3://${sourceBucket}/${sourceKey}`);

    try {
      // S3 から元画像を取得
      const getResult = await s3Client.send(
        new GetObjectCommand({
          Bucket: sourceBucket,
          Key: sourceKey,
        }),
      );

      if (!getResult.Body) {
        console.error(`Empty body for key: ${sourceKey}`);
        continue;
      }

      const imageBuffer = await streamToBuffer(getResult.Body as Readable);

      // sharp でサムネイルを生成
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: 'cover',
          position: 'centre',
        })
        .jpeg({ quality: 80 })
        .toBuffer();

      // サムネイル用のキーを生成 (拡張子を .jpg に統一)
      const thumbnailKey = sourceKey.replace(/\.[^.]+$/, '_thumb.jpg');

      // サムネイルを S3 に保存
      await s3Client.send(
        new PutObjectCommand({
          Bucket: THUMBNAIL_BUCKET,
          Key: thumbnailKey,
          Body: thumbnailBuffer,
          ContentType: 'image/jpeg',
        }),
      );

      console.log(`Thumbnail saved: s3://${THUMBNAIL_BUCKET}/${thumbnailKey}`);
    } catch (error) {
      console.error(`Error processing ${sourceKey}:`, error);
      throw error;
    }
  }
}
