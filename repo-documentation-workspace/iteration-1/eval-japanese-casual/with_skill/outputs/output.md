# claude-code-sample

Claude Code の使い方と、Kiro 風 Spec 駆動開発（cc-sdd）を実際に体験しながら学ぶためのサンプルリポジトリ。AI 支援開発のワークフロー全体を、動くコードと設定ファイル一式で提供している。

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| 言語 | JavaScript (Node.js) / TypeScript |
| フレームワーク | Express.js, Next.js（Mini App） |
| フロントエンド | htmx（CDN経由）, Tailwind CSS |
| データ管理 | JSON ファイルベース（DB不要） |
| AI ツール | Claude Code, Codex, CodeRabbit |
| MCP サーバー | Context7, DeepWiki, Sequential Thinking, Chrome DevTools, Draw.io, Serena |
| Spec 駆動開発 | cc-sdd（Kiro 風ワークフロー） |

## ディレクトリ構成

```
claude-code-sample/
├── .claude/                    # Claude Code の設定
│   ├── commands/kiro/          # Kiro 風スラッシュコマンド（11種）
│   ├── skills/                 # Claude Code Skills（26種）
│   ├── agents/                 # サブエージェント定義
│   ├── rules/                  # プロジェクトルール
│   └── .mcp.json               # MCP サーバー設定
├── .kiro/                      # Spec 駆動開発の設定
│   ├── steering/               # プロジェクトメモリ（product/tech/structure）
│   ├── specs/                  # 機能仕様書の格納先
│   └── settings/               # テンプレート・ルール
├── .github/skills/             # GitHub 連携用 Skills
├── sample-htmx-todo-app/       # サンプル: htmx + Express.js の Todo アプリ
├── first-world-mini-app/       # サンプル: Next.js の World Mini App
├── aws-cdk-architect-workspace/  # Skill 評価用ワークスペース
├── aws-news-collector-workspace/ # Skill 評価用ワークスペース
├── docs/                       # ドキュメント（見積書サンプル等）
├── prompts/                    # プロンプトテンプレート
├── CLAUDE.md                   # Claude Code 用プロジェクト指示
├── AGENTS.md                   # AI 駆動開発の共通ガイドライン
├── .coderabbit.yaml            # CodeRabbit レビュー設定
└── README.md                   # プロジェクト概要
```

## 機能一覧

### Claude Code 学習
- **3つの動作モード**: Ask before edits（確認モード）、Edit automatically（自動編集）、Plan mode（計画モード）
- **MCP 連携**: 6つの MCP サーバーとの統合設定済み
- **サブエージェント**: `/agents` コマンドで専門 AI エージェントを作成可能

### Spec 駆動開発（cc-sdd）
- **3フェーズ承認ワークフロー**: Requirements → Design → Tasks → Implementation
- **11のスラッシュコマンド**: `/kiro:spec-init`, `/kiro:spec-requirements`, `/kiro:spec-design`, `/kiro:spec-tasks`, `/kiro:spec-impl`, `/kiro:spec-status` など
- **Steering 機能**: `product.md`, `tech.md`, `structure.md` でプロジェクトコンテキストを管理

### Claude Code Skills（26種）
- **開発系**: AWS CDK Architect, DeFi Development, Vercel React Best Practices, Frontend Design
- **ブロックチェーン系**: Arc Blockchain, Circle Dev, ENS Dev, LI.FI Dev, Uniswap Dev
- **ドキュメント系**: Repo Documentation, Technical Writing, Tech Blog Quality Review
- **プレゼン系**: Marp Slides, Marp Presen Review, Presen Coach
- **その他**: Self-Improving Agent, Skill Creator, Hackathon Strategist, Cross-Industry Researcher, Estimate Creator, Intentional Design Guard

### サンプルアプリケーション
- **htmx Todo App**: Express.js + htmx によるサーバーサイドレンダリングの Todo アプリ（CRUD 完備）
- **World Mini App**: Next.js + TypeScript の Mini App サンプル

## セットアップ

### 前提条件
- Node.js（npm 付属）
- Claude Code CLI

### インストールと起動

```bash
# リポジトリのクローン
git clone <repository-url>
cd claude-code-sample

# MCP 設定付きで Claude Code を起動
claude --mcp-config=./.claude/.mcp.json

# cc-sdd（Spec 駆動開発）のセットアップ
npx cc-sdd@latest --lang ja

# Vercel React Best Practice Skill の追加
npx add-skill vercel-labs/agent-skills
```

### htmx Todo App の起動

```bash
cd sample-htmx-todo-app
npm install
npm run dev    # または npm start
# http://localhost:3000 でアクセス
```

### World Mini App の起動

```bash
cd first-world-mini-app
pnpm install
# .env.local.example を参考に .env.local を作成
pnpm dev
```

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `claude --mcp-config=./.claude/.mcp.json` | MCP サーバー付きで Claude Code を起動 |
| `npx cc-sdd@latest --lang ja` | Spec 駆動開発のコマンド一式をセットアップ |
| `/kiro:spec-init "説明"` | 新しい機能仕様を初期化 |
| `/kiro:spec-status {feature}` | 仕様の進捗を確認 |
| `/kiro:steering` | Steering ドキュメントを読み込み |
| `/agents` | サブエージェントを作成 |

## アーキテクチャ概要

このリポジトリは**学習用モノレポ**として構成されている。ルート直下に AI ツールの設定ファイル群（Claude Code / Codex / CodeRabbit）と Spec 駆動開発の仕組みを配置し、`sample-*` や `first-world-mini-app` といった自己完結型のサンプルアプリを個別ディレクトリで管理している。

開発ワークフローの中心は cc-sdd による Spec 駆動開発で、要件定義 → 設計 → タスク分解 → 実装の各フェーズを人間のレビューを挟みながら進める。26 種の Claude Code Skills が専門知識（AWS、ブロックチェーン、プレゼン作成など）を提供し、サブエージェントとの併用で複雑なタスクにも対応できる構成になっている。
