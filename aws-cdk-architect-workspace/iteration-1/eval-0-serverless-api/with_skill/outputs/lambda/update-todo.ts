import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event.pathParameters?.id;

    if (!id) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'id is required' }),
      };
    }

    // 既存アイテムの取得
    const existing = await docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: { id },
      }),
    );

    if (!existing.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders(),
        body: JSON.stringify({ message: 'Todo not found' }),
      };
    }

    const body = JSON.parse(event.body ?? '{}');
    const now = new Date().toISOString();

    const updated = {
      ...existing.Item,
      title: body.title ?? existing.Item.title,
      description: body.description ?? existing.Item.description,
      completed: body.completed ?? existing.Item.completed,
      updatedAt: now,
    };

    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: updated,
      }),
    );

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(updated),
    };
  } catch (error) {
    console.error('Error updating todo:', error);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };
}
