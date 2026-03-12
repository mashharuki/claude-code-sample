import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class TodoApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const todosTable = new dynamodb.Table(this, "TodosTable", {
      tableName: "Todos",
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Function
    const todoHandler = new lambda.Function(this, "TodoHandler", {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "todo-handler.handler",
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda")),
      environment: {
        TABLE_NAME: todosTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });

    // Grant DynamoDB permissions to Lambda
    todosTable.grantReadWriteData(todoHandler);

    // API Gateway REST API
    const api = new apigateway.RestApi(this, "TodoApi", {
      restApiName: "Todo Service",
      description: "Serverless REST API for TODO app",
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type", "Authorization"],
      },
    });

    const lambdaIntegration = new apigateway.LambdaIntegration(todoHandler);

    // /todos resource
    const todos = api.root.addResource("todos");
    todos.addMethod("GET", lambdaIntegration); // List all todos
    todos.addMethod("POST", lambdaIntegration); // Create a todo

    // /todos/{id} resource
    const singleTodo = todos.addResource("{id}");
    singleTodo.addMethod("GET", lambdaIntegration); // Get a todo
    singleTodo.addMethod("PUT", lambdaIntegration); // Update a todo
    singleTodo.addMethod("DELETE", lambdaIntegration); // Delete a todo

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url,
      description: "API Gateway endpoint URL",
    });

    new cdk.CfnOutput(this, "TableName", {
      value: todosTable.tableName,
      description: "DynamoDB table name",
    });
  }
}
