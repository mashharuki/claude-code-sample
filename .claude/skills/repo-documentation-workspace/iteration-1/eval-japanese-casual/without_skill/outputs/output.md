# このリポジトリについて

## ざっくり言うと

**Claude Code（Anthropic公式のAI開発CLI）の使い方を学ぶためのサンプル集**です。Claude Codeの基本操作から、Kiro風の「仕様駆動開発（Spec-Driven Development）」まで、実際に手を動かしながら学べるようになっています。

## 何が入ってるの？

### サンプルアプリ

| ディレクトリ | 内容 | 技術スタック |
|---|---|---|
| `sample-htmx-todo-app/` | htmxで作ったシンプルなTodoアプリ | Express.js + htmx + JSONファイル保存 |
| `first-world-mini-app/` | World（Worldcoin）のミニアプリ | Next.js + React 19 + MiniKit + Tailwind CSS v4 |
| `aws-news-collector-workspace/` | AWSニュース収集ツール（ワークスペース） | CDKベース（詳細は中のドキュメント参照） |
| `aws-cdk-architect-workspace/` | AWS CDK設計ワークスペース | CDKベース |

### Claude Code の設定・拡張まわり

- **`.claude/commands/kiro/`** - Kiro風Spec駆動開発のスラッシュコマンド一式（`/kiro:spec-init`、`/kiro:spec-requirements` など）
- **`.claude/agents/`** - サブエージェント定義（Apple風UIデザイナーなど）
- **`.claude/skills/`** - 多数のスキル（AWS CDK設計、技術ブログレビュー、プレゼン作成、DeFi開発、フロントエンドデザインなど 25個以上）
- **`.claude/rules/`** - プロジェクトルール（スキルとサブエージェントの積極活用ルールなど）
- **`.kiro/steering/`** - プロジェクト全体のコンテキスト（プロダクト概要、技術スタック、ディレクトリ構成）

### ドキュメント・プロンプト

- **`prompts/create.prompt.md`** - Todoアプリ作成用のプロンプトテンプレート
- **`docs/`** - 見積書サンプルなどのドキュメント
- **`CLAUDE.md`** - Claude Code向けのプロジェクト指示書（AI-DLCワークフロー定義）
- **`AGENTS.md`** - 開発全体のガイドライン（コード品質、テスト、セキュリティなど）

## 使い方

### 1. Claude Codeの基本を試す

Claude Codeには3つのモードがあります：

- **Ask before edits** - 編集前に確認してくれる（デフォルト、安全）
- **Edit automatically** - ファイル編集を自動でやってくれる
- **Plan mode** - まず実装プランを立ててから進める

### 2. MCP設定付きで起動する

```bash
claude --mcp-config=./.claude/.mcp.json
```

### 3. サンプルアプリを動かす（htmx Todoの場合）

```bash
cd sample-htmx-todo-app
npm install
npm run dev
# ブラウザで http://localhost:3000 にアクセス
```

### 4. Kiro風Spec駆動開発を体験する

まずcc-sddをセットアップ：

```bash
npx cc-sdd@latest --lang ja
```

そのあとは以下の流れで進めます：

1. **仕様の初期化**: `/kiro:spec-init "機能の説明"`
2. **要件定義**: `/kiro:spec-requirements {feature}`
3. **設計**: `/kiro:spec-design {feature}`
4. **タスク分解**: `/kiro:spec-tasks {feature}`
5. **実装**: `/kiro:spec-impl {feature}`

各フェーズで人間のレビューを挟むのが基本です。`-y`オプションで承認をスキップすることもできます。

### 5. サブエージェントを作る

```bash
/agents
```

### 6. スキルを追加する（例：Vercel React Best Practice）

```bash
npx add-skill vercel-labs/agent-skills
```

## このリポの特徴

- **日本語ファースト**: ドキュメントもAI応答も基本的に日本語
- **実践的**: 実際に動くアプリで学べる
- **AI開発ワークフロー全体をカバー**: ステアリング（プロジェクトコンテキスト管理）→ 仕様策定 → 実装 → 検証の一連の流れが体験できる
- **拡張性が高い**: スキルやサブエージェントを自由に追加・カスタマイズできる構成

## 参考リンク

- [Claude Code 公式ドキュメント](https://code.claude.com/docs/ja/quickstart)
- [Zenn Claude Code 完全ガイド](https://zenn.dev/heku/books/claude-code-guide)
- [Claude Code Skills サンプル](https://github.com/anthropics/skills)
