# ETH Global Bangkok 参加戦略：2025年トレンドを踏まえた5つのアイデア

## チーム概要
- 人数：3名
- 技術スタック：Next.js / React（フロントエンド）、Solidity（スマートコントラクト）
- 目標：スポンサー賞を狙いながらインパクトのあるプロダクトを開発する

---

## 2025年の主要トレンド

ETH Globalハッカソンにおける2025年のトレンドを以下のように分析する：

1. **AI × Web3 の融合**：LLMとスマートコントラクトの組み合わせ（AIエージェントによるオンチェーン操作）
2. **Account Abstraction（ERC-4337）の普及**：ガスレストランザクション、スマートウォレット
3. **クロスチェーン・インターオペラビリティ**：LayerZero、Axelar、CCIPなど
4. **DeFi 2.0**：Intent-based architecture、リアルワールドアセット（RWA）
5. **プライバシー技術**：Zero-Knowledge Proof（zkSNARKs）の実用化
6. **分散型ID / 評判システム**：Soulbound Token、Attestation（EAS）

---

## アイデア5選

---

### アイデア1：AIエージェント × DeFi 自動運用ポートフォリオマネージャー

**概要**
LLM（Claude/GPT）をバックエンドに持ち、ユーザーのリスク許容度を自然言語で入力するだけで、Solidity製スマートコントラクトがオンチェーンで自動的にDeFiポジションを管理するプロダクト。ERC-4337（Account Abstraction）を活用して、ガスレスでトランザクションを実行。

**技術スタック**
- フロントエンド：Next.js / React（ポートフォリオダッシュボード、チャットUI）
- スマートコントラクト：Solidity + ERC-4337 Smart Wallet
- AI：Claude API または OpenAI API（Intent解析）
- DeFi統合：Uniswap v4、Aave、Compound

**狙えるスポンサー賞**
- **Coinbase / Base**：Base上でのAccount Abstraction活用
- **Alchemy**：AA Wallet インフラとして利用
- **Uniswap**：Uniswap v4 Hooks統合
- **Aave**：Aaveプロトコルとの統合
- **Chainlink**：価格フィード・オートメーション活用

**勝ちポイント**
自然言語でDeFi操作を可能にする体験は審査員に刺さりやすく、AIとWeb3のクロスオーバーとして注目度が高い。

---

### アイデア2：分散型評判・信頼スコアシステム（EAS × Soulbound Token）

**概要**
Ethereum Attestation Service（EAS）とSoulbound Token（SBT）を活用して、ユーザーのオンチェーン行動（DeFi利用歴、ガバナンス参加、コミュニティ貢献等）を評判スコアとして可視化するプロトコル。担保なし小額ローンや、DAOガバナンスの投票重みに活用できる。

**技術スタック**
- フロントエンド：Next.js（スコアダッシュボード、アテステーション発行UI）
- スマートコントラクト：Solidity + EAS SDK
- Graph Protocol：オンチェーンデータのインデックスと集計

**狙えるスポンサー賞**
- **EAS（Ethereum Attestation Service）**：コアとして活用
- **The Graph**：オンチェーンデータクエリ
- **ENS**：ENSドメインとの紐付けで評判の可搬性向上
- **Scroll / Polygon**：L2上でのガス効率化
- **Gitcoin**：Passportとの連携でSybil耐性強化

**勝ちポイント**
リアルな社会的信用問題（担保なしローン、Sybil攻撃対策）を解決するユースケースが明確。EASはETH Global Bangkok期間中にスポンサーとして参加していることが多く、賞の獲得可能性が高い。

---

### アイデア3：Intent-based クロスチェーン送金 × チャットUI

**概要**
「Aliceに100 USDCをBase経由で送りたい」という自然言語インテントを入力するだけで、最適なブリッジルートを自動選択してクロスチェーン送金を完了するアプリ。ENSによる人間可読アドレス解決と、LI.FI / Across Protocolによるクロスチェーンルーティングを組み合わせる。

**技術スタック**
- フロントエンド：Next.js / React（チャットUI + トランザクション進捗表示）
- スマートコントラクト：Solidity（Intent Resolver Contract）
- ブリッジ統合：LI.FI SDK、Across Protocol、CCIP
- ENS：アドレス解決

**狙えるスポンサー賞**
- **Across Protocol**：クロスチェーンブリッジのコアとして活用
- **Chainlink CCIP**：クロスチェーンメッセージング
- **ENS**：ヒューマンリーダブルアドレス解決
- **LI.FI**：ルーティングアグリゲーター
- **Circle / USDC**：ステーブルコイン決済インフラ

**勝ちポイント**
クロスチェーン体験のUX改善は長年の課題であり、「誰でも使える」という訴求が審査員に響く。Intent-basedアーキテクチャは2025年のトップトレンド。

---

### アイデア4：ゼロ知識証明を使ったプライバシー保護型投票・ガバナンスシステム

**概要**
zkSNARKsを活用して、「誰がどのように投票したか」を秘匿しながら「投票が正しく集計された」ことを証明できるDAOガバナンスシステム。Noir（Aztec）またはcircomを使ってzkプルーフを生成し、Next.jsフロントエンドで提出・検証UIを提供する。

**技術スタック**
- フロントエンド：Next.js / React（投票UI、zkプルーフ生成・提出）
- スマートコントラクト：Solidity（Verifier Contract、投票集計）
- ZKツール：Noir by Aztec または circom + snarkjs
- ストレージ：IPFS（投票データのアンカリング）

**狙えるスポンサー賞**
- **Aztec / Noir**：ZK開発ツールとして活用
- **Scroll**：zkEVMとしての相性が良い
- **Polygon**：zkEVM上でのデプロイ
- **The Graph**：投票履歴のインデックス
- **IPFS / Filecoin**：分散ストレージ統合

**勝ちポイント**
「プライバシー」と「透明性」を両立する技術的難度の高さは審査員から高評価を得やすい。ZKカテゴリのスポンサーが増加傾向にあり、2025年は特に注目が集まっている。

---

### アイデア5：RWA（リアルワールドアセット）× 小口分散投資プラットフォーム

**概要**
不動産、農地、アート、再生可能エネルギーなどのリアルワールドアセットをERC-1155でトークン化し、誰でも1ドルから投資できるプラットフォーム。Chainlinkのオラクルで資産価値を定期的に更新し、配当をUSDCでオンチェーン自動分配するスマートコントラクトを実装する。

**技術スタック**
- フロントエンド：Next.js / React（資産マーケットプレイス、ポートフォリオ管理）
- スマートコントラクト：Solidity（ERC-1155トークン化、配当分配、Vesting）
- オラクル：Chainlink Data Feeds + Automation
- コンプライアンス：EASによるKYC/AML Attestation

**狙えるスポンサー賞**
- **Chainlink**：オラクル（価格フィード＋オートメーション）の中心活用
- **Centrifuge / Maple Finance**：RWAプロトコル連携
- **Circle / USDC**：配当支払いのステーブルコイン
- **Base**：低コストL2上でのRWAトークン管理
- **EAS**：KYC/コンプライアンスAttestation

**勝ちポイント**
RWAは2024〜2025年のDeFiにおける最大トレンドの一つ。「金融包摂」という強いナラティブを持ち、デモの視覚的インパクトも大きい。Chainlinkスポンサー賞との相性が特に良い。

---

## スポンサー賞攻略まとめ表

| アイデア | 主要スポンサー賞 | 技術難易度 | UXインパクト |
|---|---|---|---|
| AIエージェントDeFiマネージャー | Coinbase/Base, Uniswap, Chainlink | 高 | 高 |
| 分散型評判スコア | EAS, The Graph, Gitcoin | 中 | 中 |
| Intent クロスチェーン送金 | Across, CCIP, ENS | 中 | 非常に高 |
| ZK投票・ガバナンス | Aztec/Noir, Scroll, Polygon | 非常に高 | 中 |
| RWA分散投資 | Chainlink, Circle, Base | 高 | 高 |

---

## チームへの推奨戦略

3人チームでNext.js + Solidityが得意な場合、**アイデア3（Intent クロスチェーン送金）** または **アイデア1（AIエージェントDeFiマネージャー）** が最も現実的かつ高評価を狙いやすい。

理由：
- フロントエンドのUIクオリティがそのままデモの説得力に直結する
- バックエンド（AI API連携）はNext.js API Routesで対応可能
- Solidityの複雑さを適切なスコープに収めやすい
- 複数スポンサーの賞を同時に狙える設計が可能

48〜72時間のハッカソンでは、**スコープを明確に絞り、デモが動くことを最優先**にすることが勝利の鍵となる。

---

*作成日：2026年4月24日*
*対象イベント：ETH Global Bangkok*
