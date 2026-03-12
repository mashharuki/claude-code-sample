import { S3Event } from 'aws-lambda';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import sharp from 'sharp';
import { Readable } from 'stream';

const s3Client = new S3Client({});
const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_NAME = process.env.BUCKET_NAME!;

/** サムネイルサイズ */
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 200;

/**
 * Readable StreamをBufferに変換
 */
async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * S3から画像を取得し、サムネイルを生成してS3に保存する
 */
async function generateThumbnail(
  bucket: string,
  sourceKey: string,
): Promise<string> {
  // 元画像を取得
  const getResult = await s3Client.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: sourceKey,
    }),
  );

  const imageBuffer = await streamToBuffer(getResult.Body as Readable);

  // サムネイルを生成（sharpでリサイズ）
  const thumbnailBuffer = await sharp(imageBuffer)
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .jpeg({ quality: 80 })
    .toBuffer();

  // サムネイルのキーを生成: uploads/xxx → thumbnails/xxx
  const thumbnailKey = sourceKey.replace('uploads/', 'thumbnails/').replace(/\.\w+$/, '.jpg');

  // サムネイルをS3に保存
  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: thumbnailKey,
      Body: thumbnailBuffer,
      ContentType: 'image/jpeg',
    }),
  );

  console.log(`Thumbnail generated: ${thumbnailKey}`);
  return thumbnailKey;
}

/**
 * DynamoDBのアイテムにサムネイルキーを記録する
 * fileKeyからアイテムを逆引きして更新する
 */
async function updateItemThumbnail(
  fileKey: string,
  thumbnailKey: string,
): Promise<void> {
  // fileKeyでアイテムを検索（Scan は避け、設計上の制約として記録）
  // 注: 本番では fileKey → itemId のマッピング用GSIを追加することを推奨
  const result = await ddbClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      FilterExpression: 'fileKey = :fk',
      KeyConditionExpression: 'begins_with(GSI1PK, :prefix)',
      ExpressionAttributeValues: {
        ':prefix': 'USER#',
        ':fk': fileKey,
      },
    }),
  );

  if (result.Items && result.Items.length > 0) {
    const item = result.Items[0];
    await ddbClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { PK: item.PK, SK: item.SK },
        UpdateExpression: 'SET thumbnailKey = :tk, updatedAt = :now',
        ExpressionAttributeValues: {
          ':tk': thumbnailKey,
          ':now': new Date().toISOString(),
        },
      }),
    );
    console.log(`Updated item ${item.PK} with thumbnail: ${thumbnailKey}`);
  } else {
    console.log(`No item found for fileKey: ${fileKey}`);
  }
}

/**
 * S3イベントトリガーのメインハンドラー
 * uploads/ 配下に画像がアップロードされるとサムネイルを生成する
 */
export async function handler(event: S3Event): Promise<void> {
  console.log('Received S3 event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // uploads/ プレフィクスのみ処理（無限ループ防止）
    if (!key.startsWith('uploads/')) {
      console.log(`Skipping non-upload key: ${key}`);
      continue;
    }

    try {
      const thumbnailKey = await generateThumbnail(bucket, key);
      await updateItemThumbnail(key, thumbnailKey);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
      throw error; // リトライのためにエラーを再スロー
    }
  }
}
