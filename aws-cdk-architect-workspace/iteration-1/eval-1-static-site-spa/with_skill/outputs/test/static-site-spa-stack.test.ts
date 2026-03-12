import * as cdk from 'aws-cdk-lib';
import { Template, Match } from 'aws-cdk-lib/assertions';
import { StaticSiteSpaStack } from '../lib/stacks/static-site-spa-stack';

describe('StaticSiteSpaStack', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new StaticSiteSpaStack(app, 'TestStack', {
      environment: 'dev',
    });
    template = Template.fromStack(stack);
  });

  // ----- S3 Bucket -----

  test('S3 バケットがパブリックアクセス完全ブロックで作成される', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('S3 バケットに S3 マネージド暗号化が設定される', () => {
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

  // ----- CloudFront Distribution -----

  test('CloudFront ディストリビューションが作成される', () => {
    template.resourceCountIs('AWS::CloudFront::Distribution', 1);
  });

  test('CloudFront が HTTP→HTTPS リダイレクトに設定される', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: 'redirect-to-https',
        },
      },
    });
  });

  test('CloudFront の DefaultRootObject が index.html に設定される', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        DefaultRootObject: 'index.html',
      },
    });
  });

  test('SPA 向けの 403 エラーレスポンスが /index.html にフォールバックする', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
          }),
        ]),
      },
    });
  });

  test('SPA 向けの 404 エラーレスポンスが /index.html にフォールバックする', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: '/index.html',
          }),
        ]),
      },
    });
  });

  test('TLS 最低バージョンが TLSv1.2_2021 に設定される', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: {
        ViewerCertificate: {
          MinimumProtocolVersion: 'TLSv1.2_2021',
        },
      },
    });
  });

  // ----- OAC -----

  test('Origin Access Control が作成される', () => {
    template.hasResourceProperties(
      'AWS::CloudFront::OriginAccessControl',
      {
        OriginAccessControlConfig: {
          OriginAccessControlOriginType: 's3',
          SigningBehavior: 'always',
          SigningProtocol: 'sigv4',
        },
      },
    );
  });

  // ----- Tags -----

  test('Project タグが付与される', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'Project', Value: 'static-site-spa' }),
      ]),
    });
  });

  // ----- Outputs -----

  test('DistributionUrl が出力される', () => {
    template.hasOutput('DistributionUrl', {});
  });

  test('BucketName が出力される', () => {
    template.hasOutput('BucketName', {});
  });

  // ----- Snapshot -----

  test('スナップショットテスト', () => {
    expect(template.toJSON()).toMatchSnapshot();
  });

  // ----- RemovalPolicy (dev) -----

  test('dev 環境では RemovalPolicy が DESTROY に設定される', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });
});

describe('StaticSiteSpaStack (prod)', () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new StaticSiteSpaStack(app, 'ProdTestStack', {
      environment: 'prod',
    });
    template = Template.fromStack(stack);
  });

  test('prod 環境では RemovalPolicy が RETAIN に設定される', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Retain',
      UpdateReplacePolicy: 'Retain',
    });
  });
});
