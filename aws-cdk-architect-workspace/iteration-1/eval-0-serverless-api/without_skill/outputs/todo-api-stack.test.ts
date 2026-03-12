import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { TodoApiStack } from "./todo-api-stack";

describe("TodoApiStack", () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new TodoApiStack(app, "TestTodoApiStack");
    template = Template.fromStack(stack);
  });

  describe("DynamoDB Table", () => {
    test("creates a DynamoDB table with correct partition key", () => {
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        KeySchema: [
          {
            AttributeName: "id",
            KeyType: "HASH",
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: "id",
            AttributeType: "S",
          },
        ],
      });
    });

    test("uses PAY_PER_REQUEST billing mode", () => {
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        BillingMode: "PAY_PER_REQUEST",
      });
    });
  });

  describe("Lambda Function", () => {
    test("creates a Lambda function with Node.js 20.x runtime", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "nodejs20.x",
        Handler: "todo-handler.handler",
        Timeout: 30,
        MemorySize: 256,
      });
    });

    test("Lambda has TABLE_NAME environment variable", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            TABLE_NAME: Match.anyValue(),
          },
        },
      });
    });

    test("Lambda has DynamoDB read/write permissions", () => {
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                "dynamodb:BatchGetItem",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:Query",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:ConditionCheckItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
              ]),
              Effect: "Allow",
            }),
          ]),
        },
      });
    });
  });

  describe("API Gateway", () => {
    test("creates a REST API", () => {
      template.hasResourceProperties("AWS::ApiGateway::RestApi", {
        Name: "Todo Service",
      });
    });

    test("creates /todos resource", () => {
      template.resourceCountIs("AWS::ApiGateway::Resource", 2); // /todos and /todos/{id}
    });

    test("creates GET method on /todos", () => {
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: "GET",
        Integration: {
          Type: "AWS_PROXY",
        },
      });
    });

    test("creates POST method on /todos", () => {
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: "POST",
        Integration: {
          Type: "AWS_PROXY",
        },
      });
    });

    test("creates PUT method", () => {
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: "PUT",
        Integration: {
          Type: "AWS_PROXY",
        },
      });
    });

    test("creates DELETE method", () => {
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: "DELETE",
        Integration: {
          Type: "AWS_PROXY",
        },
      });
    });

    test("CORS is configured with OPTIONS method", () => {
      template.hasResourceProperties("AWS::ApiGateway::Method", {
        HttpMethod: "OPTIONS",
      });
    });
  });

  describe("Outputs", () => {
    test("outputs the API URL", () => {
      template.hasOutput("ApiUrl", {});
    });

    test("outputs the table name", () => {
      template.hasOutput("TableName", {});
    });
  });
});
