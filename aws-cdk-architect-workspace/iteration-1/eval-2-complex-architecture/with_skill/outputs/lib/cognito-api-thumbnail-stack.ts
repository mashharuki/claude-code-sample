import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { Construct } from 'constructs';

/**
 * CognitoApiThumbnailStack のプロパティ
 */
export interface CognitoApiThumbnailStackProps extends cdk.StackProps {
  /** デプロイ環境 */
  environment: 'dev' | 'staging' | 'prod';
}

/**
 * Cognito認証付きAPI + DynamoDB + S3ファイルアップロード + サムネイル生成
 *
 * アーキテクチャ:
 *   Cognito UserPool → API Gateway (REST) → Lambda → DynamoDB
 *                                          → S3 (Presigned URL)
 *   S3 (uploads/) → Lambda (サムネイル生成) → S3 (thumbnails/)
 */
export class CognitoApiThumbnailStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly userPool: cognito.UserPool;
  public readonly table: dynamodb.Table;
  public readonly uploadBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: CognitoApiThumbnailStackProps) {
    super(scope, id, props);

    const isDev = props.environment === 'dev';

    // ========================================
    // タグ付与
    // ========================================
    cdk.Tags.of(this).add('Project', 'cognito-api-thumbnail');
    cdk.Tags.of(this).add('Environment', props.environment);

    // ========================================
    // Cognito UserPool
    // ========================================
    this.userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `thumbnail-app-${props.environment}`,
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = this.userPool.addClient('WebClient', {
      authFlows: {
        userSrp: true,
        userPassword: true, // テスト用に有効化
      },
      generateSecret: false,
    });

    // ========================================
    // DynamoDB テーブル
    // ========================================
    this.table = new dynamodb.Table(this, 'ItemsTable', {
      tableName: `thumbnail-items-${props.environment}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // コスト最小: オンデマンド
      removalPolicy: isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: !isDev, // 本番のみPITR有効
    });

    // GSI: ユーザーごとのアイテム一覧取得用
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ========================================
    // S3 バケット（ファイルアップロード用）
    // ========================================
    this.uploadBucket = new s3.Bucket(this, 'UploadBucket', {
      bucketName: undefined, // 自動生成（一意性を確保）
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: isDev ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: isDev,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'], // 本番では適切なオリジンを指定
          maxAge: 3600,
        },
      ],
      lifecycleRules: [
        {
          // コスト最小: 90日後にIA、180日後に削除（検証用）
          transitions: [
            {
              storageClass: s3.StorageClass.INFREQUENT_ACCESS,
              transitionAfter: cdk.Duration.days(90),
            },
          ],
          expiration: isDev ? cdk.Duration.days(180) : undefined,
        },
      ],
    });

    // ========================================
    // Lambda: API ハンドラー
    // ========================================
    const apiHandler = new nodejs.NodejsFunction(this, 'ApiHandler', {
      entry: 'lambda/api-handler.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64, // コスト最小: Graviton
      memorySize: 256, // コスト最小
      timeout: cdk.Duration.seconds(30),
      environment: {
        TABLE_NAME: this.table.tableName,
        BUCKET_NAME: this.uploadBucket.bucketName,
        REGION: cdk.Stack.of(this).region,
      },
      bundling: {
        minify: true,
        sourceMap: true,
      },
    });

    // 最小権限: DynamoDB読み書き + S3 presigned URL生成に必要な権限
    this.table.grantReadWriteData(apiHandler);
    this.uploadBucket.grantReadWrite(apiHandler);

    // ========================================
    // Lambda: サムネイル生成
    // ========================================
    const thumbnailHandler = new nodejs.NodejsFunction(this, 'ThumbnailHandler', {
      entry: 'lambda/thumbnail-handler.ts',
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      memorySize: 512, // 画像処理のため少し多めに確保
      timeout: cdk.Duration.minutes(2),
      environment: {
        TABLE_NAME: this.table.tableName,
        BUCKET_NAME: this.uploadBucket.bucketName,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        nodeModules: ['sharp'], // sharpはネイティブモジュールのためバンドル対象
      },
    });

    this.uploadBucket.grantReadWrite(thumbnailHandler);
    this.table.grantWriteData(thumbnailHandler);

    // S3イベント通知: uploads/ プレフィクスの画像ファイルがアップロードされたら実行
    this.uploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailHandler),
      { prefix: 'uploads/', suffix: '.jpg' },
    );
    this.uploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailHandler),
      { prefix: 'uploads/', suffix: '.jpeg' },
    );
    this.uploadBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(thumbnailHandler),
      { prefix: 'uploads/', suffix: '.png' },
    );

    // ========================================
    // API Gateway
    // ========================================
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `thumbnail-api-${props.environment}`,
      description: 'Cognito認証付きファイルアップロードAPI',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Amz-Date',
          'X-Api-Key',
        ],
      },
      deployOptions: {
        stageName: props.environment,
        throttlingRateLimit: 100, // コスト最小: レート制限
        throttlingBurstLimit: 50,
      },
    });

    // Cognito Authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [this.userPool],
    });

    const cognitoAuthConfig: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    const lambdaIntegration = new apigateway.LambdaIntegration(apiHandler);

    // /items - アイテムのCRUD
    const items = this.api.root.addResource('items');
    items.addMethod('GET', lambdaIntegration, cognitoAuthConfig);
    items.addMethod('POST', lambdaIntegration, cognitoAuthConfig);

    const item = items.addResource('{id}');
    item.addMethod('GET', lambdaIntegration, cognitoAuthConfig);
    item.addMethod('PUT', lambdaIntegration, cognitoAuthConfig);
    item.addMethod('DELETE', lambdaIntegration, cognitoAuthConfig);

    // /upload - Presigned URL取得
    const upload = this.api.root.addResource('upload');
    upload.addMethod('POST', lambdaIntegration, cognitoAuthConfig);

    // ========================================
    // Outputs
    // ========================================
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway endpoint URL',
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

    new cdk.CfnOutput(this, 'TableName', {
      value: this.table.tableName,
      description: 'DynamoDB Table Name',
    });
  }
}
