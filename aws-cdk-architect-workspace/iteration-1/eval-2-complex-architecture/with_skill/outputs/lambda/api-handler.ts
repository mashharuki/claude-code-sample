import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const ddbClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3Client = new S3Client({});

const TABLE_NAME = process.env.TABLE_NAME!;
const BUCKET_NAME = process.env.BUCKET_NAME!;

/**
 * CORS対応レスポンスヘルパー
 */
function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
    body: JSON.stringify(body),
  };
}

/**
 * Cognitoの認証情報からユーザーIDを取得
 */
function getUserId(event: APIGatewayProxyEvent): string {
  return event.requestContext.authorizer?.claims?.sub ?? 'anonymous';
}

/**
 * アイテム一覧取得（ユーザーごと）
 */
async function listItems(userId: string): Promise<APIGatewayProxyResult> {
  const result = await ddbClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
      },
    }),
  );
  return response(200, { items: result.Items ?? [] });
}

/**
 * アイテム取得
 */
async function getItem(itemId: string): Promise<APIGatewayProxyResult> {
  const result = await ddbClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ITEM#${itemId}`, SK: 'METADATA' },
    }),
  );

  if (!result.Item) {
    return response(404, { message: 'Item not found' });
  }
  return response(200, result.Item);
}

/**
 * アイテム作成
 */
async function createItem(
  userId: string,
  body: string | null,
): Promise<APIGatewayProxyResult> {
  const parsed = JSON.parse(body ?? '{}');
  const itemId = uuidv4();
  const now = new Date().toISOString();

  const item = {
    PK: `ITEM#${itemId}`,
    SK: 'METADATA',
    GSI1PK: `USER#${userId}`,
    GSI1SK: `ITEM#${now}`,
    id: itemId,
    userId,
    title: parsed.title ?? '',
    description: parsed.description ?? '',
    fileKey: parsed.fileKey ?? null,
    thumbnailKey: null,
    createdAt: now,
    updatedAt: now,
  };

  await ddbClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    }),
  );

  return response(201, item);
}

/**
 * アイテム更新
 */
async function updateItem(
  itemId: string,
  body: string | null,
): Promise<APIGatewayProxyResult> {
  const parsed = JSON.parse(body ?? '{}');
  const now = new Date().toISOString();

  // まず既存アイテムを取得
  const existing = await ddbClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ITEM#${itemId}`, SK: 'METADATA' },
    }),
  );

  if (!existing.Item) {
    return response(404, { message: 'Item not found' });
  }

  const updated = {
    ...existing.Item,
    title: parsed.title ?? existing.Item.title,
    description: parsed.description ?? existing.Item.description,
    fileKey: parsed.fileKey ?? existing.Item.fileKey,
    updatedAt: now,
  };

  await ddbClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: updated,
    }),
  );

  return response(200, updated);
}

/**
 * アイテム削除
 */
async function deleteItem(itemId: string): Promise<APIGatewayProxyResult> {
  await ddbClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { PK: `ITEM#${itemId}`, SK: 'METADATA' },
    }),
  );
  return response(200, { message: 'Item deleted' });
}

/**
 * S3 Presigned URL 発行（ファイルアップロード用）
 */
async function generateUploadUrl(
  userId: string,
  body: string | null,
): Promise<APIGatewayProxyResult> {
  const parsed = JSON.parse(body ?? '{}');
  const fileName = parsed.fileName ?? `${uuidv4()}.jpg`;
  const contentType = parsed.contentType ?? 'image/jpeg';
  const key = `uploads/${userId}/${uuidv4()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, {
    expiresIn: 3600, // 1時間有効
  });

  return response(200, {
    uploadUrl,
    key,
    expiresIn: 3600,
  });
}

/**
 * メインハンドラー: パスとHTTPメソッドでルーティング
 */
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const method = event.httpMethod;
    const path = event.resource;
    const itemId = event.pathParameters?.id;

    // ルーティング
    if (path === '/items' && method === 'GET') {
      return await listItems(userId);
    }
    if (path === '/items' && method === 'POST') {
      return await createItem(userId, event.body);
    }
    if (path === '/items/{id}' && method === 'GET' && itemId) {
      return await getItem(itemId);
    }
    if (path === '/items/{id}' && method === 'PUT' && itemId) {
      return await updateItem(itemId, event.body);
    }
    if (path === '/items/{id}' && method === 'DELETE' && itemId) {
      return await deleteItem(itemId);
    }
    if (path === '/upload' && method === 'POST') {
      return await generateUploadUrl(userId, event.body);
    }

    return response(404, { message: 'Not found' });
  } catch (error) {
    console.error('Error:', error);
    return response(500, {
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
