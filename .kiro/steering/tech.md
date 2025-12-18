# Technology Stack

## Architecture

サーバーサイドレンダリング + htmxによるハイパーメディア駆動アプローチ。SPAフレームワークを使用せず、HTMLをサーバーから直接返すシンプルなアーキテクチャ。

## Core Technologies

- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **Frontend**: htmx（HTML over the wire）
- **Runtime**: Node.js

## Key Libraries

- **Express.js**: HTTPサーバー・ルーティング
- **htmx**: 宣言的なAJAXインタラクション（CDN経由）

## Development Standards

### Code Quality
- XSS対策としてHTMLエスケープを必須
- CORS設定によるクロスオリジン対応
- RESTful APIパターンの採用

### Data Management
- JSONファイルベースのシンプルな永続化
- サーバーサイドでのHTML生成

## Development Environment

### Required Tools
- Node.js
- npm

### Common Commands
```bash
# Dev: npm run dev (または npm start)
# 起動後: http://localhost:3000
```

## Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| htmx採用 | JavaScript最小限でインタラクティブなUI実現 |
| JSONファイル永続化 | 学習用途のためDB不要のシンプル構成 |
| サーバーサイドHTML生成 | htmxのハイパーメディアパターンに準拠 |

---
_created_at: 2024-12-18_
