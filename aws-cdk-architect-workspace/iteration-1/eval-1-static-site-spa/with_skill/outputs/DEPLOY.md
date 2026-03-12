# デプロイ手順

## 前提条件

- Node.js 18 以上
- AWS CLI が設定済み（`aws configure`）
- AWS CDK CLI がインストール済み（`npm install -g aws-cdk`）

## プロジェクト構造

```
outputs/
├── bin/
│   └── app.ts                          # エントリーポイント
├── lib/
│   └── stacks/
│       └── static-site-spa-stack.ts    # メインスタック
├── test/
│   └── static-site-spa-stack.test.ts   # テストコード
├── frontend/
│   └── dist/                           # React ビルド成果物（配置先）
├── cdk.json
├── jest.config.js
├── package.json
└── tsconfig.json
```

## セットアップ

```bash
# 1. 依存関係のインストール
npm install

# 2. React アプリのビルド成果物を配置
#    React プロジェクトで `npm run build` 実行後、
#    ビルド出力を frontend/dist/ にコピーする
mkdir -p frontend/dist
cp -r /path/to/your-react-app/dist/* frontend/dist/
```

## テスト

```bash
# TypeScript コンパイル確認
npx tsc --noEmit

# テスト実行
npx jest
```

## デプロイ

```bash
# 初回のみ: CDK Bootstrap（対象アカウント・リージョンに1回だけ実行）
npx cdk bootstrap

# 変更内容の確認
npx cdk diff

# CloudFormation テンプレートの生成（確認用）
npx cdk synth

# デプロイ実行
npx cdk deploy

# 環境を指定してデプロイ（デフォルト: dev）
npx cdk deploy -c environment=prod
```

## デプロイ後の確認

デプロイ完了後、Outputs に表示される `DistributionUrl` の URL にブラウザでアクセスすると、
HTTPS で React SPA が表示されます。

## スタック削除

```bash
npx cdk destroy
```

## アーキテクチャ

```
ユーザー → CloudFront (HTTPS) → S3 Bucket (OAC経由)
```

- **S3 Bucket**: ビルド済み React SPA の格納先。パブリックアクセスは完全ブロック。
- **CloudFront**: CDN + HTTPS 終端。OAC (Origin Access Control) で S3 にアクセス。
- **SPA ルーティング対応**: 403/404 エラーを index.html にフォールバックし、React Router 等のクライアントサイドルーティングに対応。
- **HTTPS**: CloudFront デフォルトドメイン (`*.cloudfront.net`) で TLS 1.2 以上を強制。
