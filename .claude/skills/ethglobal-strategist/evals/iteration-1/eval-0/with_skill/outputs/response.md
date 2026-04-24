# ETH Global Bangkok 参加戦略レポート

**チーム構成**: 3名（フロントエンド: Next.js/React、バックエンド: Solidity）  
**目標**: 2025年トレンドを踏まえた受賞可能なアイデア5案の提示

---

## 調査サマリー

### ライブデータ調査結果（ethglobal.com/showcase より）

ETH Global Cannes 2026（最新イベント）の傾向を分析した結果、以下のメガトレンドが確認された：

1. **AI Agent インフラ（最大カテゴリ）**: 全プロジェクトの約50%がAI Agent関連。ENS・World IDと組み合わせた「自律的なオンチェーンAgent」が最多受賞カテゴリ。
2. **プライバシー × ZK Proof**: CloakPay、Veil、SecretPay などプライベート送金・匿名クレジットスコアが多数受賞。
3. **Agentic Commerce / Agent間決済**: x402プロトコル、マイクロペイメント、Agent Pay など新興カテゴリが急成長。
4. **Human Verification × Agent**: World IDによる「人間担保付きAgent」が差別化ポイントとして注目。
5. **RWA × DeFi最適化**: 実資産をオンチェーン担保にしたレンディング、請求書ファイナンスが継続的に受賞。

### ETH Global Bangkok スポンサー情報

- **総賞金額**: $750,000
- **最高額スポンサー（各$20,000）**: Chainlink、World、Uniswap Foundation、Polygon、Arbitrum、LayerZero、1inch など
- **注目スポンサー**: ENS、Base、The Graph、Dynamic、Coinbase Developer Platform、Sign Protocol
- **技術フォーカス**: ZK Proof、AI × Crypto、DeFi、インターオペラビリティ、プライバシー、Identity

---

## おすすめアイデア候補（5案）

---

### アイデア 1: **IntentPay** — 自然言語でDeFiを操作するインテントベース決済エージェント

**プロダクト概要（1文）**  
ユーザーが「毎月5ドルをUSDCでBangkokの家族に送金して」と日本語・英語で話しかけるだけで、最適なルーティング・ブリッジ・スワップを自動実行するAI Agentウォレット。

**解決する課題**  
- DeFiのUXは依然として複雑で、一般ユーザーが複数チェーン間送金をするには20ステップ以上の操作が必要
- 東南アジア（バンコク会場！）では家族への送金需要が高く、既存の送金サービスは手数料が5〜10%

**Web3 必然性**  
- グローバル・検閲耐性のある決済インフラ（銀行口座不要）
- スマートコントラクトでルーティングをオンチェーン検証可能
- プログラム可能なお金＋インテント実行はWeb2では実現不可能

**狙えるスポンサー賞**  
| スポンサー | 理由 |
|---|---|
| **Chainlink** ($20,000) | CCIP を使ったクロスチェーンルーティング |
| **World** ($20,000) | World ID で人間確認＋スパム防止 |
| **LayerZero** ($20,000) | クロスチェーン メッセージングの核心活用 |
| **1inch** ($20,000) | 最適スワップルーティングAPI統合 |

**技術スタック**  
```
フロントエンド: Next.js + wagmi/viem + RainbowKit
コントラクト: Solidity (IntentResolver.sol) + Hardhat
AI: Vercel AI SDK + Claude API（自然言語→インテント変換）
クロスチェーン: Chainlink CCIP + LayerZero
Identity: World ID MiniKit
デプロイ: Base Sepolia / Polygon Amoy
```

**類似受賞作との差別化**  
- 2024年のインテントベースUXと異なり、東南アジアの送金ユースケースに特化
- World IDによる実在人確認を組み合わせてスパムAgentを排除
- バンコク会場で「地元ユーザーへのデモ」という強力なストーリー

---

### アイデア 2: **AgentVault** — AI Agentが自律運用するDeFiイールド最適化ボット

**プロダクト概要（1文）**  
ユーザーのウォレットに紐づいたAI Agentが、Aave・Morpho・Uniswap v4のイールドをリアルタイム比較し、ガスコスト込みで最大リターンを自動実行するインテリジェントボールト。

**解決する課題**  
- DeFiのイールドファーミングは24時間監視が必要で個人投資家には管理不可能
- 複数プロトコル間の資金移動にガスコストとスリッページが発生し、手動では非効率

**Web3 必然性**  
- オンチェーンでの検証可能な自律実行（不正なAgent操作を防止）
- スマートコントラクトによる資産の非カストディアル管理
- トークンインセンティブでAgentのパフォーマンスをオンチェーン公開

**狙えるスポンサー賞**  
| スポンサー | 理由 |
|---|---|
| **Chainlink** ($20,000) | Automation + Data Feeds で価格・ガス監視 |
| **Uniswap Foundation** ($20,000) | Uniswap v4 フック × 流動性最適化 |
| **The Graph** | サブグラフでイールドデータをインデックス |
| **Arbitrum** ($20,000) | 低ガスでAgent実行をArbitrum上に展開 |

**技術スタック**  
```
フロントエンド: Next.js + wagmi + The Graph クライアント
コントラクト: Solidity (AgentVault.sol + Uniswap v4 Hook)
AI: Claude API（戦略判断）+ Chainlink Automation（定期実行）
データ: Chainlink Data Feeds + The Graph サブグラフ
デプロイ: Arbitrum Sepolia
```

**類似受賞作との差別化**  
- 単純なイールドアグリゲーターと異なり「Agentが理由を説明しながら実行」する透明性
- Uniswap v4フックを使った独自のAMM戦略（他チームが見落としやすい深い統合）
- ETH Global Cannes 2026でも同カテゴリ（ZENITH、Tranquille）が受賞しており再現性高い

---

### アイデア 3: **ZKCredit** — ZK Proofで銀行残高を秘匿したままオンチェーンローン審査

**プロダクト概要（1文）**  
ユーザーの銀行口座残高・取引履歴をZero-Knowledge Proofで証明し、実際の金額を開示せずに「信用力あり」を担保にUSDCローンを受け取れるプライバシーファースト型レンディングプロトコル。

**解決する課題**  
- 既存のDeFiレンディングは過剰担保が必要で、現金が少ない人は利用できない
- 銀行残高をオンチェーンで証明するには個人情報開示が必要でプライバシー問題

**Web3 必然性**  
- ZK Proofは計算量的にWeb2では実現不可能なプライバシー保護と検証の両立
- スマートコントラクトで担保なしローンの自動清算ルールを実装
- 検閲耐性のある金融インクルージョン（銀行口座は持っているがウォレット担保がない人向け）

**狙えるスポンサー賞**  
| スポンサー | 理由 |
|---|---|
| **World** ($20,000) | World ID × ZK ProofでSybil耐性のある信用スコア |
| **Sign Protocol** | オンチェーン信用証明書（Attestation）の発行 |
| **Polygon** ($20,000) | zkEVM上での効率的なZK実行 |
| **Mina Protocol** | ZK Proof生成の統合 |

**技術スタック**  
```
フロントエンド: Next.js + ZK Proof UI（証明生成の進捗表示）
コントラクト: Solidity (ZKCreditPool.sol) + zkSNARK verifier
ZK: Noir または Circom（銀行残高証明回路）
Identity: World ID（実在人確認）
Oracle: Chainlink（銀行データ取得）
デプロイ: Polygon Amoy / zkEVM
```

**類似受賞作との差別化**  
- ETH Global Cannes 2026の「Veil」「SecretPay」と同トレンドだが、信用スコア×レンディングという独自切り口
- バンコク（東南アジア）は銀行口座普及率が低い地域 — 金融包摂ストーリーが刺さる
- 36時間でZK回路フルスクラッチは難しいため、既存ライブラリ（Noir）を活用してMVP実現性を確保

---

### アイデア 4: **MeshWork** — ENS × World IDで本人確認済みのフリーランス請求書決済プロトコル

**プロダクト概要（1文）**  
フリーランサーがWorld IDで本人確認し、ENSドメインを請求書アドレスとして使い、スマートコントラクトでマイルストーン達成時に自動でUSDCが支払われるエスクロー型仕事決済プロトコル。

**解決する課題**  
- フリーランスの国際送金は手数料5〜8%、着金まで3〜5日
- 支払い踏み倒し（特にクロスボーダー）のリスクが高く、信頼コストが大きい
- バンコクはデジタルノマドハブ — タイ人フリーランサーが国際クライアントから受け取る際の問題

**Web3 必然性**  
- プログラム可能なエスクロー（成果物確認後自動リリース）はスマートコントラクトのキラーユースケース
- ENSで人間可読なアドレス（名前.eth）を請求書に使用
- World IDで「実在する人間」を証明し、Sybil攻撃・詐欺フリーランサーを排除

**狙えるスポンサー賞**  
| スポンサー | 理由 |
|---|---|
| **World** ($20,000) | World ID本人確認をコアに活用 |
| **ENS** | ENSドメイン × 請求書アドレス深い統合 |
| **Sign Protocol** | 仕事完了Attestationをオンチェーン発行 |
| **Coinbase Developer Platform** | Base上でのUSDC決済 + Paymaster |

**技術スタック**  
```
フロントエンド: Next.js + wagmi + ENS解決ライブラリ
コントラクト: Solidity (MilestoneEscrow.sol)
Identity: World MiniKit (World ID検証)
ENS: ENS JS SDK（ドメイン登録・解決）
Attestation: Sign Protocol SDK
決済: USDC on Base / Coinbase Paymaster（ガスレス）
デプロイ: Base Sepolia
```

**類似受賞作との差別化**  
- ETH Global Cannes 2026「Jurex Network」（AI Agent間紛争解決）と異なり、人間のフリーランスに特化
- バンコク会場のコンテキスト（タイのデジタルノマドエコシステム）とストーリーが一致
- 4スポンサー技術の組み合わせで複数の賞を狙える構成

---

### アイデア 5: **PredictChain** — オンチェーンPrediction Marketのソーシャルグラフ統合版

**プロダクト概要（1文）**  
Farcasterのソーシャルグラフを活用し、フォロー中のKOL（Key Opinion Leader）の予測市場参加履歴を可視化・模倣投資できる「コピートレード型」Prediction Marketプロトコル。

**解決する課題**  
- 既存のPrediction Market（Polymarket等）は専門知識がないと何に賭けるか判断できない
- ソーシャルデータとオンチェーン予測市場は分断されており、信頼できる予測者を発見しにくい

**Web3 必然性**  
- オンチェーンの予測履歴は改ざん不可能な「実績証明」として機能
- トークンインセンティブで良質な予測者にリワードを自動配布
- ソーシャルグラフのオープン性（Farcaster）がWeb2クローズドエコシステムとの差別化

**狙えるスポンサー賞**  
| スポンサー | 理由 |
|---|---|
| **Pyth Network** ($20,000) | リアルタイム価格フィード（スポーツ・市場データ）のオラクル |
| **The Graph** | Farcasterソーシャルグラフ + オンチェーン予測履歴のインデックス |
| **Sign Protocol** | 予測者の実績をオンチェーンAttestationで証明 |
| **World** ($20,000) | World IDで1人1予測を保証（Sybil防止） |

**技術スタック**  
```
フロントエンド: Next.js + wagmi + Farcaster Kit
コントラクト: Solidity (PredictionMarket.sol + ReputationToken.sol)
Oracle: Pyth Network（価格データ）+ Chainlink Automation（決済トリガー）
Social: Farcaster API（ソーシャルグラフ取得）
インデクサー: The Graph（予測履歴サブグラフ）
デプロイ: Polygon Amoy / Base Sepolia
```

**類似受賞作との差別化**  
- ETH Global Cannes 2026「HackaTriathlon」（バイオメトリクス Prediction Market）と異なり、ソーシャル模倣というUXを核に
- Polymarketクローンとの差異：「誰の予測を信頼するか」のソーシャルレイヤーが核
- 2025年Prediction Market復活トレンド（winning-patterns.md記載）に完全合致

---

## スコアリング（5アイデア比較）

| アイデア | インパクト | 技術革新性 | UX | 実現性 | 賞金獲得可能性 | 合計 |
|---|---|---|---|---|---|---|
| IntentPay | 5 | 4 | 5 | 4 | 5 | **23/25** |
| AgentVault | 4 | 5 | 3 | 4 | 5 | **21/25** |
| ZKCredit | 5 | 5 | 3 | 2 | 4 | **19/25** |
| MeshWork | 4 | 3 | 5 | 5 | 4 | **21/25** |
| PredictChain | 3 | 4 | 4 | 4 | 4 | **19/25** |

**最推奨**: **IntentPay** (23/25) — バンコク開催との文脈一致、複数スポンサー賞対応、36時間実現性が最も高い

---

## 推奨アクション（次の3ステップ）

### Step 1: スポンサー事前調査（ハッカソン1週間前まで）
- Chainlink、World、LayerZeroの最新SDKドキュメントを読み込む
- ETH Global BangkokのPrize Boothでスポンサーエンジニアに直接コンタクト
- Discord / Telegramでスポンサーチャンネルに参加し、審査員の好みを把握

### Step 2: 技術検証スプリント（ハッカソン開始前の週末）
- Next.js + wagmi + World MiniKitの環境構築を完了させる
- Chainlink CCIPのcross-chain送金デモを手元で動かしてみる
- Hardhatでシンプルなエスクローコントラクトをデプロイして動作確認

### Step 3: ハッカソン当日のタイムライン厳守
```
0-4h  : アイデア最終決定（IntentPay推奨）+ リポジトリ作成 + 役割分担
4-8h  : IntentResolver.sol の実装（Chainlink CCIP + World ID統合）
8-16h : Next.js フロントエンド + コントラクト統合
16-28h: AI自然言語→インテント変換の実装 + バグ修正
28-34h: デモシナリオ作成（「バンコクの家族に送金」ストーリー）
34-36h: Lighthouse テスト + ETH Global Showcase 提出
```

---

## デモ・ピッチ戦略

- **最初の30秒**: 「バンコクで働く友人が、家族に送金するのに毎月3,000円の手数料を払っている。IntentPayならゼロコストで5秒で送れる」
- **Live デモ必須**: 実際にUSDCがクロスチェーンで送金される画面を審査員に見せる
- **数字**: 「既存送金サービスより95%安い」「3ステップが1文で完了」
- **スポンサー深度**: 「Chainlink CCIPをルーティングの核心に使い、LayerZeroでフォールバック冗長化」

---

*調査日時: 2025年（ETH Global Cannes 2026受賞作・ETH Global Bangkok公式情報をもとに分析）*
