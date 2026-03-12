# TODO API - サーバーレス REST API (AWS CDK)

API Gateway + Lambda + DynamoDB を使ったサーバーレスなTODOアプリのバックエンドです。

## アーキテクチャ

```
Client → API Gateway (REST) → Lambda (個別関数) → DynamoDB
```

### リソース構成

| リソース | 説明 |
|----------|------|
| DynamoDB Table | TODOデータの永続化 (PAY_PER_REQUEST) |
| Lambda x5 | Create / List / Get / Update / Delete の個別関数 |
| API Gateway | REST API エンドポイント (CORS対応) |

### API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| POST | /todos | TODO作成 |
| GET | /todos | TODO一覧取得 |
| GET | /todos/{id} | TODO取得 |
| PUT | /todos/{id} | TODO更新 |
| DELETE | /todos/{id} | TODO削除 |

### リクエスト/レスポンス例

**POST /todos**
```json
// Request
{
  "title": "牛乳を買う",
  "description": "低脂肪のもの"
}

// Response (201)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "牛乳を買う",
  "description": "低脂肪のもの",
  "completed": false,
  "createdAt": "2026-03-11T10:00:00.000Z",
  "updatedAt": "2026-03-11T10:00:00.000Z"
}
```

**PUT /todos/{id}**
```json
// Request
{
  "completed": true
}

// Response (200)
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "牛乳を買う",
  "description": "低脂肪のもの",
  "completed": true,
  "createdAt": "2026-03-11T10:00:00.000Z",
  "updatedAt": "2026-03-11T12:00:00.000Z"
}
```

## 設計方針

- **個別Lambda関数**: CRUD操作ごとにLambda関数を分離し、最小権限の原則を適用
  - List/Get関数は `grantReadData` のみ
  - Create関数は `grantWriteData` のみ
  - Update/Delete関数は `grantReadWriteData`
- **ARM64アーキテクチャ**: コスト効率の良いGraviton2を使用
- **環境分離**: Props経由で `dev` / `staging` / `prod` を切り替え
  - prod: DynamoDB RemovalPolicy=RETAIN, ポイントインタイムリカバリ有効
  - dev: RemovalPolicy=DESTROY
- **CORS対応**: フロントエンドからのアクセスに対応
- **X-Ray トレーシング**: API Gateway でトレーシング有効化

## 前提条件

- Node.js 22.x 以上
- AWS CLI が設定済み (`aws configure`)
- AWS CDK CLI がインストール済み (`npm install -g aws-cdk`)

## デプロイ手順

```bash
# 1. 依存関係のインストール
npm install

# 2. TypeScriptのコンパイル確認
npx tsc --noEmit

# 3. テスト実行
npx jest

# 4. CDK Bootstrap (初回のみ)
npx cdk bootstrap

# 5. CDK diff で変更内容を確認
npx cdk diff

# 6. CDK synth でCloudFormationテンプレートを生成 (確認用)
npx cdk synth

# 7. デプロイ (dev環境)
npx cdk deploy

# staging/prod環境へのデプロイ
npx cdk deploy -c environment=staging
npx cdk deploy -c environment=prod
```

## デプロイ後の確認

デプロイ完了後、Outputsに表示される `ApiUrl` を使ってAPIをテストできます。

```bash
# TODO作成
curl -X POST <ApiUrl>/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "テストTODO", "description": "テスト説明"}'

# TODO一覧取得
curl <ApiUrl>/todos

# TODO更新
curl -X PUT <ApiUrl>/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# TODO削除
curl -X DELETE <ApiUrl>/todos/<id>
```

## クリーンアップ

```bash
npx cdk destroy
```

## プロジェクト構造

```
.
├── bin/
│   └── app.ts                  # CDKアプリのエントリーポイント
├── lib/
│   └── todo-api-stack.ts       # メインスタック定義
├── lambda/
│   ├── create-todo.ts          # TODO作成ハンドラー
│   ├── list-todos.ts           # TODO一覧取得ハンドラー
│   ├── get-todo.ts             # TODO単体取得ハンドラー
│   ├── update-todo.ts          # TODO更新ハンドラー
│   └── delete-todo.ts          # TODO削除ハンドラー
├── test/
│   └── todo-api-stack.test.ts  # CDKスタックテスト
├── cdk.json
├── package.json
└── tsconfig.json
```
