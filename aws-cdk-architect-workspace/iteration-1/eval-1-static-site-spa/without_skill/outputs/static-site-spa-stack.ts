import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfront_origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";

export interface StaticSiteSpaStackProps extends cdk.StackProps {
  /**
   * ビルド済みSPAの成果物が格納されているローカルディレクトリパス。
   * 例: "./build" や "./dist"
   */
  readonly siteContentPath: string;
}

export class StaticSiteSpaStack extends cdk.Stack {
  /** CloudFront ディストリビューションのドメイン名 */
  public readonly distributionDomainName: cdk.CfnOutput;
  /** S3 バケット名 */
  public readonly bucketName: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: StaticSiteSpaStackProps) {
    super(scope, id, props);

    // -------------------------------------------------------
    // 1. S3 バケット (オリジン用)
    //    - パブリックアクセスは全てブロック
    //    - CloudFront OAC 経由でのみアクセスを許可
    //    - スタック削除時にバケットも自動削除
    // -------------------------------------------------------
    const siteBucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
    });

    // -------------------------------------------------------
    // 2. CloudFront ディストリビューション
    //    - S3 Origin Access Control (OAC) を自動設定
    //    - SPA 用に 403/404 を index.html へフォールバック
    //    - HTTPS のみ (CloudFront デフォルトドメイン *.cloudfront.net)
    // -------------------------------------------------------
    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin:
          cloudfront_origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy:
          cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: "index.html",
      // SPA ルーティング対応: React Router 等がハンドルするため
      // 存在しないパスへのアクセスも index.html を返す
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.minutes(5),
        },
      ],
      minimumProtocolVersion:
        cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
    });

    // -------------------------------------------------------
    // 3. S3 へビルド成果物をデプロイ
    //    - デプロイ後に CloudFront キャッシュを自動無効化
    // -------------------------------------------------------
    new s3deploy.BucketDeployment(this, "DeploySiteContents", {
      sources: [s3deploy.Source.asset(props.siteContentPath)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ["/*"],
    });

    // -------------------------------------------------------
    // 4. 出力
    // -------------------------------------------------------
    this.distributionDomainName = new cdk.CfnOutput(
      this,
      "DistributionDomainName",
      {
        value: `https://${distribution.distributionDomainName}`,
        description: "CloudFront ディストリビューション URL (HTTPS)",
      },
    );

    this.bucketName = new cdk.CfnOutput(this, "BucketName", {
      value: siteBucket.bucketName,
      description: "S3 バケット名",
    });
  }
}
