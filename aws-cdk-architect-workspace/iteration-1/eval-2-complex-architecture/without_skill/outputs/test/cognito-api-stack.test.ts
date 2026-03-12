import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { CognitoApiStack } from '../lib/cognito-api-stack';

describe('CognitoApiStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new CognitoApiStack(app, 'TestStack');
    template = Template.fromStack(stack);
  });

  // =====================
  // Cognito
  // =====================
  describe('Cognito', () => {
    test('UserPool が作成される', () => {
      template.resourceCountIs('AWS::Cognito::UserPool', 1);
    });

    test('UserPool でセルフサインアップが有効', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        AdminCreateUserConfig: {
          AllowAdminCreateUserOnly: false,
        },
      });
    });

    test('UserPool でメールサインインが有効', () => {
      template.hasResourceProperties('AWS::Cognito::UserPool', {
        UsernameAttributes: ['email'],
        AutoVerifiedAttributes: ['email'],
      });
    });

    test('UserPoolClient が作成される', () => {
      template.resourceCountIs('AWS::Cognito::UserPoolClient', 1);
    });
  });

  // =====================
  // DynamoDB
  // =====================
  describe('DynamoDB', () => {
    test('テーブルが PAY_PER_REQUEST で作成される', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [
          { AttributeName: 'PK', KeyType: 'HASH' },
          { AttributeName: 'SK', KeyType: 'RANGE' },
        ],
      });
    });

    test('テーブルの削除ポリシーが DESTROY', () => {
      template.hasResource('AWS::DynamoDB::Table', {
        DeletionPolicy: 'Delete',
      });
    });
  });

  // =====================
  // S3
  // =====================
  describe('S3', () => {
    test('S3 バケットが2つ作成される (Upload + Thumbnail)', () => {
      template.resourceCountIs('AWS::S3::Bucket', 2);
    });

    test('CORS が設定されている', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        CorsConfiguration: {
          CorsRules: Match.arrayWith([
            Match.objectLike({
              AllowedMethods: Match.arrayWith(['GET', 'PUT', 'POST']),
              AllowedOrigins: ['*'],
            }),
          ]),
        },
      });
    });

    test('ライフサイクルルールが設定されている', () => {
      template.hasResourceProperties('AWS::S3::Bucket', {
        LifecycleConfiguration: {
          Rules: Match.arrayWith([
            Match.objectLike({
              ExpirationInDays: 90,
              Status: 'Enabled',
            }),
          ]),
        },
      });
    });
  });

  // =====================
  // Lambda
  // =====================
  describe('Lambda', () => {
    test('Lambda 関数が2つ作成される (API + Thumbnail)', () => {
      template.resourceCountIs('AWS::Lambda::Function', 2);
    });

    test('API Lambda が ARM64 アーキテクチャ', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Architectures: ['arm64'],
        Runtime: 'nodejs20.x',
      });
    });

    test('API Lambda のメモリが 128MB', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        MemorySize: 128,
      });
    });

    test('Thumbnail Lambda のメモリが 256MB', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        MemorySize: 256,
      });
    });

    test('Lambda に環境変数が設定されている', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
            UPLOAD_BUCKET: Match.anyValue(),
          }),
        },
      });
    });
  });

  // =====================
  // API Gateway
  // =====================
  describe('API Gateway', () => {
    test('REST API が作成される', () => {
      template.resourceCountIs('AWS::ApiGateway::RestApi', 1);
    });

    test('Cognito Authorizer が設定される', () => {
      template.hasResourceProperties('AWS::ApiGateway::Authorizer', {
        Type: 'COGNITO_USER_POOLS',
      });
    });

    test('API メソッドが作成される', () => {
      // items と upload のメソッド (GET/POST/PUT/DELETE + CORS OPTIONS)
      const methods = template.findResources('AWS::ApiGateway::Method');
      const methodCount = Object.keys(methods).length;
      // 少なくとも items(GET,POST), items/{id}(GET,PUT,DELETE), upload(POST) = 6 + OPTIONS
      expect(methodCount).toBeGreaterThanOrEqual(6);
    });
  });

  // =====================
  // S3 Event Notification
  // =====================
  describe('S3 Event Notification', () => {
    test('Lambda パーミッションが S3 から設定される', () => {
      template.hasResourceProperties('AWS::Lambda::Permission', {
        Action: 'lambda:InvokeFunction',
        Principal: 's3.amazonaws.com',
      });
    });
  });

  // =====================
  // Outputs
  // =====================
  describe('Outputs', () => {
    test('必要な出力がすべて定義されている', () => {
      template.hasOutput('ApiUrl', {});
      template.hasOutput('UserPoolId', {});
      template.hasOutput('UserPoolClientId', {});
      template.hasOutput('UploadBucketName', {});
      template.hasOutput('ThumbnailBucketName', {});
    });
  });

  // =====================
  // IAM (権限チェック)
  // =====================
  describe('IAM Permissions', () => {
    test('API Lambda に DynamoDB の権限が付与される', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith([
                'dynamodb:BatchGetItem',
                'dynamodb:GetRecords',
              ]),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });

    test('Thumbnail Lambda に S3 の権限が付与される', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.arrayWith(['s3:GetObject*', 's3:GetBucket*']),
              Effect: 'Allow',
            }),
          ]),
        },
      });
    });
  });
});
