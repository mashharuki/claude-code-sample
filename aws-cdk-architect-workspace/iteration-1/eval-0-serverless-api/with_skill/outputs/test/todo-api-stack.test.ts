import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { TodoApiStack } from '../lib/todo-api-stack';

describe('TodoApiStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new TodoApiStack(app, 'TestTodoApiStack', {
      environment: 'dev',
    });
    template = Template.fromStack(stack);
  });

  // ========================================
  // DynamoDB テスト
  // ========================================
  describe('DynamoDB', () => {
    test('TODOテーブルがPAY_PER_REQUESTで作成される', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: 'PAY_PER_REQUEST',
        KeySchema: [
          {
            AttributeName: 'id',
            KeyType: 'HASH',
          },
        ],
        AttributeDefinitions: [
          {
            AttributeName: 'id',
            AttributeType: 'S',
          },
        ],
      });
    });

    test('dev環境ではRemovalPolicyがDESTROYである', () => {
      template.hasResource('AWS::DynamoDB::Table', {
        DeletionPolicy: 'Delete',
      });
    });
  });

  // ========================================
  // Lambda テスト
  // ========================================
  describe('Lambda Functions', () => {
    test('5つのLambda関数が作成される (CRUD)', () => {
      template.resourceCountIs('AWS::Lambda::Function', 5);
    });

    test('Lambda関数がARM64アーキテクチャを使用している', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Architectures: ['arm64'],
        Runtime: 'nodejs22.x',
      });
    });

    test('Lambda関数にTABLE_NAME環境変数が設定されている', () => {
      template.hasResourceProperties('AWS::Lambda::Function', {
        Environment: {
          Variables: Match.objectLike({
            TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });
  });

  // ========================================
  // API Gateway テスト
  // ========================================
  describe('API Gateway', () => {
    test('REST APIが作成される', () => {
      template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'Todo Service',
      });
    });

    test('CORSが設定されている', () => {
      template.hasResourceProperties('AWS::ApiGateway::Method', {
        HttpMethod: 'OPTIONS',
      });
    });

    test('APIのステージ名がdevである', () => {
      template.hasResourceProperties('AWS::ApiGateway::Stage', {
        StageName: 'dev',
        TracingEnabled: true,
      });
    });
  });

  // ========================================
  // IAM テスト (最小権限)
  // ========================================
  describe('IAM Permissions', () => {
    test('Lambda関数にDynamoDBへのアクセス権限が付与されている', () => {
      template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: Match.anyValue(),
              Effect: 'Allow',
              Resource: Match.anyValue(),
            }),
          ]),
        },
      });
    });
  });

  // ========================================
  // Output テスト
  // ========================================
  describe('Outputs', () => {
    test('API URLがOutputされる', () => {
      template.hasOutput('ApiUrl', {
        Description: 'TODO API Gateway endpoint URL',
      });
    });

    test('テーブル名がOutputされる', () => {
      template.hasOutput('TodosTableName', {
        Description: 'DynamoDB Todos table name',
      });
    });
  });

  // ========================================
  // タグ テスト
  // ========================================
  describe('Tags', () => {
    test('Projectタグが付与されている', () => {
      template.hasResourceProperties('AWS::DynamoDB::Table', {
        Tags: Match.arrayWith([
          { Key: 'Project', Value: 'todo-api' },
          { Key: 'Environment', Value: 'dev' },
        ]),
      });
    });
  });

  // ========================================
  // prod環境テスト
  // ========================================
  describe('prod environment', () => {
    let prodTemplate: Template;

    beforeAll(() => {
      const app = new cdk.App();
      const stack = new TodoApiStack(app, 'ProdTodoApiStack', {
        environment: 'prod',
      });
      prodTemplate = Template.fromStack(stack);
    });

    test('prod環境ではRemovalPolicyがRETAINである', () => {
      prodTemplate.hasResource('AWS::DynamoDB::Table', {
        DeletionPolicy: 'Retain',
      });
    });

    test('prod環境ではポイントインタイムリカバリが有効', () => {
      prodTemplate.hasResourceProperties('AWS::DynamoDB::Table', {
        PointInTimeRecoverySpecification: {
          PointInTimeRecoveryEnabled: true,
        },
      });
    });
  });

  // ========================================
  // スナップショットテスト
  // ========================================
  test('snapshot test', () => {
    const app = new cdk.App();
    const stack = new TodoApiStack(app, 'SnapshotTestStack', {
      environment: 'dev',
    });
    const snapshotTemplate = Template.fromStack(stack);
    expect(snapshotTemplate.toJSON()).toMatchSnapshot();
  });
});
