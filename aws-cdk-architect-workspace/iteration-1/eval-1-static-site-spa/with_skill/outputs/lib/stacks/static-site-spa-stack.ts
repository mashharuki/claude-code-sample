import * as cdk from 'aws-cdk-lib';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export interface StaticSiteSpaStackProps extends cdk.StackProps {
  /**
   * デプロイ環境 (dev / staging / prod)
   */
  readonly environment: string;
}

export class StaticSiteSpaStack extends cdk.Stack {
  /** CloudFront ディストリビューション */
  public readonly distribution: cloudfront.Distribution;

  /** S3 バケット（ビルド済みSPA格納先） */
  public readonly siteBucket: s3.Bucket;

  constructor(scope: Construct, id: string, props: StaticSiteSpaStackProps) {
    super(scope, id, props);

    // ----------------------------------------------------------------
    // S3 バケット — パブリックアクセス完全ブロック、暗号化有効、SSL強制
    // ----------------------------------------------------------------
    this.siteBucket = new s3.Bucket(this, 'SiteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy:
        props.environment === 'prod'
          ? cdk.RemovalPolicy.RETAIN
          : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: props.environment !== 'prod',
    });

    // ----------------------------------------------------------------
    // CloudFront ディストリビューション
    //   - OAC (Origin Access Control) で S3 にアクセス
    //   - HTTP → HTTPS リダイレクト
    //   - SPA 用 403/404 フォールバック (index.html)
    // ----------------------------------------------------------------
    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.seconds(0),
        },
      ],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    // ----------------------------------------------------------------
    // S3 BucketDeployment — ビルド成果物をアップロード & キャッシュ無効化
    // ----------------------------------------------------------------
    new s3deploy.BucketDeployment(this, 'DeploySite', {
      sources: [s3deploy.Source.asset('./frontend/dist')],
      destinationBucket: this.siteBucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });

    // ----------------------------------------------------------------
    // タグ
    // ----------------------------------------------------------------
    cdk.Tags.of(this).add('Project', 'static-site-spa');
    cdk.Tags.of(this).add('Environment', props.environment);

    // ----------------------------------------------------------------
    // Outputs
    // ----------------------------------------------------------------
    new cdk.CfnOutput(this, 'DistributionUrl', {
      value: `https://${this.distribution.distributionDomainName}`,
      description: 'CloudFront ディストリビューション URL (HTTPS)',
    });

    new cdk.CfnOutput(this, 'DistributionId', {
      value: this.distribution.distributionId,
      description: 'CloudFront ディストリビューション ID',
    });

    new cdk.CfnOutput(this, 'BucketName', {
      value: this.siteBucket.bucketName,
      description: 'S3 バケット名',
    });
  }
}
