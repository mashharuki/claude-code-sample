import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export class CognitoApiStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly api: apigateway.RestApi;
  public readonly table: dynamodb.Table;
  public readonly uploadBucket: s3.Bucket;
  public readonly thumbnailBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // =========================================
    // Cognito User Pool (コスト最小: セルフサインアップ)
    // =========================================
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: 'cognito-api-user-pool',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: false,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = this.userPool.addClient('UserPoolClient', {
      userPoolClientName: 'cognito-api-client',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      generateSecret: false,
    });

    // =========================================
    // DynamoDB Table (コスト最小: PAY_PER_REQUEST)
    // =========================================
    this.table = new dynamodb.Table(this, 'DataTable', {
      tableName: 'cognito-api-data',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // =========================================
    // S3 Buckets (アップロード用 + サムネイル用)
    // =========================================
    this.uploadBucket = new s3.Bucket(this, 'UploadBucket', {
      bucketName: undefined, // 自動生成
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      lifecycleRules: [
        {
          // コスト最小: 90日後に削除
          expiration: cdk.Duration.days(90),
        },
      ],
    });

    this.thumbnailBucket = new s3.Bucket(this, 'ThumbnailBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          expiration: cdk.Duration.days(90),
        },
      ],
    });

    // =========================================
    // Lambda: API Handler (コスト最小: 128MB, arm64)
    // =========================================
    const apiHandler = new nodejs.NodejsFunction(this, 'ApiHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../lambda/api/index.ts'),
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: this.table.tableName,
        UPLOAD_BUCKET: this.uploadBucket.bucketName,
        THUMBNAIL_BUCKET: this.thumbnailBucket.bucketName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    // Lambda に DynamoDB と S3 の権限を付与
    this.table.grantReadWriteData(apiHandler);
    this.uploadBucket.grantPut(apiHandler);
    this.uploadBucket.grantRead(apiHandler);
    this.thumbnailBucket.grantRead(apiHandler);

    // =========================================
    // Lambda: Thumbnail Generator (コスト最小: 256MB, arm64)
    // =========================================
    const thumbnailHandler = new nodejs.NodejsFunction(this, 'ThumbnailHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(__dirname, '../lambda/thumbnail/index.ts'),
      handler: 'handler',
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      environment: {
        THUMBNAIL_BUCKET: this.thumbnailBucket.bucketName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        nodeModules: ['sharp'],
        forceDockerBundling: true,
      },
    });

    // サムネイル Lambda に S3 の権限を付与
    this.uploadBucket.grantRead(thumbnailHandler);
    this.thumbnailBucket.grantPut(thumbnailHandler);

    // S3 アップロードイベントでサムネイル生成をトリガー
    this.uploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailHandler),
      { suffix: '.jpg' },
    );
    this.uploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailHandler),
      { suffix: '.jpeg' },
    );
    this.uploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailHandler),
      { suffix: '.png' },
    );

    // =========================================
    // API Gateway (REST API + Cognito Authorizer)
    // =========================================
    this.api = new apigateway.RestApi(this, 'CognitoApi', {
      restApiName: 'cognito-api',
      description: 'Cognito authenticated API with DynamoDB and S3',
      deployOptions: {
        stageName: 'prod',
        throttlingBurstLimit: 10,
        throttlingRateLimit: 5,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [this.userPool],
    });

    const authMethodOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    const lambdaIntegration = new apigateway.LambdaIntegration(apiHandler);

    // /items リソース
    const items = this.api.root.addResource('items');
    items.addMethod('GET', lambdaIntegration, authMethodOptions);
    items.addMethod('POST', lambdaIntegration, authMethodOptions);

    const item = items.addResource('{id}');
    item.addMethod('GET', lambdaIntegration, authMethodOptions);
    item.addMethod('PUT', lambdaIntegration, authMethodOptions);
    item.addMethod('DELETE', lambdaIntegration, authMethodOptions);

    // /upload リソース (presigned URL 取得用)
    const upload = this.api.root.addResource('upload');
    upload.addMethod('POST', lambdaIntegration, authMethodOptions);

    // =========================================
    // Outputs
    // =========================================
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'Cognito User Pool ID',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
    });

    new cdk.CfnOutput(this, 'UploadBucketName', {
      value: this.uploadBucket.bucketName,
      description: 'S3 Upload Bucket Name',
    });

    new cdk.CfnOutput(this, 'ThumbnailBucketName', {
      value: this.thumbnailBucket.bucketName,
      description: 'S3 Thumbnail Bucket Name',
    });
  }
}
