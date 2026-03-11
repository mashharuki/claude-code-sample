# AWS RSSフィード完全リスト

情報収集に使用する全RSSフィードの一覧。グループ分けはSKILL.mdの並列取得グループに対応。

## グループ1: コアフィード（毎回必須）

| フィード名 | RSS URL | 内容 |
|-----------|---------|------|
| AWS News Blog | https://aws.amazon.com/blogs/aws/feed/ | 新サービス発表、重要アップデートの第一報 |
| AWS What's New | https://aws.amazon.com/new/feed/ | 全サービスの新機能・アップデートを網羅 |
| AWS Japan Blog | https://aws.amazon.com/jp/blogs/news/feed/ | 日本語での公式情報、国内イベント |

## グループ2: サービス別ブログ

| フィード名 | RSS URL | 主なトピック |
|-----------|---------|-------------|
| Architecture Blog | https://aws.amazon.com/blogs/architecture/feed/ | 設計パターン、Well-Architected |
| Compute Blog | https://aws.amazon.com/blogs/compute/feed/ | EC2, Lambda, ECS等コンピュート全般 |
| Security Blog | https://aws.amazon.com/blogs/security/feed/ | IAM, GuardDuty, セキュリティベストプラクティス |
| Database Blog | https://aws.amazon.com/blogs/database/feed/ | RDS, DynamoDB, Aurora等 |
| DevOps Blog | https://aws.amazon.com/blogs/devops/feed/ | CI/CD, CodePipeline, IaC |
| Machine Learning Blog | https://aws.amazon.com/blogs/machine-learning/feed/ | Bedrock, SageMaker, AI/ML全般 |
| Containers Blog | https://aws.amazon.com/blogs/containers/feed/ | ECS, EKS, Fargate, App Runner |
| Serverless Blog | https://aws.amazon.com/blogs/compute/category/serverless/feed/ | Lambda, Step Functions, API Gateway |

## グループ3: コミュニティ・障害・その他

| フィード名 | RSS URL | 内容 |
|-----------|---------|------|
| Open Source Blog | https://aws.amazon.com/blogs/opensource/feed/ | OSS関連、CDK、Amplify等 |
| Startup Blog | https://aws.amazon.com/blogs/startups/feed/ | スタートアップ向け情報 |
| Service Health Dashboard | https://status.aws.amazon.com/rss/all.rss | サービス障害・メンテナンス情報 |

## WebFetchでの取得方法

各RSSフィードはXML形式。基本構造：

```xml
<rss>
  <channel>
    <item>
      <title>記事タイトル</title>
      <link>記事URL</link>
      <pubDate>Mon, 01 Jan 2026 00:00:00 +0000</pubDate>
      <description>記事の概要（HTML含む場合あり）</description>
      <category>カテゴリタグ</category>
    </item>
  </channel>
</rss>
```

## RSSで取得できない情報源（WebSearch/WebFetchで補完）

| サイト名 | URL | 備考 |
|---------|-----|------|
| Last Week in AWS | https://www.lastweekinaws.com/ | Corey Quinnの週次ニュースレター |
| AWS re:Post | https://repost.aws/ | コミュニティQ&A |
| AWS Podcast | https://aws.amazon.com/podcasts/aws-podcast/ | 公式ポッドキャスト |
| AWS Online Tech Talks | https://www.youtube.com/c/AWSOnlineTechTalks | YouTube Tech Talks |
| AWS Events Channel | https://www.youtube.com/c/AWSEventsChannel | YouTube Events |

## カテゴリ別の検索クエリ（WebSearch用）

```
# 全般
AWS new service announcement {month} {year}
AWS What's New {month} {year}

# AI/ML特化
Amazon Bedrock updates {year}
Amazon SageMaker new features {year}
AWS generative AI announcements {year}
Amazon Q updates {year}

# セキュリティ
AWS security updates {month} {year}
AWS IAM new features {year}

# コンテナ
Amazon ECS EKS updates {year}
AWS container services new features {year}

# サーバーレス
AWS Lambda new features {year}
AWS serverless updates {year}
```
