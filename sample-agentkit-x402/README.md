# AgentKit x402 チュートリアル

World の [AgentKit](https://github.com/worldcoin/agentkit) と [x402 プロトコル](https://github.com/coinbase/x402) を組み合わせた最小構成のチュートリアルアプリです。  
**「人間に裏付けられたエージェントが支払いなしで保護リソースにアクセスする」** 仕組みを体験できます。

## 概要

### AgentKit x402 とは

x402 は HTTP 402 ステータスコードを使ったオープンな支払いプロトコルです。  
AgentKit はこれを拡張し、World ID で本人確認済みのエージェントが **無料・割引・フリートライアル** でリソースにアクセスできる仕組みを提供します。

```
エージェント → GET /api/weather
            ← 402 + AgentKit チャレンジ（nonce 付き）
エージェント → SIWE メッセージを構築して EOA 署名
            → agentkit ヘッダー付きで再リクエスト
サーバー    → 署名検証 + AgentBook（オンチェーン）確認
            ← 200 OK（無料アクセス）
```

### アクセスモード

| モード | 動作 |
|--------|------|
| `free` | 人間に裏付けられたエージェントは常に無料 |
| `free-trial` | 最初の N 回は無料、以降は通常支払い |
| `discount` | N% 割引価格で支払い |

このチュートリアルでは `free` モードを使用しています。

---

## ファイル構成

```
sample-agentkit-x402/
├── src/
│   ├── server.ts          # x402 + AgentKit 保護サーバー（Express）
│   ├── agent.ts           # スタンドアロンエージェントスクリプト
├── public/
│   └── index.html     # htmx インタラクティブデモ UI
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 必要な環境

- [Bun](https://bun.sh) v1.0 以上
- Node.js は不要（bun が直接 TypeScript を実行）

---

## セットアップ

```bash
cd sample-agentkit-x402

# 依存関係のインストール
bun install

# 環境変数の設定
cp .env.example .env
```

`.env` の内容：

```env
# エージェントウォレットの秘密鍵（省略するとランダム生成）
AGENT_PRIVATE_KEY=

# サーバーポート（デフォルト: 3001）
PORT=3001

# ローカル開発用: AgentBook（World ID オンチェーン検証）をスキップ
# 本番環境では必ず削除すること
SKIP_AGENT_BOOK=true
```

---

## 起動方法

### サーバー起動

```bash
# 通常起動
bun start

# 開発用（ホットリロード）
bun dev
```

ブラウザで `http://localhost:3001` を開くとインタラクティブなデモ UI が表示されます。

### エージェントスクリプト実行

サーバーを起動した状態で別ターミナルから：

```bash
bun run agent
```

実行すると以下のような出力が確認できます：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AgentKit x402 Agent Demo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Agent Wallet: 0xAbCd...

[INFO] GET http://localhost:3001/api/weather
[WARN] 402 Payment Required を受信
[INFO] agentkit 拡張を検出 (mode: {"type":"free"})
[INFO] チェーン選択: eip155:8453 (type: eip191)
[INFO] --- SIWE メッセージ ---
localhost wants you to sign in with your Ethereum account:
0xAbCd...
...
[INFO] 署名完了: 0x1a2b3c...
[INFO] agentkit ヘッダーを付与して再リクエスト...
[OK]   200 OK — AgentKit 認証成功！
```

### 型チェック

```bash
bun typecheck
```

---

## デモ UI の使い方

`http://localhost:3001` にアクセスすると、3 つのステップを順に確認できます。

| ステップ | 内容 |
|----------|------|
| **Step 1** | AgentKit ヘッダーなしでリクエスト → **402** + チャレンジが返る様子を確認 |
| **Step 2** | SIWE メッセージの構築・署名・ヘッダー組み立ての詳細を確認 |
| **Step 3** | 認証成功後に **200** で天気データが返る様子を確認 |

---

## 認証フローの詳細

### サーバー側（`server.ts`）

```
1. parseAgentkitHeader()     — Base64 デコード + スキーマバリデーション
2. validateAgentkitMessage() — ドメイン・URI・タイムスタンプ・ノンス検証
3. verifyAgentkitSignature() — EOA (EIP-191) / SCW (ERC-1271) 自動判定
4. agentBook.lookupHuman()   — AgentBook コントラクトでオンチェーン確認
```

すべて公式 SDK `@worldcoin/agentkit-core` の関数を使用しています。

### クライアント側（`agent.ts`）

```
1. GET リクエスト → 402 受信
2. extensions.agentkit からチャレンジを取得
3. formatSIWEMessage() で SIWE メッセージを構築
4. wallet.signMessage() で EIP-191 署名
5. Base64 エンコードして agentkit ヘッダーに付与
6. 再リクエスト → 200 OK
```

---

## 本番環境へ移行する前に

### 1. ウォレットを World ID に登録

```bash
npx @worldcoin/agentkit-cli register <your-wallet-address>
```

World App が起動し、World ID による本人確認フローが始まります。  
登録は 1 つのウォレットにつき 1 回だけ必要です。

### 2. 環境変数を更新

`.env` から `SKIP_AGENT_BOOK=true` を削除してください。  
これにより `createAgentBookVerifier()` が Base mainnet の AgentBook コントラクトを参照し、本物の World ID 検証が有効になります。

### 3. 受取アドレスを設定

`server.ts` の `buildChallengeResponse()` 内にある `payTo` を自分のウォレットアドレスに変更してください。

```ts
payTo: "0xYourActualAddress",
```

### 4. ストレージの永続化（free-trial / discount モードの場合）

`free-trial` や `discount` モードを使う場合は `InMemoryAgentKitStorage` を  
データベースを使った実装（`AgentKitStorage` インターフェース準拠）に置き換えてください。

---

## 使用技術

| パッケージ | 用途 |
|-----------|------|
| `@worldcoin/agentkit-core` | AgentKit 認証ロジック（公式 SDK） |
| `express` | HTTP サーバー |
| `ethers` | ウォレット・署名（クライアント側） |
| `siwe` | SIWE メッセージ構築（agentkit-core 内部依存） |
| `htmx` | インタラクティブ UI（CDN 経由） |

---

## 参考リンク

- [World AgentKit ドキュメント](https://docs.world.org/agents/agent-kit/integrate)
- [worldcoin/agentkit GitHub](https://github.com/worldcoin/agentkit)
- [coinbase/x402 GitHub](https://github.com/coinbase/x402)
- [EIP-4361: Sign-In with Ethereum](https://eips.ethereum.org/EIPS/eip-4361)
