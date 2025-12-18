# Project Structure

## Organization Philosophy

ルート直下に設定・ドキュメント、サンプルアプリは独立したサブディレクトリで管理。学習リポジトリとして、各サンプルが自己完結する構成。

## Directory Patterns

### ルート（設定・ドキュメント）
**Location**: `/`
**Purpose**: Claude Code設定、Spec駆動開発設定、プロジェクト説明
**Contents**: CLAUDE.md, README.md, AGENTS.md

### サンプルアプリケーション
**Location**: `/sample-*/`
**Purpose**: 各技術スタックの実践サンプル
**Example**: `sample-htmx-todo-app/` - htmx + Express.jsのTodoアプリ

### Spec駆動開発設定
**Location**: `.kiro/`
**Purpose**: cc-sddによるSpec駆動開発のワークフロー管理
**Subdirs**: `steering/`（プロジェクトメモリ）、`specs/`（仕様書）、`settings/`（設定）

## Naming Conventions

- **ディレクトリ**: kebab-case（例: `sample-htmx-todo-app`）
- **ファイル**: 用途に応じた命名（設定はALL_CAPS.md、コードはkebab-case）
- **API**: RESTful（`/api/todos`、`/api/todos/:id`）

## Import Organization

```javascript
// Node.js built-ins first
const express = require('express');
const fs = require('fs');
const path = require('path');

// Application code
const app = express();
```

## Code Organization Principles

- **サンプル自己完結**: 各sample-*は独立して動作可能
- **設定集中**: プロジェクト全体の設定はルート直下
- **シンプル優先**: 学習用途のため過度な抽象化を避ける

---
_created_at: 2024-12-18_
