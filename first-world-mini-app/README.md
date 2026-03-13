# My First World MiniApp

World Chain MiniApp チュートリアルアプリ。MiniKit SDKの主要機能を学べます。

## 機能

| タブ | 機能 | 学べること |
|------|------|-----------|
| World ID | ユニーク人間検証 | `verify` コマンド、バックエンド `verifyCloudProof` |
| Pay | WLD/USDC送金 | `pay` コマンド、Developer Portal API検証 |
| Sign In | ウォレット認証 | `walletAuth` (SIWE)、nonce管理、`verifySiweMessage` |

## セットアップ

### 1. Developer Portal 設定

1. https://developer.worldcoin.org/ にアクセス
2. 新しいアプリを作成
3. 以下を設定:
   - **Incognito Action**: `verify-human` を追加（World ID検証用）
   - **受取アドレス**: 決済の受取先をホワイトリスト登録
4. App ID と API Key をメモ

### 2. 環境変数

```bash
cp .env.local.example .env.local
```

`.env.local` を編集して Developer Portal の値を設定:

```
APP_ID=app_staging_xxxxx
DEV_PORTAL_API_KEY=sk_xxxxx
NEXT_PUBLIC_APP_ID=app_staging_xxxxx
```

### 3. インストール & 起動

```bash
pnpm install
pnpm dev
```

### 4. テスト方法

- **ブラウザ**: http://localhost:3000 でUI確認（MiniKit機能は動作しない）
- **World App Simulator**: Developer PortalでSimulator URLを設定してテスト
- **World App実機**: デプロイ後、World Appからアクセス

## プロジェクト構成

```
src/
├── app/
│   ├── layout.tsx          # MiniKitProvider設定
│   ├── page.tsx            # メインページ（タブUI）
│   ├── globals.css         # グローバルスタイル
│   └── api/
│       ├── verify/         # World ID検証エンドポイント
│       ├── nonce/          # SIWE nonce生成 & 検証
│       └── verify-payment/ # 決済トランザクション検証
└── components/
    ├── VerifyBlock.tsx     # World ID検証UI
    ├── PayBlock.tsx        # トークン決済UI
    └── SignInBlock.tsx     # ウォレット認証UI
```

## 次のステップ

- スマートコントラクト連携 (`sendTransaction`)
- 通知機能 (`requestPermission` + Notification API)
- ソーシャル機能 (`shareContacts`, `chat`)
- Vercel/Cloudflare へのデプロイ
