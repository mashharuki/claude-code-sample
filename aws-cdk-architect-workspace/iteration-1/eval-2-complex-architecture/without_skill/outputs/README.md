# Cognito認証付き API (CDK Stack)

Cognito認証、API Gateway、Lambda (TypeScript)、DynamoDB、S3ファイルアップロード、サムネイル自動生成を備えたサーバーレスAPIスタック。

## アーキテクチャ

```
Client
  │
  ├─► Cognito User Pool (認証)
  │
  ├─► API Gateway (REST API + Cognito Authorizer)
  │     │
  │     └─► Lambda (API Handler - 128MB, ARM64)
  │           ├─► DynamoDB (PAY_PER_REQUEST)
  │           └─► S3 Upload Bucket (Presigned URL発行)
  │
  └─► S3 Upload Bucket
        │ (OBJECT_CREATED イベント: .jpg/.jpeg/.png)
        └─► Lambda (Thumbnail Generator - 256MB, ARM64)
              └─► S3 Thumbnail Bucket
```

## コスト最適化ポイント

| リソース | 最適化内容 |
|----------|-----------|
| Lambda | ARM64 (Graviton2) で x86 比約20%安価、最小メモリ設定 |
| DynamoDB | PAY_PER_REQUEST (オンデマンド) で使った分だけ課金 |
| S3 | 90日ライフサイクルルールで自動削除 |
| API Gateway | スロットリング設定 (burst: 10, rate: 5/sec) |
| Cognito | User Pool は月5万MAUまで無料 |
| 全体 | 検証用のため RemovalPolicy.DESTROY でクリーンアップ容易 |

## 前提条件

- Node.js 18 以上
- AWS CLI (設定済み)
- AWS CDK CLI v2
- Docker (サムネイルLambdaのbundlingに必要)

## セットアップ & デプロイ

```bash
# 1. 依存関係のインストール
npm install

# 2. CDK Bootstrap (初回のみ)
npx cdk bootstrap

# 3. テスト実行
npm test

# 4. スタックの合成 (CloudFormation テンプレート確認)
npx cdk synth

# 5. デプロイ
npx cdk deploy

# 6. 削除
npx cdk destroy
```

## API エンドポイント

デプロイ後に出力される `ApiUrl` を使用します。

### 認証

すべてのエンドポイントは Cognito 認証が必要です。リクエストヘッダーに `Authorization: Bearer <IdToken>` を付与してください。

### ユーザー登録 & ログイン (AWS CLI)

```bash
# ユーザー登録
aws cognito-idp sign-up \
  --client-id <UserPoolClientId> \
  --username user@example.com \
  --password YourPassword1

# メール確認 (管理者確認)
aws cognito-idp admin-confirm-sign-up \
  --user-pool-id <UserPoolId> \
  --username user@example.com

# ログイン (トークン取得)
aws cognito-idp initiate-auth \
  --client-id <UserPoolClientId> \
  --auth-flow USER_PASSWORD_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=YourPassword1
```

### Items CRUD

```bash
# ID トークンを変数に設定
TOKEN="<IdToken from login response>"

# アイテム一覧取得
curl -H "Authorization: Bearer $TOKEN" <ApiUrl>/items

# アイテム作成
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "test item", "description": "hello"}' \
  <ApiUrl>/items

# アイテム取得
curl -H "Authorization: Bearer $TOKEN" <ApiUrl>/items/{id}

# アイテム更新
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "updated item"}' \
  <ApiUrl>/items/{id}

# アイテム削除
curl -X DELETE -H "Authorization: Bearer $TOKEN" <ApiUrl>/items/{id}
```

### ファイルアップロード

```bash
# 1. Presigned URL を取得
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fileName": "photo.jpg", "contentType": "image/jpeg"}' \
  <ApiUrl>/upload

# 2. Presigned URL にファイルをアップロード
curl -X PUT -H "Content-Type: image/jpeg" \
  --data-binary @photo.jpg \
  "<uploadUrl from step 1>"
```

アップロード後、.jpg / .jpeg / .png ファイルは自動的にサムネイル (200x200) が `ThumbnailBucket` に生成されます。

## ファイル構成

```
.
├── bin/
│   └── app.ts                  # CDK アプリケーションエントリポイント
├── lib/
│   └── cognito-api-stack.ts    # メインスタック定義
├── lambda/
│   ├── api/
│   │   └── index.ts            # API Lambda ハンドラー
│   └── thumbnail/
│       └── index.ts            # サムネイル生成 Lambda ハンドラー
├── test/
│   └── cognito-api-stack.test.ts  # CDK スタックテスト
├── cdk.json
├── jest.config.js
├── package.json
├── tsconfig.json
└── README.md
```

## DynamoDB テーブル設計

Single Table Design を採用:

| PK | SK | 用途 |
|----|----|------|
| `USER#{userId}` | `ITEM#{itemId}` | ユーザーごとのアイテム |

## 注意事項

- 検証用スタックのため `RemovalPolicy.DESTROY` を設定しています。本番環境では `RETAIN` に変更してください。
- サムネイル生成 Lambda は `sharp` ライブラリを使用するため、Docker によるバンドリングが必要です。
- S3 バケットには90日のライフサイクルルールが設定されています。
