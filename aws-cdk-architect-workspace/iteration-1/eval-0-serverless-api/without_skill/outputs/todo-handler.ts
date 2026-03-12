import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  const id = pathParameters?.id;

  try {
    switch (httpMethod) {
      case "GET":
        return id ? await getTodo(id) : await listTodos();
      case "POST":
        return await createTodo(body);
      case "PUT":
        return await updateTodo(id!, body);
      case "DELETE":
        return await deleteTodo(id!);
      default:
        return response(405, { message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error:", error);
    return response(500, {
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

async function listTodos(): Promise<APIGatewayProxyResult> {
  const result = await client.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );

  const items = (result.Items ?? []).map((item) => unmarshall(item));
  return response(200, items);
}

async function getTodo(id: string): Promise<APIGatewayProxyResult> {
  const result = await client.send(
    new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id }),
    })
  );

  if (!result.Item) {
    return response(404, { message: "Todo not found" });
  }

  return response(200, unmarshall(result.Item));
}

async function createTodo(
  body: string | null
): Promise<APIGatewayProxyResult> {
  if (!body) {
    return response(400, { message: "Request body is required" });
  }

  const parsed = JSON.parse(body);

  if (!parsed.title) {
    return response(400, { message: "title is required" });
  }

  const now = new Date().toISOString();
  const todo: Todo = {
    id: randomUUID(),
    title: parsed.title,
    description: parsed.description ?? "",
    completed: false,
    createdAt: now,
    updatedAt: now,
  };

  await client.send(
    new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(todo),
    })
  );

  return response(201, todo);
}

async function updateTodo(
  id: string,
  body: string | null
): Promise<APIGatewayProxyResult> {
  if (!body) {
    return response(400, { message: "Request body is required" });
  }

  const parsed = JSON.parse(body);
  const now = new Date().toISOString();

  const expressionParts: string[] = [];
  const expressionNames: Record<string, string> = {};
  const expressionValues: Record<string, any> = {};

  if (parsed.title !== undefined) {
    expressionParts.push("#title = :title");
    expressionNames["#title"] = "title";
    expressionValues[":title"] = { S: parsed.title };
  }

  if (parsed.description !== undefined) {
    expressionParts.push("#description = :description");
    expressionNames["#description"] = "description";
    expressionValues[":description"] = { S: parsed.description };
  }

  if (parsed.completed !== undefined) {
    expressionParts.push("#completed = :completed");
    expressionNames["#completed"] = "completed";
    expressionValues[":completed"] = { BOOL: parsed.completed };
  }

  expressionParts.push("#updatedAt = :updatedAt");
  expressionNames["#updatedAt"] = "updatedAt";
  expressionValues[":updatedAt"] = { S: now };

  const result = await client.send(
    new UpdateItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id }),
      UpdateExpression: "SET " + expressionParts.join(", "),
      ExpressionAttributeNames: expressionNames,
      ExpressionAttributeValues: expressionValues,
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(id)",
    })
  );

  if (!result.Attributes) {
    return response(404, { message: "Todo not found" });
  }

  return response(200, unmarshall(result.Attributes));
}

async function deleteTodo(id: string): Promise<APIGatewayProxyResult> {
  await client.send(
    new DeleteItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({ id }),
      ConditionExpression: "attribute_exists(id)",
    })
  );

  return response(200, { message: "Todo deleted successfully" });
}

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}
