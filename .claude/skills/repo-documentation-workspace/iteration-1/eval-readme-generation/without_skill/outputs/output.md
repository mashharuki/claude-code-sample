# claude-code-sample

Claude Code の使い方と AI 駆動開発（AI-DLC）を学ぶためのサンプルリポジトリです。Kiro 風の Spec 駆動開発（cc-sdd）や、Claude Code Skills・Sub Agents の活用パターンを実際に体験できます。

## 特徴

- **Claude Code の 3 つのモード**を実践的に学べる
- **Spec 駆動開発（SDD）** によるワークフロー管理を体験できる
- **26 種類の Claude Code Skills** を収録（AWS CDK、Web3、プレゼン、技術ブログなど多岐にわたる）
- 複数のサンプルアプリケーションで手を動かしながら学べる

## Claude Code の 3 つのモード

| モード | 説明 |
|--------|------|
| Ask before edits | 編集前確認モード（デフォルト） |
| Edit automatically | ファイル編集を自動承認するモード |
| Plan mode | 実装プランを先に作成するモード |

## プロジェクト構成

```
claude-code-sample/
├── CLAUDE.md                    # Claude Code / cc-sdd 設定
├── AGENTS.md                    # AI 駆動開発の共通ガイドライン
├── README.md                    # プロジェクト説明
├── .claude/
│   ├── agents/                  # サブエージェント定義
│   ├── commands/kiro/           # cc-sdd スラッシュコマンド一式
│   ├── rules/                   # プロジェクトルール
│   └── skills/                  # Claude Code Skills（26種類）
├── .kiro/
│   ├── steering/                # プロジェクトメモリ（product / tech / structure）
│   ├── specs/                   # 仕様書
│   └── settings/                # cc-sdd 設定
├── sample-htmx-todo-app/        # htmx + Express.js の Todo アプリ
├── first-world-mini-app/        # World Chain MiniApp（Next.js + MiniKit SDK）
├── aws-cdk-architect-workspace/ # AWS CDK スキル評価用ワークスペース
├── aws-news-collector-workspace/# AWS ニュース収集スキル評価用ワークスペース
├── docs/                        # ドキュメント・見積書テンプレート等
└── prompts/                     # プロンプトテンプレート
```

## サンプルアプリケーション

### sample-htmx-todo-app

htmx と Express.js で構築されたシンプルな Todo アプリ。ページ再読み込みなしでタスクの追加・完了・削除が可能です。

- **技術スタック**: Node.js / Express.js / htmx / CSS
- **データ永続化**: JSON ファイル
- **起動方法**:

```bash
cd sample-htmx-todo-app
npm install
npm run dev
# http://localhost:3000 でアクセス
```

### first-world-mini-app

World Chain MiniApp チュートリアルアプリ。MiniKit SDK の主要機能（World ID 検証、トークン決済、ウォレット認証）を学べます。

- **技術スタック**: Next.js 15 / React 19 / TypeScript / Tailwind CSS v4 / MiniKit SDK
- **起動方法**:

```bash
cd first-world-mini-app
cp .env.local.example .env.local
# .env.local に Developer Portal の値を設定
pnpm install
pnpm dev
```

## Spec 駆動開発（cc-sdd）

Kiro 風の仕様駆動開発を Claude Code 上で実現します。以下のコマンドで導入できます。

```bash
npx cc-sdd@latest --lang ja
```

### ワークフロー

1. **Phase 0（任意）**: Steering 設定 — プロジェクトのコンテキストを定義
2. **Phase 1（仕様策定）**: 要件定義 → 設計 → タスク分解
3. **Phase 2（実装）**: タスクに基づいた実装

各フェーズでは人間によるレビューを挟む 3 段階承認ワークフローを採用しています。

### 主要コマンド

| コマンド | 説明 |
|----------|------|
| `/kiro:spec-init "説明"` | 新しい仕様を初期化 |
| `/kiro:spec-requirements {feature}` | 要件定義を作成 |
| `/kiro:spec-design {feature}` | 設計書を作成 |
| `/kiro:spec-tasks {feature}` | タスクを分解 |
| `/kiro:spec-impl {feature}` | 実装を開始 |
| `/kiro:spec-status {feature}` | 進捗を確認 |

## Claude Code Skills

26 種類のスキルが `.claude/skills/` に収録されています。主なカテゴリ:

| カテゴリ | スキル例 |
|----------|----------|
| AWS / クラウド | aws-cdk-architect, aws-community-builder, aws-news-collector |
| Web3 / ブロックチェーン | arc-blockchain, circle-dev, defi-development, ens-dev, uniswap-dev, lifi-dev, world-miniapp |
| フロントエンド / デザイン | frontend-design, vercel-react-best-practices, web-design-guidelines, intentional-design-guard |
| ドキュメント / ライティング | technical-writing-skill, tech-blog-quality-review-skill, repo-documentation |
| プレゼンテーション | marp-slides, marp-presen-review, presen-coach |
| その他 | skill-creator, self-improving-agent, hackathon-strategist, cross-industry-researcher, estimate-creator |

### Skills の追加方法

```bash
npx add-skill vercel-labs/agent-skills
```

## MCP 設定

カスタム MCP サーバーを指定して Claude Code を起動できます。

```bash
claude --mcp-config=./.claude/.mcp.json
```

## サブエージェント

Claude Code 内で専門的な AI エージェントを作成・活用できます。

```bash
/agents
```

`.claude/agents/` 配下にサブエージェント定義ファイルを配置して利用します。

## 前提条件

- Node.js
- npm / pnpm
- Claude Code CLI

## 参考文献

- [Claude Code 公式ドキュメント](https://code.claude.com/docs/ja/quickstart)
- [Zenn Claude Code 完全ガイド](https://zenn.dev/heku/books/claude-code-guide)
- [git worktree との組み合わせ](https://code.claude.com/docs/ja/common-workflows#git%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%84%E3%83%AA%E3%83%BC%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6%E4%B8%A6%E5%88%97claude-code%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)
- [GitHub claude-code-action](https://github.com/anthropics/claude-code-action)
- [Claude Code Skills サンプル](https://github.com/anthropics/skills)
- [Claude Code のスキル機能完全ガイド](https://zenn.dev/ino_h/articles/2025-10-23-claude-code-skills-guide)
- [Claude Code の 3 つのモード完全ガイド](https://zenn.dev/yamato_snow/articles/ba861099a214b7)
- [cc-sdd で仕様駆動開発を試してみた](https://zenn.dev/canly/articles/c77bf9f7a67582)
- [Claude Code サブエージェント](https://code.claude.com/docs/ja/sub-agents)
- [Claude Code における Skills と SubAgents の使い分け](https://zenn.dev/nogu66/articles/claude-code-think-abount-skills-and-subagent)

## ライセンス

本リポジトリは学習・サンプル目的で公開されています。
