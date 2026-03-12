import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CognitoApiThumbnailStack } from '../lib/cognito-api-thumbnail-stack';

describe('CognitoApiThumbnailStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new CognitoApiThumbnailStack(app, 'TestStack', {
      environment: 'dev',
      env: { account: '123456789012', region: 'ap-northeast-1' },
    });
    template = Template.fromStack(stack);
  });

  // ========================================
  // Cognito UserPool
  // ========================================
  describe('Cognito UserPool', () => {
    test('UserPool が作成されること', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AutoVerifiedAttributes: ['email'],
        UsernameAttributes: ['email'],
      });
    });

    test('セルフサインアップが有効であること', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: {
          AllowAdminCreateUserOnly: false,
        },
      });
    });

    test('パスワードポリシーが設定されていること', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        Policies: {
          PasswordPolicy: {
            MinimumLength: 8,
            RequireLowercase: true,
            RequireUppercase: true,
            RequireNumbers: true,
          },
        },
      });
    });

    test('UserPoolClient が作成されること', () => {
      template.hasResourceProperties('AWS::Cognito::UserPoolClient', {
        ExplicitAuthFlows: Match.arrayWith([
          'ALLOW_USER_SRP_AUTH',
          'ALLOW_USER_PASSWORD_AUTH',
        ]),
        GenerateSecret: false,
      });
    });
  });

  // ========================================
  // DynamoDB
  // ========================================
  describe('DynamoDB', () => {
    test('テーブルがPAY_PER_REQUESTで作成されること', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
      });
    });

    test('GSI1 が設定されていること', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: 'GSI1',
            KeySchema: [
              { AttributeName: 'GSI1PK', KeyType: 'HASH' },
              { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
            ],
          }),
        ]),
      });
    });

    test('dev環境ではDESTROYポリシーが設定されていること', () => {
      template.hasResource('AWS::DynamoDB::Table', {
        DeletionPolicy: 'Delete',
      });
    });
  });

  // ========================================
  // S3 Bucket
  // ========================================
  describe('S3 Bucket', () => {
    test('パブリックアクセスがブロックされていること', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    test('暗号化が設定されていること', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: [
            {
              ServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256',
              },
            },
          ],
        },
      });
    });

    test('CORSが設定されていること', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: Match.arrayWith([
            Match.objectLike({
              AllowedMethods: Match.arrayWith(['GET', 'PUT']),
            }),
          ]),
        },
      });
    });
  });

  // ========================================
  // Lambda Functions
  // ========================================
  describe('Lambda Functions', () => {
    test('API Handler Lambda が ARM64 で作成されること', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs22.x',
        Architectures: ['arm64'],
        MemorySize: 256,
      });
    });

    test('Thumbnail Handler Lambda が作成されること', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Runtime: 'nodejs22.x',
        Architectures: ['arm64'],
        MemorySize: 512,
        Timeout: 120,
      });
    });

    test('Lambda に環境変数 TABLE_NAME が設定されていること', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });

    test('Lambda に環境変数 BUCKET_NAME が設定されていること', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            BUCKET_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  // ========================================
  // API Gateway
  // ========================================
  describe('API Gateway', () => {
    test('REST API が作成されること', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'thumbnail-api-dev',
      });
    });

    test('Cognito Authorizer が設定されていること', () => {
      template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
        Type: 'COGNITO_USER_POOLS',
      });
    });

    test('API メソッドに認証が設定されていること', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        AuthorizationType: 'COGNITO_USER_POOLS',
        HttpMethod: 'GET',
      });
    });

    test('API メソッドに POST が設定されていること', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        AuthorizationType: 'COGNITO_USER_POOLS',
        HttpMethod: 'POST',
      });
    });
  });

  // ========================================
  // S3 Event Notification
  // ========================================
  describe('S3 Event Notification', () => {
    test('Lambda の S3 呼び出し権限が設定されていること', () => {
      template.hasResourceProperties('AWS::Lambda::Permission', {
        Action: 'lambda:InvokeFunction',
        Principal: 's3.amazonaws.com',
      });
    });
  });

  // ========================================
  // IAM (最小権限)
  // ========================================
  describe('IAM Permissions', () => {
    test('Lambda に DynamoDB アクセス権限が付与されていること', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['dynamodb:BatchGetItem']),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });
  });

  // ========================================
  // Outputs
  // ========================================
  describe('Outputs', () => {
    test('ApiUrl が出力されること', () => {
      template.hasOutput('ApiUrl', {});
    });

    test('UserPoolId が出力されること', () => {
      template.hasOutput('UserPoolId', {});
    });

    test('UserPoolClientId が出力されること', () => {
      template.hasOutput('UserPoolClientId', {});
    });

    test('UploadBucketName が出力されること', () => {
      template.hasOutput('UploadBucketName', {});
    });

    test('TableName が出力されること', () => {
      template.hasOutput('TableName', {});
    });
  });

  // ========================================
  // スナップショットテスト
  // ========================================
  test('スナップショットテスト', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  // ========================================
  // リソース数の検証
  // ========================================
  test('Lambda 関数が2つ作成されること', () => {
    template.resourceCountIs('AWS::Lambda::Function', 2);
  });

  test('DynamoDB テーブルが1つ作成されること', () => {
    template.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  test('S3 バケットが作成されること', () => {
    // autoDeleteObjects の Custom Resource 用バケットも含む可能性があるため >= 1
    const buckets = template.findResources('AWS::S3::Bucket');
    expect(Object.keys(buckets).length).toBeGreaterThanOrEqual(1);
  });
});
