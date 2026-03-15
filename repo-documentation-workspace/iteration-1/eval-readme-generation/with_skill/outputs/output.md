# claude-code-sample

Claude Code の使い方と AI 駆動開発のベストプラクティスを学ぶためのリポジトリ。Kiro 風 Spec 駆動開発（cc-sdd）、Claude Code Skills / Sub Agents、MCP サーバー連携など、Claude Code の主要機能を実践的に体験できる。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | JavaScript (Node.js) / TypeScript |
| フレームワーク | Express.js / Next.js 15 |
| フロントエンド | htmx / React 19 / Tailwind CSS 4 |
| AI ツール | Claude Code / cc-sdd (Spec 駆動開発) |
| MCP サーバー | Context7 / DeepWiki / Sequential Thinking / Chrome DevTools / Draw.io / Serena |
| インフラ | AWS CDK (サンプルワークスペース) |

## ディレクトリ構成

```
claude-code-sample/
├── CLAUDE.md                     # Claude Code プロジェクト設定（Spec 駆動開発ワークフロー）
├── AGENTS.md                     # AI 駆動開発の共通ガイドライン
├── README.md                     # プロジェクト概要
├── .claude/
│   ├── .mcp.json                 # MCP サーバー設定
│   ├── settings.json             # Claude Code 権限・環境設定
│   ├── commands/kiro/            # cc-sdd スラッシュコマンド一式
│   ├── agents/                   # カスタムサブエージェント定義
│   ├── rules/                    # プロジェクトルール
│   └── skills/                   # カスタムスキル（26種）
├── .kiro/
│   ├── steering/                 # プロジェクトメモリ（product / tech / structure）
│   └── settings/                 # cc-sdd 設定
├── sample-htmx-todo-app/         # htmx + Express.js の Todo アプリ
├── first-world-mini-app/         # World Chain MiniApp チュートリアル（Next.js）
├── aws-cdk-architect-workspace/  # AWS CDK スキル評価ワークスペース
├── aws-news-collector-workspace/ # AWS ニュース収集スキル評価ワークスペース
├── prompts/                      # プロンプトテンプレート
└── docs/                         # ドキュメント・見積書テンプレート
```

## 機能一覧

### Claude Code 学習

- **3つのモード**: Ask before edits（編集前確認）/ Edit automatically（自動編集）/ Plan mode（実装プラン作成）
- **MCP サーバー連携**: カスタム MCP 設定による Claude Code の拡張（6つの MCP サーバー設定済み）
- **スラッシュコマンド**: cc-sdd による Kiro 風 Spec 駆動開発のコマンド群（11コマンド）

### カスタムスキル（26種）

リポジトリには多数のカスタムスキルが含まれており、以下のような領域をカバーする:

- **開発支援**: AWS CDK アーキテクト / Vercel React ベストプラクティス / フロントエンドデザイン
- **ドキュメント**: テクニカルライティング / リポジトリドキュメント生成 / Marp スライド作成
- **リサーチ**: AWS コミュニティビルダー / クロスインダストリーリサーチャー
- **Web3**: DeFi 開発 / ENS / Uniswap / LiFi / ARC ブロックチェーン / World MiniApp
- **ビジネス**: 見積書作成 / テックブログ品質レビュー / ハッカソン戦略

### カスタムサブエージェント

- **Apple Style UI Designer**: Apple デザインランゲージに基づく UI/UX レビュー・設計エージェント

### サンプルアプリケーション

#### sample-htmx-todo-app
htmx + Express.js で構築されたシンプルな Todo アプリ。ページ再読み込みなしでタスクの追加・完了・削除が可能。JSON ファイルベースの永続化。

- **API エンドポイント**: `GET /api/todos` / `POST /api/todos` / `PUT /api/todos/:id` / `DELETE /api/todos/:id`

#### first-world-mini-app
World Chain MiniApp のチュートリアルアプリ（Next.js 15 + React 19 + MiniKit SDK）。

- **World ID**: ユニーク人間検証（`verify` コマンド）
- **Pay**: WLD/USDC 送金（`pay` コマンド）
- **Sign In**: ウォレット認証（SIWE）

### スキル評価ワークスペース

- **aws-cdk-architect-workspace**: AWS CDK スキルの with_skill / without_skill 比較評価（Serverless API / Static Site SPA / Complex Architecture）
- **aws-news-collector-workspace**: AWS ニュース収集スキルの比較評価（Weekly Summary / Focused Bedrock / Blog Ideas）

## セットアップ

### 前提条件

- Node.js
- npm / pnpm
- Claude Code CLI

### Claude Code の起動

```bash
# MCP設定を指定して起動
claude --mcp-config=./.claude/.mcp.json
```

### cc-sdd（Spec 駆動開発）の導入

```bash
npx cc-sdd@latest --lang ja
```

`.claude/commands/kiro` 配下に Kiro 風のスラッシュコマンド一式が作成される。

### スキルの追加

```bash
# Vercel React Best Practice スキルの導入例
npx add-skill vercel-labs/agent-skills
```

### sample-htmx-todo-app の起動

```bash
cd sample-htmx-todo-app
npm install
npm run dev
# http://localhost:3000 でアクセス
```

### first-world-mini-app の起動

```bash
cd first-world-mini-app
cp .env.local.example .env.local
# .env.local を編集して Developer Portal の値を設定
pnpm install
pnpm dev
```

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `claude --mcp-config=./.claude/.mcp.json` | MCP サーバー設定付きで Claude Code を起動 |
| `npx cc-sdd@latest --lang ja` | cc-sdd（Spec 駆動開発）のセットアップ |
| `/kiro:spec-init "description"` | 新しい仕様の初期化 |
| `/kiro:spec-requirements {feature}` | 要件定義の作成 |
| `/kiro:spec-design {feature}` | 設計書の作成 |
| `/kiro:spec-tasks {feature}` | タスク分解 |
| `/kiro:spec-impl {feature}` | 実装の実行 |
| `/kiro:spec-status {feature}` | 進捗確認 |
| `/agents` | サブエージェントの作成 |

## アーキテクチャ概要

本リポジトリは **学習用モノレポ** として構成されている。ルートに Claude Code の設定（CLAUDE.md / AGENTS.md / .claude/）と Spec 駆動開発の設定（.kiro/）を配置し、各サンプルアプリケーションはサブディレクトリに独立して格納される。

**開発ワークフロー（Spec 駆動開発）:**

```
Requirements（要件定義）→ Design（設計）→ Tasks（タスク分解）→ Implementation（実装）
```

各フェーズでヒューマンレビューを挟む 3 フェーズ承認ワークフローを採用。Steering（`.kiro/steering/`）でプロジェクト全体のコンテキストを管理し、Specs（`.kiro/specs/`）で個別機能の仕様を管理する。

## 参考文献

- [Claude Code 公式ドキュメント](https://code.claude.com/docs/ja/quickstart)
- [Zenn Claude Code 完全ガイド](https://zenn.dev/heku/books/claude-code-guide)
- [Claude Code Skills サンプル](https://github.com/anthropics/skills)
- [Claude Code サブエージェント](https://code.claude.com/docs/ja/sub-agents)
- [cc-sdd で仕様駆動開発を試してみた](https://zenn.dev/canly/articles/c77bf9f7a67582)
