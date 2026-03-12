# React SPA 静的サイトホスティング (AWS CDK)

CloudFront + S3 を使って React SPA を HTTPS でホスティングする CDK スタックです。
カスタムドメインは使用せず、CloudFront のデフォルトドメイン (`*.cloudfront.net`) で配信します。

## アーキテクチャ

```
ユーザー → CloudFront (HTTPS) → S3 (OAC経由)
```

- **S3**: ビルド成果物の保存。パブリックアクセスは全てブロック。
- **CloudFront**: HTTPS 配信、キャッシュ、SPA ルーティング (403/404 → index.html)。
- **Origin Access Control (OAC)**: S3 へのアクセスを CloudFront のみに制限。

## 前提条件

- Node.js 18 以上
- AWS CLI が設定済み (`aws configure`)
- AWS CDK CLI がインストール済み

```bash
npm install -g aws-cdk
```

## セットアップ

### 1. CDK プロジェクトの初期化

新規の CDK プロジェクトで使用する場合:

```bash
mkdir my-spa-infra && cd my-spa-infra
cdk init app --language=typescript
```

### 2. 依存パッケージのインストール

```bash
npm install aws-cdk-lib constructs
```

### 3. スタックファイルの配置

`static-site-spa-stack.ts` を `lib/` ディレクトリにコピーします。

### 4. エントリポイントの編集

`bin/<app-name>.ts` を以下のように編集します:

```typescript
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { StaticSiteSpaStack } from "../lib/static-site-spa-stack";

const app = new cdk.App();
new StaticSiteSpaStack(app, "StaticSiteSpaStack", {
  siteContentPath: "../my-react-app/build", // React ビルド成果物のパス
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
```

`siteContentPath` は React アプリの `npm run build` 出力先を指定してください:
- Create React App: `./build`
- Vite: `./dist`

### 5. React アプリのビルド

```bash
cd ../my-react-app
npm run build
```

## デプロイ

### 初回のみ: CDK Bootstrap

```bash
cdk bootstrap
```

### デプロイ実行

```bash
cdk deploy
```

デプロイが完了すると、以下の出力が表示されます:

```
Outputs:
StaticSiteSpaStack.DistributionDomainName = https://d1234567890.cloudfront.net
StaticSiteSpaStack.BucketName = staticsitespastack-sitebucketxxxxxxxx
```

`DistributionDomainName` の URL にブラウザでアクセスすると、SPA が表示されます。

> **注意**: CloudFront のディストリビューションが完全に有効化されるまで数分かかる場合があります。

## テスト

```bash
npm install --save-dev jest ts-jest @types/jest aws-cdk-lib constructs
npx jest static-site-spa-stack.test.ts
```

## 削除

```bash
cdk destroy
```

S3 バケットは `autoDeleteObjects: true` が設定されているため、スタック削除時に自動的に中身ごと削除されます。

## 主な設定

| 項目 | 値 |
|---|---|
| HTTPS | CloudFront デフォルトドメインで自動有効 |
| TLS 最小バージョン | TLS 1.2 (2021ポリシー) |
| HTTP/2, HTTP/3 | 有効 |
| SPA ルーティング | 403/404 → /index.html (200) |
| S3 パブリックアクセス | 全てブロック |
| S3 暗号化 | SSE-S3 |
| SSL 強制 (S3) | 有効 |
| キャッシュ無効化 | デプロイ時に自動実行 (`/*`) |
