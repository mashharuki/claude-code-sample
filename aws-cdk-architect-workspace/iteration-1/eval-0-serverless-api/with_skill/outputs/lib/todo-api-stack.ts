import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

export interface TodoApiStackProps extends cdk.StackProps {
  /**
   * デプロイ環境
   * @default 'dev'
   */
  environment?: 'dev' | 'staging' | 'prod';
}

export class TodoApiStack extends cdk.Stack {
  public readonly apiUrl: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props?: TodoApiStackProps) {
    super(scope, id, props);

    const env = props?.environment ?? 'dev';
    const isProd = env === 'prod';

    // ========================================
    // DynamoDB Table
    // ========================================
    const todosTable = new dynamodb.Table(this, 'TodosTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: isProd,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // ========================================
    // Lambda Functions (個別Lambda: CRUD操作ごとに分離)
    // ========================================
    const commonLambdaProps: Partial<nodejs.NodejsFunctionProps> = {
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: todosTable.tableName,
        NODE_OPTIONS: '--enable-source-maps',
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    };

    // Create TODO
    const createFn = new nodejs.NodejsFunction(this, 'CreateTodoFn', {
      ...commonLambdaProps,
      entry: 'lambda/create-todo.ts',
      description: 'TODO作成',
    });
    todosTable.grantWriteData(createFn);

    // Get all TODOs
    const listFn = new nodejs.NodejsFunction(this, 'ListTodosFn', {
      ...commonLambdaProps,
      entry: 'lambda/list-todos.ts',
      description: 'TODO一覧取得',
    });
    todosTable.grantReadData(listFn);

    // Get single TODO
    const getFn = new nodejs.NodejsFunction(this, 'GetTodoFn', {
      ...commonLambdaProps,
      entry: 'lambda/get-todo.ts',
      description: 'TODO取得',
    });
    todosTable.grantReadData(getFn);

    // Update TODO
    const updateFn = new nodejs.NodejsFunction(this, 'UpdateTodoFn', {
      ...commonLambdaProps,
      entry: 'lambda/update-todo.ts',
      description: 'TODO更新',
    });
    todosTable.grantReadWriteData(updateFn);

    // Delete TODO
    const deleteFn = new nodejs.NodejsFunction(this, 'DeleteTodoFn', {
      ...commonLambdaProps,
      entry: 'lambda/delete-todo.ts',
      description: 'TODO削除',
    });
    todosTable.grantReadWriteData(deleteFn);

    // ========================================
    // API Gateway
    // ========================================
    const api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo Service',
      description: 'TODO CRUD REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
      deployOptions: {
        stageName: env,
        tracingEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
      },
    });

    // /todos
    const todos = api.root.addResource('todos');
    todos.addMethod('GET', new apigateway.LambdaIntegration(listFn));
    todos.addMethod('POST', new apigateway.LambdaIntegration(createFn));

    // /todos/{id}
    const todo = todos.addResource('{id}');
    todo.addMethod('GET', new apigateway.LambdaIntegration(getFn));
    todo.addMethod('PUT', new apigateway.LambdaIntegration(updateFn));
    todo.addMethod('DELETE', new apigateway.LambdaIntegration(deleteFn));

    // ========================================
    // Tags
    // ========================================
    cdk.Tags.of(this).add('Project', 'todo-api');
    cdk.Tags.of(this).add('Environment', env);

    // ========================================
    // Outputs
    // ========================================
    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'TODO API Gateway endpoint URL',
    });

    new cdk.CfnOutput(this, 'TodosTableName', {
      value: todosTable.tableName,
      description: 'DynamoDB Todos table name',
    });
  }
}
