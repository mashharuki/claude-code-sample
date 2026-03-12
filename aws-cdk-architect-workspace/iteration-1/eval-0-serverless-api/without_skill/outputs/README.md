# TODO App - Serverless REST API (CDK)

API Gateway + Lambda + DynamoDB を使ったサーバーレスな TODO アプリのバックエンドです。

## アーキテクチャ

```
Client → API Gateway → Lambda → DynamoDB
```

- **API Gateway**: REST API エンドポイント (CORS 対応)
- **Lambda**: Node.js 20.x ランタイムで CRUD ロジックを処理
- **DynamoDB**: PAY_PER_REQUEST モードの TODO テーブル

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /todos | TODO 一覧取得 |
| POST | /todos | TODO 作成 |
| GET | /todos/{id} | TODO 単体取得 |
| PUT | /todos/{id} | TODO 更新 |
| DELETE | /todos/{id} | TODO 削除 |

## データモデル

```json
{
  "id": "uuid",
  "title": "string (必須)",
  "description": "string (任意)",
  "completed": false,
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

## セットアップ

### 前提条件

- Node.js 20.x 以上
- AWS CLI (設定済み)
- AWS CDK CLI (`npm install -g aws-cdk`)

### プロジェクト初期化

```bash
# CDK プロジェクトを新規作成
mkdir todo-api && cd todo-api
cdk init app --language typescript

# 依存パッケージは aws-cdk-lib に含まれるため追加インストール不要
# Lambda ハンドラー用の AWS SDK v3 は Lambda ランタイムにバンドル済み
```

### ファイル配置

```
todo-api/
├── bin/
│   └── todo-api.ts          # エントリポイント (自動生成)
├── lib/
│   └── todo-api-stack.ts    # ← todo-api-stack.ts をここにコピー
├── lambda/
│   └── todo-handler.ts      # ← todo-handler.ts をここにコピー (JS にトランスパイル)
├── test/
│   └── todo-api-stack.test.ts  # ← todo-api-stack.test.ts をここにコピー
└── ...
```

### Lambda ハンドラーのビルド

Lambda にデプロイするには JavaScript にトランスパイルする必要があります。

```bash
# lambda ディレクトリを作成
mkdir -p lambda

# esbuild でバンドル (推奨)
npx esbuild todo-handler.ts --bundle --platform=node --target=node20 --outfile=lambda/todo-handler.js --external:@aws-sdk/*
```

または、CDK の `NodejsFunction` を使うとビルドを自動化できます。その場合はスタック内の `lambda.Function` を `NodejsFunction` に置き換えてください。

## デプロイ

```bash
# CDK ブートストラップ (初回のみ)
cdk bootstrap

# 差分確認
cdk diff

# デプロイ
cdk deploy
```

デプロイ完了後、出力される `ApiUrl` がエンドポイント URL です。

## 使用例

```bash
# API URL を変数に設定
API_URL="https://xxxxxxxxxx.execute-api.ap-northeast-1.amazonaws.com/prod"

# TODO 作成
curl -X POST "$API_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title": "牛乳を買う", "description": "低脂肪のもの"}'

# TODO 一覧取得
curl "$API_URL/todos"

# TODO 単体取得
curl "$API_URL/todos/{id}"

# TODO 更新
curl -X PUT "$API_URL/todos/{id}" \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# TODO 削除
curl -X DELETE "$API_URL/todos/{id}"
```

## テスト

```bash
npm test
```

## クリーンアップ

```bash
cdk destroy
```
