# ETH Global アイデア分析レポート：自然言語DeFi操作 AI Agent ウォレット

---

## 調査サマリー

### 直近の受賞トレンド（2024-2026 実績）

ETH Global Showcaseおよびリファレンスデータから読み取れる現在のメガトレンド：

**1. AI Agent × Web3（最多受賞カテゴリ）**
- 2025年〜2026年 ETHGlobal Cannes で圧倒的主流
- 「自律エージェントがオンチェーン操作を代行する」コンセプトが溢れている
- 代表作：`Orchestra`（"Talk to your crypto. AI agent for seamless swaps with Ledger security"）、`maki`（"AI agent for onchain DeFi. Keys locked in hardware"）、`Aiwal`（"Non-custodial Agentic Wallet"）、`ZENITH`（"AI agents find best DeFi yields across chains"）

**2. 信頼・検証レイヤー（新興トレンド）**
- Agent のオンチェーン信頼性・実行証明への注目が増加
- `veritas`（予測精度でランク付けされる信頼レイヤー）、`TrustAgent`（暗号学的レピュテーション）

**3. Agent Identity × Spending Policy**
- `AgentPass`（World ID + ENS + Ledger、支出ポリシー付きオンチェーン ID）が受賞
- エージェントに「何をどこまで許可するか」という制約設計が評価される

**4. インテント × クロスチェーン（2024 以来継続）**
- Uniswap v4 フック、Across Protocol、CCIP の活用が続く

---

## 類似受賞作との差別化分析

### 直接競合する類似プロジェクト

| プロジェクト | 概要 | 類似度 |
|---|---|---|
| **Orchestra** | 自然言語でスワップ・送金、Ledger連携 | ★★★★★（ほぼ同一コンセプト） |
| **maki** | オンチェーンDeFi AI Agent、ハードウェアキー管理 | ★★★★☆ |
| **Aiwal** | Non-custodial Agentic Wallet、会話型UI | ★★★★☆ |
| **Zuza** | Chat-first DeFi interface for EVM | ★★★☆☆ |
| **P.O.T.I.C.A.** | Personalized On-chain Trading Intelligence | ★★★☆☆ |
| **LeAgent** | リアルタイム戦略をエージェントで実行 | ★★★☆☆ |

### 現状のアイデアが持つ本質的問題

**「Orchestra」がすでにやっている**ことが最大のリスク。自然言語でスワップ・流動性提供を自動実行するという核心機能は、ETHGlobal Cannes 2026 で受賞済みのプロジェクトとほぼ同一です。このままでは「n番煎じ」と判定されます。

---

## スコアリング（現状アイデア）

### 評価軸と採点

| 軸 | 点数 | 評価コメント |
|---|---|---|
| **インパクト** | 4/5 | DeFiのUXハードルは世界的課題。市場規模は大きい |
| **技術革新性** | 2/5 | 自然言語 + DeFi自動化は2025年時点で既出。差別化が不明確 |
| **UX** | 3/5 | チャット型UIはデモ映えするが、類似品と見分けがつかない |
| **実現性** | 4/5 | Vercel AI SDK + wagmi + Uniswap SDK で36時間内に動くMVPは作れる |
| **賞金獲得可能性** | 2/5 | 現状の差別化なしでは、Orchestraと差がなくスポンサー賞は厳しい |

**合計: 15/25点**

---

## あと5点上げるための具体的改善案

### 改善方向性（3案）

---

### 案A：「Human-in-the-Loop 信頼設計」で差別化

**コンセプト**: 自然言語指示に加え、**Agent が実行前に「何をなぜするか」を説明し、ユーザーが承認するサーキットブレーカー付きの意図確認フロー**を実装する。`Hecate wallet`（"reviews, explains, and privately executes before you sign"）をさらに進め、**支出ポリシーをオンチェーンスマートコントラクトとして管理**する。

**差別化ポイント**:
- 「Agent が勝手にやる」→「Agent が提案し、人間が承認する」という透明性設計
- ERC-4337 + Session Key でポリシーをオンチェーン検証可能に
- デモの「Wow Moment」: 「1ETH以上のスワップは確認必須」ルールをスマコンで設定→Agent が自動実行しようとした瞬間に止まる画面

**狙えるスポンサー賞**:
- Privy / Dynamic（ウォレット UX）
- Uniswap（v4フック活用）
- World（World ID で「本物の人間が承認した」を証明）

---

### 案B：「クロスチェーン収益最適化 Agent」で垂直特化

**コンセプト**: 自然言語の汎用操作ではなく、「流動性提供のリターン最適化」という**1機能に絞り込む**。ユーザーが「ETHで年利最大化して」と言うだけで、Agent が複数チェーン（Base / Arbitrum / Polygon）の流動性プールを横断して最適配分を計算・実行する。

**差別化ポイント**:
- ZENITH（"AI agents find best DeFi yields across chains"）との違い：実行まで自動化、Chainlink Data Feeds でリアルタイム価格・利率を取得
- Uniswap v4 フックで「手数料収入の自動再投資」を実装 → 独自の技術的深さ
- デモの「Wow Moment」: 「年利最大化」と入力 → 3チェーンの最適アロケーション計算 → ガス込みのネット利回り表示 → ワンクリック実行

**狙えるスポンサー賞**:
- Chainlink（Data Feeds + CCIP で最重要スポンサー）
- Uniswap（v4フック深堀り）
- Base / Arbitrum（L2 ネイティブ展開）

---

### 案C：「オンチェーン実行証明 + ZK Agent」で技術革新

**コンセプト**: LLM が DeFi 操作を決定した「推論プロセス」を ZK Proof でコミット → Agent の意思決定が改ざんされていないことをオンチェーンで検証可能にする。「信頼できる AI Agent」の新しい定義を提案する。

**差別化ポイント**:
- veritas・TrustAgent との違い：予測精度のランク付けではなく、**実行ロジックそのものの証明**
- 「AI が勝手にやった」ではなく「AI が何を考えて実行したかがブロックチェーンで見える」という透明性
- デモの「Wow Moment」: スワップ後にオンチェーン TX に添付された ZK Proof をブロックチェーンエクスプローラーで確認できる

**狙えるスポンサー賞**:
- 複数プライバシー系スポンサー
- Chainlink（Automation + Proof検証）
- Best Overall（技術的インパクトが最大）

---

## 推奨ブラッシュアップ戦略

### 最優先推奨：案A + 案B の組み合わせ

36時間で動かせる現実性と差別化の両立を考えると：

**「支出ポリシー付きクロスチェーン収益最適化 Agent」**

> "自然言語で流動性提供の目標を指定するだけで、スマートコントラクト上のルールに従いながら複数チェーンで最適運用するAI Agentウォレット"

- Uniswap v4 フック + Chainlink CCIP の組み合わせで2社のスポンサー賞を同時に狙う
- ERC-4337 Session Key でポリシーをオンチェーン管理 → Privy/Dynamic 賞も狙える
- デモでは「年利12%以上のプールのみ」「1日の最大スワップ0.5ETH」ルールをAI Agentが守る様子を見せる

### 1文のピッチ

「DeFiの利回り最大化を自然言語で指示するだけで、スマートコントラクト上のルールに従い複数チェーンを横断して自動運用するAI Agentウォレット」

---

## 推奨技術スタック

```
フロントエンド: Next.js + wagmi/viem + RainbowKit
スマートコントラクト: Solidity + Foundry
  - ERC-4337 Session Key（支出ポリシー管理）
  - Uniswap v4 Hook（手数料再投資）
AI統合: Vercel AI SDK + Claude API（claude-sonnet-4-6）
クロスチェーン: Chainlink CCIP + Data Feeds
ウォレット: Privy（ソーシャルログイン対応）
デプロイ先: Base Sepolia + Arbitrum Sepolia（テストネット）
インデクサー: The Graph（ポジション管理クエリ）
```

---

## 36時間タイムライン（調整版）

```
0-4h   : アイデア最終確定 + Foundry環境構築 + 役割分担
4-10h  : ERC-4337 + Session Keyスマコン実装（支出ポリシーの核心）
10-16h : Uniswap v4フック + Chainlink Data Feeds統合
16-22h : フロントエンド（チャットUI + ポリシー設定画面）
22-28h : AI Agent ロジック実装（Vercel AI SDK + ツール定義）
28-32h : クロスチェーン（CCIP）統合 + バグ修正
32-34h : デモシナリオ確定 + ピッチ準備
34-36h : 最終テスト + ETHGlobal Showcase 提出
```

---

## 審査員・デモ戦略

**最初の30秒のスクリプト案**:
> 「DeFiで稼ぎたいのに、どのプールが良いかわからない。複数のチェーンを調べて操作するのが面倒で、結局何もしない——そんな人が世界中にいます。私たちのAI Agentウォレットは、『年利10%以上で運用して』と言うだけで、あなたが事前に設定したルールの範囲内で、複数チェーンを横断して自動的に最適化します。」

**デモのWow Moment**:
1. チャットで「ETH 1枚を年利最大化で運用して、1日0.5ETH以上は動かさないで」と入力
2. AI Agent が Base / Arbitrum / Polygon の利率をリアルタイム比較表示
3. スマートコントラクトのポリシーチェック画面 → 承認 → 自動実行
4. ブロックチェーンエクスプローラーで TX 確認

**数字を使ったフック**:
- 「$180B+ のDeFi TVLのうち、個人ユーザーが自分で操作できているのは5%未満」
- 「Chainlink Data Feedsで3チェーン×50プールを15秒でスキャン」

---

## まとめ：改善後スコア予測

| 軸 | 改善前 | 改善後（案A+B） | 改善ポイント |
|---|---|---|---|
| インパクト | 4/5 | 4/5 | 変わらず高い |
| 技術革新性 | 2/5 | 4/5 | v4フック+Session Key+CCIPの組み合わせが新しい |
| UX | 3/5 | 4/5 | ポリシー設定UIとデモシナリオが明確 |
| 実現性 | 4/5 | 3/5 | スコープ増でやや難しくなるが段階的MVP対応可能 |
| 賞金獲得可能性 | 2/5 | 4/5 | Uniswap・Chainlink・Privy・Baseの4社同時狙い |

**改善後合計: 19/25点（+4点向上）**

最後の1点を上げるには：World ID 統合（本物の人間がルールを設定した証明）を追加することで、5社目のスポンサー賞（World賞）も射程に入り20点到達できます。
