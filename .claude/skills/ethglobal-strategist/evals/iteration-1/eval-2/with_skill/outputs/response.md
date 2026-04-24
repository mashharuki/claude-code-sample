# ETH Global 2024-2025 トレンド分析・戦略レポート

> **調査対象イベント**: ETHGlobal Bangkok 2024（2024年11月）、ETHGlobal San Francisco 2024（2024年10月）、ETHGlobal New York 2025（2025年8月）、ETHGlobal Cannes 2026（2026年4月）  
> **データソース**: ethglobal.com/showcase（リアルタイム取得）、各イベントページ、winning-patterns.md

---

## 調査サマリー

### 直近の受賞トレンド（2024-2025 実績から読み解く）

**ETHGlobal Showcase（2024-2025）で確認された支配的テーマ：**

| テーマ | 出現頻度 | 代表プロジェクト例 |
|---|---|---|
| AI Agent × Web3 | 極めて高い | maki（DeFi自律エージェント）、Orchestra（自然言語スワップ）、Meridian（企業財務エージェント）|
| プライバシー × DeFi | 高い | Veil（ZK信用スコア）、CloakPay（匿名ウォレット）、SENTINEL（オンチェーンAMLスコアリング）|
| Agentic Commerce / Agent経済 | 急上昇 | A2A（検証済みAIマーケットプレイス）、AgentPass（エージェントID）、Agent Pay（分散型APIデータベース）|
| マイクロペイメント | 急上昇 | AudiThor（リアルタイム監査マイクロペイメント）、Onda（音楽ストリーミング直接払い）、HumanAttentionToken（USDC注意払い）|
| TEE / 検証可能計算 | 上昇中 | MultisigPE（TEEリスクスコアリング）、VANTA（検証可能自律公証）|
| クロスチェーン / 相互運用性 | 安定継続 | クロスチェーンブリッジ系複数 |
| コンシューマー向けDeFi UX | 安定継続 | Zuza（チャットファーストDeFi）、UniRange（LP自動リバランス）|

**ETHGlobal Bangkok 2024のスポンサー陣（各$20,000）**: Bitkub、Kinto、LayerZero、Pyth Network、World、Arbitrum、Uniswap Foundation、Chainlink、Scroll など68+プロトコル。

**ETHGlobal SF 2024のスポンサー陣**: LayerZero、SKALE、Uniswap Foundation、Polygon、Story、Sign Protocol、Circle、Coinbase Developer Platform など37+プロトコル。

**ETHGlobal NYC 2025**: Chainlink $10,000、Coinbase Developer Platform $20,000。

---

## 今すぐ避けるべきレッドオーシャン・カテゴリ

### 1. 汎用 NFT マーケットプレイス（最大の地雷）
**理由**: OpenSeaクローン・NFTオークションサイトは2022年のトレンド。2024-2025の審査員はほぼスコープ外で見ている。差別化が不可能な領域。「NFT × ゲーム」や「NFT × 実物資産（RWA）」への昇華が必要だが、それでも中途半端では落ちる。

### 2. 汎用 DAOツール / ガバナンス UI
**理由**: Snapshot、Tally 等の既存ツールが成熟しきっており、「もう一つのDAOダッシュボード」は審査員に刺さらない。受賞実績がほぼゼロ（2022年以降）。

### 3. DEX / AMM クローン（Uniswap fork系）
**理由**: ハッカソン最大の失敗パターン。Uniswap v4 Hookを使った**深い**カスタマイズでなければ即落選。表面的な「新しいDEX」は評価対象外。

### 4. 単体 DeFi ウォレット UI
**理由**: Rainbow、MetaMask、Privy、Dynamic 等が既に高品質 UX を提供。「新しいウォレット」を作っても審査員には刺さらない。AAやPaymasterと組み合わせた**具体的なUX課題の解決**として設計する必要がある。

### 5. 「将来的には〜もできる」型の技術デモ
**理由**: 動くMVPがないプロジェクトは原則受賞できない。36時間内で完結するスコープ設計が最重要。

### 6. 純粋な「AI チャットボット + Web3 接続」（2024年にオーバーサチュレート）
**理由**: 「AIに話しかけてスワップする」だけのプロジェクトはすでに2024年に飽和した。AI Agentが**自律的に**オンチェーン操作を行い、かつ**Wow Factorのある結果**を生み出す設計でなければ差別化できない。

---

## これから狙いやすいニッチ（2025-2026 ブルーオーシャン）

### ニッチ 1: TEE（Trusted Execution Environment）× AI Agent 検証

**なぜ今か**: ETHGlobal Cannes 2026ではTEE活用プロジェクトが複数受賞。AIエージェントの実行が「本当に正直か」を検証する問題は未解決で、TEE（Intel SGX、AWS Nitro Enclaves）がその解決手段として急浮上している。

**具体的なニッチ**:
- TEEで保護されたAIエージェントのウォレット（モデルが秘密鍵に触れない設計）
- TEE内での推論結果をオンチェーンで証明するプロトコル
- 複数エージェントのマルチシグ意思決定（MultisigPEの発展版）

### ニッチ 2: Agent-to-Agent Commerce インフラ（ERC-8004/8183 周辺）

**なぜ今か**: ETHGlobal Cannes 2026で「A2A（検証済みAIマーケットプレイス）」「AgentPass（エージェントID）」「Jurex Network（AI経済の紛争解決）」が受賞。AI Agent間の信頼・決済・評価の仕組みが急速に重要性を増している。

**具体的なニッチ**:
- AIエージェントのオンチェーン・レピュテーションシステム（ERC-721ベースID）
- Agent間のx402マイクロペイメント + USDC決済ゲートウェイ
- エージェント版エスクロー（ERC-8183 Agentic Commerce準拠）

### ニッチ 3: プライバシー保護信用スコア / 金融包摂 DeFi

**なぜ今か**: Veil（「ZKで実際の銀行データから信用スコア生成 → 担保不足ローン」）がETHGlobal Cannes 2026で受賞。既存のDeFiは過剰担保が前提で、実世界の信用情報を活用したアンダーコラタライズド融資は未開拓。

**具体的なニッチ**:
- ZK Proofで収入・取引履歴を証明（元データ非公開）→ 信用スコアオンチェーン化
- 移民・アンバンクト向けの無担保マイクロファイナンス
- RWA（請求書・給与）を担保にしたオンチェーン即時融資

### ニッチ 4: コンプライアンス × DeFi（機関投資家向け）

**なぜ今か**: OpenCompliance、SENTINEL（AMLスコアリング）が受賞。DeFiの機関参入障壁（AML/KYC/コンプライアンス）に対するインフラ層はほぼ未整備で、賞金スポンサーからも注目度が高い。

**具体的なニッチ**:
- 分散型AMLスコアリング（TEE + CRE集計 + オンチェーン証明）
- ZK KYCで匿名性を保ちながらコンプライアンス証明
- オンチェーン取引の「説明可能なリスクスコア」生成

### ニッチ 5: クリエイター・アテンション経済 × マイクロペイメント

**なぜ今か**: Onda（「1セント/再生でアーティストに直接支払い」）、HumanAttentionToken（「注意力にUSDCで報酬」）が受賞。Spotifyや広告プラットフォームによる中抜き問題に対し、ブロックチェーンによる直接マイクロペイメントが実用段階に入った。

**具体的なニッチ**:
- x402 / HTTP 402を使ったコンテンツ単位の従量課金
- 音楽・動画・記事のオンチェーン使用料自動分配
- ライブ配信中のリアルタイムUSDCチップ（スマートコントラクトエスクロー）

---

## Chainlink スポンサー賞 攻略戦略

### Chainlink の受賞軸（2024-2025 実績）

Chainlink はほぼ全ETH Globalイベントで$7,000〜$20,000の賞金を提供。Bangkok 2024では$20,000、SF 2024・NYC 2025では$10,000の実績。

**Chainlinkが評価するポイント（優先度順）**:

1. **CCIP（Cross-Chain Interoperability Protocol）の深い活用**
   - 表面的な「CCIP経由で送金する」ではなく、クロスチェーンの状態同期・メッセージングを核心ロジックに組み込む
   - 例: マルチチェーン上のAI Agentが異なるチェーンの流動性をCCIPで統合管理

2. **Data Feeds / Price Feeds の本番さながらの活用**
   - 価格フィードを保険・予測市場・RWA評価に組み込む
   - Chainlink Functions（外部API → オンチェーン）と組み合わせて「リアルワールドデータ駆動型」DeFiを構築

3. **Automation（Keepers）× AI Agent の組み合わせ**
   - AIの判断結果をChainlink Automationでオンチェーン実行
   - 「AIが判断 → Keeperが自動執行 → 結果がオンチェーン記録」というフルループ

4. **Chainlink Functions × TEE の新結合**
   - Functions経由でTEE内の計算結果をオンチェーンに持ち込む
   - 現在ほぼ実装例がなく、先行者利益が大きい

### Chainlink 受賞のための具体的アプローチ

**推奨アイデア: 「AI Agentのリスクスコア × Chainlink Functions × DeFi自動運用」**

```
ユーザー資産 → AI Agentが外部データ(Chainlink Functions)を参照して
リスクスコア算出 → Chainlink Automation が閾値トリガーで自動リバランス
→ 結果をChainlink Data Feedsで評価 → 全て検証可能にオンチェーン記録
```

**Prize Booth戦略**:
- イベント開始直後にChainlinkエンジニアに声をかけ、「CCIPのこの部分を使いたい」と具体的に相談
- Chainlink Labsのドキュメントで他チームが見落としている機能（Functions、VRF v2.5など）を事前把握
- 申請時に「CCIP / Functions / Automation のどれを、どのコントラクトで使ったか」を明示的に記述

---

## Base（Coinbase Developer Platform）スポンサー賞 攻略戦略

### Base の受賞軸（2024-2025 実績）

Coinbase Developer Platform（Base）はETHGlobal NYC 2025で$20,000と最上位スポンサーとして参加。

**Baseが評価するポイント（優先度順）**:

1. **Smart Wallet（ERC-4337 Account Abstraction）の本格活用**
   - Coinbase Smart Walletを核心部分に据える
   - Paymasterでガスレスを実現し「Web3を意識させないUX」を達成
   - Passkey認証（生体認証ログイン）との組み合わせ

2. **Base L2 ネイティブ機能の深い活用**
   - Base上のUSDC（Circle連携）を使った決済・送金
   - OnchainKitを使ったシームレスなフロントエンド統合
   - Basename（Base上のENS相当）の活用

3. **コンシューマー向けUXの革新**
   - 「クリプトを知らないユーザーが使える」プロダクト
   - AgentKit（Coinbase AgentKit）を使ったAI Agent構築

4. **リアルワールドユースケース × Base**
   - オフライン決済（NFC × Base）
   - コンテンツ課金・サブスクリプション on Base
   - マイクロペイメント（x402 on Base）

### Base 受賞のための具体的アプローチ

**推奨アイデア: 「AgentKit × Smart Wallet × x402 マイクロペイメント」**

```
AgentKit（Coinbase）を使ったAI Agentが
→ Smart Wallet（ERC-4337）で自律的にウォレットを保有・管理
→ x402 / HTTP 402でAPIリソースにマイクロペイメント
→ USDC on Baseで決済
→ Paymasterがガスを肩代わり（ユーザーはガスを意識しない）
```

**PaintGlobal（NFC × Base × NFT投票）型のアイデアも有効**:
- 物理デバイス（NFC、QRコード）とBase上のオンチェーン投票・決済を組み合わせる
- デモで「スマホかざすだけ」という直感的なWow Momentが生まれる

**Prize Booth戦略**:
- OnchainKitとAgentKitのドキュメントを熟読し、最新機能（2025年追加分）を使う
- 「Smart Walletを使ったことで、ユーザーがウォレットを意識しなかった体験」をデモの中核に
- フロントエンドにOnchainKit UIコンポーネントを採用し、Coinbaseロゴ入りの統合感を出す

---

## Chainlink + Base のダブル受賞を狙うアイデア

**アイデア: 「AI 財務エージェント for 個人事業主 — Chainlink Automation × Base Smart Wallet」**

- **概要**: 個人事業主の請求書や収支をAIが解析し、Chainlink Functionsで外部会計データを取得、最適な時期にUSDCをBase上でリバランスし、Smart Walletで顧客への送金まで自動実行
- **Chainlink賞の根拠**: Functions（会計API連携）＋ Automation（定期リバランス実行）
- **Base賞の根拠**: Smart Wallet＋ Paymaster（ガスレス）＋ USDC on Base
- **Wow Moment**: 「請求書をアップロードしたら、エージェントが全部やってくれた」デモ

---

## 推奨アクション（次の3ステップ）

### Step 1: イベント前（1週間前まで）
- Chainlink Functions・CCIP・Automationのドキュメントを読み込み、**他チームが使っていない新機能**を把握する
- Base OnchainKit・AgentKit・Smart Walletのサンプルコードを手元で動かす
- 狙いたいニッチ（上記5つのうち1つ）に決め、36時間で動くスコープを紙に書く

### Step 2: ハッカソン開始直後（0-2時間）
- **ChainlinkとBaseのPrize Boothに真っ先に挨拶に行く**
- 「こういうものを作ろうとしている。CCIPのここを使いたいが相談できるか？」と具体的に質問
- スポンサーエンジニアの名刺・Telegram IDを交換し、詰まったときの連絡先を確保

### Step 3: 提出時（締め切り2時間前）
- Chainlink申請フォームに「CCIP/Functions/Automationのどのコントラクトのどの機能を使ったか」を具体的なトランザクションハッシュ・コード行数と共に記述
- Base申請フォームに「Smart Walletで実現したUX改善」をデモビデオ付きで説明
- デモビデオの最初30秒で「誰の何が辛いか」を語り、最後に「なぜChainlink/Baseが必要か」を1文で締める

---

## まとめ：2025-2026 ETH Global 必勝ポジション

| 軸 | 避けるべき | 狙うべき |
|---|---|---|
| カテゴリ | NFT市場、DAOツール、汎用DEX | TEE×AI、Agent Commerce、ZKプライバシー金融 |
| 技術深さ | ライブラリのラッパー実装 | SDK核心部分での独自ロジック |
| スコープ | 「将来的には〜もできる」 | 36時間で動くMVP1機能を完璧に |
| Chainlink | 表面的なData Feed参照 | CCIP + Functions + Automationの三位一体 |
| Base | 単なるBase testnetデプロイ | Smart Wallet + AgentKit + OnchainKit完全統合 |
