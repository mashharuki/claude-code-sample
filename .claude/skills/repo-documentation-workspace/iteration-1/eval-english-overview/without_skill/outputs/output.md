# claude-code-sample Repository Overview

## What This Repository Is

This is a **learning repository for Claude Code** -- Anthropic's AI-powered CLI development tool. It serves as a hands-on playground for developers to understand how to work with Claude Code, including its three interaction modes, MCP (Model Context Protocol) server integration, sub-agents, skills, and a Kiro-style Spec-Driven Development (SDD) workflow called **cc-sdd**.

The repository is written primarily in Japanese with English code. It is not a single application but rather a **collection of sample projects, configuration templates, and AI-agent tooling** organized under one roof.

## Repository Structure

```
claude-code-sample/
├── CLAUDE.md                  # Claude Code project instructions (cc-sdd workflow)
├── AGENTS.md                  # Shared AI development guidelines
├── README.md                  # Project overview (Japanese)
├── .claude/                   # Claude Code configuration
│   ├── .mcp.json              # MCP server definitions (context7, deepwiki, etc.)
│   ├── settings.json          # Claude Code settings
│   ├── commands/kiro/         # Slash commands for Kiro-style SDD workflow
│   ├── agents/                # Sub-agent definitions (e.g., apple-style-ui-designer)
│   ├── skills/                # 27+ skill modules (AWS CDK, frontend design, etc.)
│   └── rules/                 # Project-level rules for Claude Code behavior
├── .kiro/                     # Spec-Driven Development configuration
│   ├── steering/              # Project memory (product.md, tech.md, structure.md)
│   ├── specs/                 # Feature specifications (currently empty)
│   └── settings/              # SDD settings
├── sample-htmx-todo-app/      # Sample app: htmx + Express.js Todo application
├── first-world-mini-app/      # Sample app: World Chain MiniApp (Next.js + MiniKit)
├── aws-cdk-architect-workspace/  # Workspace for AWS CDK architecture tasks
├── aws-news-collector-workspace/ # Workspace for AWS news collection tasks
├── docs/                      # Documentation and templates
└── prompts/                   # Prompt templates for Claude Code
```

## Sample Applications

### 1. htmx Todo App (`sample-htmx-todo-app/`)

A simple Todo application demonstrating server-side rendering with htmx.

- **Tech stack**: Node.js, Express.js, htmx (via CDN)
- **Data storage**: Local JSON file (`todos.json`) -- no database required
- **Features**: Create, read, update (toggle completion), and delete tasks
- **Architecture**: Server returns HTML fragments; htmx handles DOM swaps without any custom JavaScript

**How to run:**

```bash
cd sample-htmx-todo-app
npm install
npm start        # or: npm run dev
# Open http://localhost:3000
```

### 2. World Chain MiniApp (`first-world-mini-app/`)

A tutorial app for building World Chain MiniApps using MiniKit SDK.

- **Tech stack**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, @worldcoin/minikit-js
- **Features**: World ID verification, WLD/USDC payments, wallet authentication (SIWE)
- **Requires**: A Worldcoin Developer Portal account and environment variables

**How to run:**

```bash
cd first-world-mini-app
cp .env.local.example .env.local
# Edit .env.local with your Worldcoin Developer Portal credentials
pnpm install
pnpm dev
# Open http://localhost:3000
```

## Claude Code Configuration

### MCP Servers (`.claude/.mcp.json`)

The repository comes pre-configured with several MCP servers:

| Server | Purpose |
|--------|---------|
| context7 | Up-to-date library documentation |
| deepwiki | Deep knowledge wiki |
| sequential-thinking | Step-by-step reasoning |
| chrome-devtools | Browser debugging |
| drawio | Diagram creation |
| serena | Code intelligence |

To launch Claude Code with MCP support:

```bash
claude --mcp-config=./.claude/.mcp.json
```

### Spec-Driven Development (cc-sdd)

The repository includes a full set of slash commands (under `.claude/commands/kiro/`) that replicate the Kiro IDE's spec-driven development workflow inside Claude Code. The workflow follows three phases:

1. **Specification**: Define requirements, design, and tasks
2. **Implementation**: Execute tasks against the spec
3. **Validation**: Verify implementation matches the spec

To install cc-sdd in a new project:

```bash
npx cc-sdd@latest --lang ja
```

### Skills

The repository contains 27+ skill modules under `.claude/skills/`, covering areas such as:

- AWS CDK architecture
- Frontend design and Vercel/React best practices
- Technical writing and blog review
- Blockchain development (DeFi, ENS, Uniswap, World MiniApp)
- Presentation creation and coaching (Marp)
- Hackathon strategy

### Sub-Agents

Sub-agent definitions live in `.claude/agents/`. Currently includes an Apple-style UI designer agent. New agents can be created using the `/agents` command.

## Prerequisites

- **Node.js** (for the htmx Todo app)
- **pnpm** (for the World Chain MiniApp)
- **Claude Code CLI** (to use the AI-agent features, MCP servers, and slash commands)

## Quick Start

1. Clone the repository
2. To try the simplest sample app:
   ```bash
   cd sample-htmx-todo-app
   npm install
   npm start
   ```
3. To use Claude Code with MCP servers:
   ```bash
   claude --mcp-config=./.claude/.mcp.json
   ```
4. To explore the spec-driven development workflow, use the `/kiro:spec-init` slash command inside Claude Code.
