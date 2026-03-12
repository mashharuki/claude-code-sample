import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { randomUUID } from 'crypto';

const dynamoClient = new DynamoDBClient({});
const s3Client = new S3Client({});

const TABLE_NAME = process.env.TABLE_NAME!;
const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET!;

// ユーティリティ: レスポンス生成
function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(body),
  };
}

// Cognito の sub (ユーザーID) を取得
function getUserId(event: APIGatewayProxyEvent): string {
  return event.requestContext.authorizer?.claims?.sub ?? 'anonymous';
}

// CRUD: アイテム一覧取得
async function listItems(userId: string): Promise<APIGatewayProxyResult> {
  const result = await dynamoClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: marshall({ ':pk': `USER#${userId}` }),
    }),
  );

  const items = (result.Items ?? []).map((item) => unmarshall(item));
  return response(200, { items });
}

// CRUD: アイテム取得
async function getItem(userId: string, id: string): Promise<APIGatewayProxyResult> {
  const result = await dynamoClient.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: `USER#${userId}`, SK: `ITEM#${id}` }),
    }),
  );

  if (!result.Item) {
    return response(404, { message: 'Item not found' });
  }
  return response(200, unmarshall(result.Item));
}

// CRUD: アイテム作成
async function createItem(
  userId: string,
  body: string | null,
): Promise<APIGatewayProxyResult> {
  const id = randomUUID();
  const parsed = JSON.parse(body ?? '{}');
  const now = new Date().toISOString();

  const item = {
    PK: `USER#${userId}`,
    SK: `ITEM#${id}`,
    id,
    ...parsed,
    createdAt: now,
    updatedAt: now,
  };

  await dynamoClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    }),
  );

  return response(201, item);
}

// CRUD: アイテム更新
async function updateItem(
  userId: string,
  id: string,
  body: string | null,
): Promise<APIGatewayProxyResult> {
  const parsed = JSON.parse(body ?? '{}');
  const now = new Date().toISOString();

  const item = {
    PK: `USER#${userId}`,
    SK: `ITEM#${id}`,
    id,
    ...parsed,
    updatedAt: now,
  };

  await dynamoClient.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item, { removeUndefinedValues: true }),
    }),
  );

  return response(200, item);
}

// CRUD: アイテム削除
async function deleteItem(userId: string, id: string): Promise<APIGatewayProxyResult> {
  await dynamoClient.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ PK: `USER#${userId}`, SK: `ITEM#${id}` }),
    }),
  );

  return response(200, { message: 'Deleted' });
}

// ファイルアップロード用 Presigned URL 発行
async function createUploadUrl(
  userId: string,
  body: string | null,
): Promise<APIGatewayProxyResult> {
  const parsed = JSON.parse(body ?? '{}');
  const fileName = parsed.fileName as string;
  const contentType = (parsed.contentType as string) ?? 'application/octet-stream';

  if (!fileName) {
    return response(400, { message: 'fileName is required' });
  }

  const key = `${userId}/${randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: UPLOAD_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return response(200, { uploadUrl, key });
}

// Lambda ハンドラー
export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserId(event);
    const method = event.httpMethod;
    const resource = event.resource;
    const id = event.pathParameters?.id;

    // /upload
    if (resource === '/upload' && method === 'POST') {
      return await createUploadUrl(userId, event.body);
    }

    // /items
    if (resource === '/items') {
      if (method === 'GET') return await listItems(userId);
      if (method === 'POST') return await createItem(userId, event.body);
    }

    // /items/{id}
    if (resource === '/items/{id}' && id) {
      if (method === 'GET') return await getItem(userId, id);
      if (method === 'PUT') return await updateItem(userId, id, event.body);
      if (method === 'DELETE') return await deleteItem(userId, id);
    }

    return response(404, { message: 'Not Found' });
  } catch (error) {
    console.error('Error:', error);
    return response(500, { message: 'Internal Server Error' });
  }
}
