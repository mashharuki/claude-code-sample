# claude-code-sample

A learning repository for mastering Claude Code (Anthropic's AI-powered CLI) and Kiro-style Spec-Driven Development (cc-sdd). It provides sample applications, pre-configured AI tooling, and a full spec-driven workflow so developers can get hands-on experience with AI-assisted development.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Language | JavaScript / TypeScript (Node.js) |
| Frameworks | Express.js, Next.js 15, htmx |
| Frontend | React 19, Tailwind CSS 4, htmx (CDN) |
| AI Tooling | Claude Code, Kiro-style SDD (cc-sdd), Codex, GitHub Copilot |
| MCP Servers | Context7, DeepWiki, Sequential Thinking, Chrome DevTools, Draw.io, Serena |
| Code Review | CodeRabbit (auto-review, Japanese) |
| Data | JSON file-based persistence (no database) |

## Directory Structure

```
claude-code-sample/
├── .claude/                    # Claude Code configuration
│   ├── .mcp.json               # MCP server definitions (6 servers)
│   ├── settings.json           # Permissions, env vars, plugins
│   ├── agents/                 # Sub-agent definitions (e.g. apple-style-ui-designer)
│   ├── commands/kiro/          # Slash commands for spec-driven workflow
│   ├── rules/                  # Project-wide behavior rules
│   └── skills/                 # 26 Claude Code Skills (see below)
├── .kiro/                      # Spec-Driven Development config
│   ├── steering/               # Project memory (product.md, tech.md, structure.md)
│   ├── specs/                  # Feature specifications
│   └── settings/               # SDD templates
├── .codex/                     # OpenAI Codex agent config
├── .github/                    # GitHub Copilot config
├── sample-htmx-todo-app/       # Sample app: htmx + Express Todo
├── first-world-mini-app/       # Sample app: Worldcoin MiniKit + Next.js
├── aws-cdk-architect-workspace/# Skill eval workspace: AWS CDK
├── aws-news-collector-workspace/# Skill eval workspace: AWS news
├── docs/                       # Documentation (estimates, skill memos)
├── prompts/                    # Prompt templates
├── CLAUDE.md                   # Main Claude Code instructions
├── AGENTS.md                   # Development guidelines for AI agents
├── .coderabbit.yaml            # CodeRabbit review configuration
└── README.md                   # Project README (Japanese)
```

## Features

### AI Development Tooling
- **Claude Code 3-mode operation**: Ask-before-edits (safe default), Edit-automatically, and Plan mode
- **26 Claude Code Skills**: Covering AWS CDK architecture, frontend design, technical writing, blockchain/DeFi development, presentation coaching, repo documentation, and more
- **Sub-agents**: Specialized AI agents (e.g. Apple-style UI designer) for delegated tasks
- **MCP server integration**: 6 pre-configured Model Context Protocol servers for enhanced capabilities
- **Multi-AI support**: Configurations for Claude Code, OpenAI Codex, and GitHub Copilot

### Spec-Driven Development (cc-sdd)
- **Kiro-style workflow**: Requirements -> Design -> Tasks -> Implementation with human review gates
- **11 slash commands**: `/kiro:spec-init`, `/kiro:spec-requirements`, `/kiro:spec-design`, `/kiro:spec-tasks`, `/kiro:spec-impl`, `/kiro:spec-status`, `/kiro:validate-gap`, `/kiro:validate-design`, `/kiro:validate-impl`, `/kiro:steering`, `/kiro:steering-custom`
- **Steering files**: Persistent project context (product vision, tech stack, structure)

### Sample Applications
- **htmx Todo App**: Server-side rendered Todo app with Express.js + htmx (hypermedia-driven, minimal JS)
- **World Mini App**: Next.js 15 + React 19 + Worldcoin MiniKit integration (payment verification, sign-in, nonce API)

### Skill Evaluation Workspaces
- **AWS CDK Architect**: Benchmarks for serverless API, static site/SPA, and complex architecture generation (with/without skill comparison)
- **AWS News Collector**: Benchmarks for weekly summaries, focused Bedrock analysis, and blog idea generation

## Setup

### Prerequisites
- Node.js (recent LTS version)
- npm or pnpm
- Claude Code CLI (`claude` command)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd claude-code-sample

# Install cc-sdd (Kiro-style Spec-Driven Development commands)
npx cc-sdd@latest --lang ja

# (Optional) Add Vercel React Best Practices skill
npx add-skill vercel-labs/agent-skills
```

### Running Claude Code with MCP servers

```bash
claude --mcp-config=./.claude/.mcp.json
```

### Running the htmx Todo App

```bash
cd sample-htmx-todo-app
npm install
npm start        # or: npm run dev
# Open http://localhost:3000
```

### Running the World Mini App

```bash
cd first-world-mini-app
pnpm install
pnpm dev         # Next.js dev server
pnpm build       # Production build
pnpm lint        # ESLint
```

## Key Commands

| Command | Description |
|---------|-------------|
| `claude --mcp-config=./.claude/.mcp.json` | Launch Claude Code with all MCP servers |
| `npx cc-sdd@latest --lang ja` | Install Kiro-style SDD slash commands |
| `/kiro:spec-init "description"` | Initialize a new feature specification |
| `/kiro:spec-requirements {feature}` | Generate requirements document |
| `/kiro:spec-design {feature} [-y]` | Generate design document |
| `/kiro:spec-tasks {feature} [-y]` | Generate task breakdown |
| `/kiro:spec-impl {feature} [tasks]` | Implement tasks from spec |
| `/kiro:spec-status {feature}` | Check specification progress |
| `/agents` | Create/manage sub-agents |

## Architecture Overview

This repository is organized as a **learning monorepo** -- it is not a single application but a collection of configurations, sample apps, and skill evaluation workspaces unified by a shared AI development toolchain.

The core value lies in the `.claude/` and `.kiro/` directories, which together form a complete AI-assisted development environment:

1. **Steering files** (`.kiro/steering/`) provide persistent project context that AI agents load automatically.
2. **Specs** (`.kiro/specs/`) formalize the development process through a phased requirements-design-tasks-implementation workflow.
3. **Skills** (`.claude/skills/`) extend Claude Code with domain-specific expertise (26 skills covering areas from AWS architecture to presentation coaching).
4. **Sub-agents** (`.claude/agents/`) delegate specialized tasks to focused AI personas.
5. **MCP servers** (`.claude/.mcp.json`) connect Claude Code to external tools like documentation search, sequential reasoning, browser DevTools, and diagram generation.

The sample applications (`sample-htmx-todo-app/` and `first-world-mini-app/`) serve as concrete targets for practicing these AI-driven workflows, while the workspace directories contain evaluation benchmarks comparing skill-assisted vs. unassisted AI output.
