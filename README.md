# claude-code-sample
ClaudeCodeの使い方を学ぶためのリポジトリ

## 3つのモード

- Ask before edits: 編集前確認モード - デフォルトの安全モード
- Edit automatically: 自動編集モード - ファイル編集を自動承認するモード
- Plan mode: 実装プラン作成モード - 実装プランを先に作成するモード

## MCPの設定ファイルを指定して実行

```bash
claude --mcp-config=./.claude/.mcp.json
```

## サブエージェントの作り方

```bash
/agents
```

## cc-sdd(Kiro風Spec駆動開発)の始め方

```bash
npx cc-sdd@latest --lang ja
```

`.claude/commands/kiro`配下にKiroと同様の振る舞いをするためのスラッシュコマンド一式が作成される

## Vercel React Best PracticeのSKILL導入方法

このコマンドを実行するだけで Claude Code、Codex、GitHub Copilot用のSKILLが追加される

```bash
npx add-skill vercel-labs/agent-skills
```

## 参考文献
- [Claude Code 公式ドキュメント](https://code.claude.com/docs/ja/quickstart)
- [Zenn Claude Code 完全ガイド](https://zenn.dev/heku/books/claude-code-guide)
- [git worktreeとの組み合わせ](https://code.claude.com/docs/ja/common-workflows#git%E3%83%AF%E3%83%BC%E3%82%AF%E3%83%84%E3%83%AA%E3%83%BC%E3%82%92%E4%BD%BF%E7%94%A8%E3%81%97%E3%81%A6%E4%B8%A6%E5%88%97claude-code%E3%82%BB%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3%E3%82%92%E5%AE%9F%E8%A1%8C%E3%81%99%E3%82%8B)
- [GitHub claude-code-action](https://github.com/anthropics/claude-code-action)
- [Claude Code Skills サンプル](https://github.com/anthropics/skills)
- [Claude Code のスキル機能完全ガイド：モジュール型機能拡張で開発を効率化](https://zenn.dev/ino_h/articles/2025-10-23-claude-code-skills-guide)
- [Claude Codeの3つのモード完全ガイド｜初心者が知るべき使い分けと実践的ワークフロー](https://zenn.dev/yamato_snow/articles/ba861099a214b7)
- [cc-sddで仕様駆動開発を試してみた](https://zenn.dev/canly/articles/c77bf9f7a67582)
- [Claude Code サブエージェント](https://code.claude.com/docs/ja/sub-agents)
- [Claude CodeにおけるClaude SkillsとSubAgentsの使い分けと併用を理解する](https://zenn.dev/nogu66/articles/claude-code-think-abount-skills-and-subagent)
- [Claude Code 内で専門家を作成！新機能 Sub agents で用途専門AIを作って品質改善してみた](https://qiita.com/tomada/items/a6fba5876dbc9304ca5)