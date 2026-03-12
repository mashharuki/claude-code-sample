import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { StaticSiteSpaStack } from "./static-site-spa-stack";
import * as path from "path";

/**
 * テスト用のダミーディレクトリ。
 * 実際のテスト実行時にはこのパスに空ディレクトリ or ダミーファイルが必要。
 * CDK の `Source.asset` は synth 時にディレクトリの存在を確認するため。
 */
const DUMMY_SITE_PATH = path.join(__dirname, "test-site-fixture");

// テスト用のフィクスチャディレクトリを作成
beforeAll(() => {
  const fs = require("fs");
  if (!fs.existsSync(DUMMY_SITE_PATH)) {
    fs.mkdirSync(DUMMY_SITE_PATH, { recursive: true });
    fs.writeFileSync(
      path.join(DUMMY_SITE_PATH, "index.html"),
      "<html><body>test</body></html>",
    );
  }
});

afterAll(() => {
  const fs = require("fs");
  if (fs.existsSync(DUMMY_SITE_PATH)) {
    fs.rmSync(DUMMY_SITE_PATH, { recursive: true, force: true });
  }
});

describe("StaticSiteSpaStack", () => {
  let template: Template;

  beforeAll(() => {
    const app = new cdk.App();
    const stack = new StaticSiteSpaStack(app, "TestStack", {
      siteContentPath: DUMMY_SITE_PATH,
    });
    template = Template.fromStack(stack);
  });

  // -------------------------------------------------------
  // S3 バケット
  // -------------------------------------------------------
  test("S3 バケットが作成され、パブリックアクセスが全てブロックされている", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test("S3 バケットに SSE-S3 暗号化が設定されている", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: "aws:kms",
            },
          },
        ],
      },
    });
  });

  // -------------------------------------------------------
  // CloudFront ディストリビューション
  // -------------------------------------------------------
  test("CloudFront ディストリビューションが作成されている", () => {
    template.resourceCountIs("AWS::CloudFront::Distribution", 1);
  });

  test("デフォルトルートオブジェクトが index.html に設定されている", () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        DefaultRootObject: "index.html",
      },
    });
  });

  test("HTTPS リダイレクトが設定されている", () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        DefaultCacheBehavior: {
          ViewerProtocolPolicy: "redirect-to-https",
          Compress: true,
        },
      },
    });
  });

  test("SPA ルーティング用のカスタムエラーレスポンスが設定されている", () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({
            ErrorCode: 403,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          }),
          Match.objectLike({
            ErrorCode: 404,
            ResponseCode: 200,
            ResponsePagePath: "/index.html",
          }),
        ]),
      },
    });
  });

  test("TLS 1.2 以上が必須になっている", () => {
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        ViewerCertificate: {
          MinimumProtocolVersion: "TLSv1.2_2021",
        },
      },
    });
  });

  // -------------------------------------------------------
  // Origin Access Control
  // -------------------------------------------------------
  test("CloudFront Origin Access Control が作成されている", () => {
    template.hasResourceProperties(
      "AWS::CloudFront::OriginAccessControl",
      {
        OriginAccessControlConfig: {
          OriginAccessControlOriginType: "s3",
          SigningBehavior: "always",
          SigningProtocol: "sigv4",
        },
      },
    );
  });

  // -------------------------------------------------------
  // S3 バケットポリシー
  // -------------------------------------------------------
  test("S3 バケットポリシーが存在する", () => {
    template.resourceCountIs("AWS::S3::BucketPolicy", 1);
  });

  // -------------------------------------------------------
  // 出力
  // -------------------------------------------------------
  test("CloudFront ドメイン名が出力されている", () => {
    template.hasOutput("DistributionDomainName", {
      Value: Match.anyValue(),
    });
  });

  test("S3 バケット名が出力されている", () => {
    template.hasOutput("BucketName", {
      Value: Match.anyValue(),
    });
  });
});
