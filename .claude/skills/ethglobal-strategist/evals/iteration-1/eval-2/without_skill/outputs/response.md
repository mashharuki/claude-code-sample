# ETH Global 2024-2025 受賞作品トレンド分析：避けるべきカテゴリと狙いやすいニッチ

## 概要

ETH Global 2024-2025のハッカソンシリーズ（ETHDenver、ETHGlobal Brussels、ETHGlobal San Francisco、ETHGlobal Bangkok、ETHGlobal Taipei等）の受賞作品を振り返ると、いくつかの明確なトレンドと飽和カテゴリが浮かび上がる。

---

## 今避けるべき飽和カテゴリ

### 1. 汎用DeFiプロトコル（DEX・Lending）

Uniswap風のAMM、Aave風のレンディングプロトコルはすでに極限まで競合が多い。改善幅を示すのが困難で、審査員の印象に残りにくい。スポンサー賞を狙っても「また似たようなDeFi」と見なされるリスクが高い。

### 2. 単純なNFTマーケットプレイス・ミンティングツール

2022〜2023年のブームが完全に終息しており、ETH Global 2024以降の受賞作品においてシンプルなNFT売買・発行ツールはほぼ姿を消している。差別化が極めて困難。

### 3. 基本的なトークン発行・ICO類似プロジェクト

ローンチパッドや単純なERC-20ファクトリーは審査員の注目を集めない。規制リスクも印象を悪くする要因になる。

### 4. PoC止まりのAI×Web3 統合（薄い掛け合わせ）

「AIでNFTを生成する」「ChatGPT APIをスマートコントラクトに繋ぐだけ」というレベルの浅いAI統合は、2024年後半から急増して飽和状態になった。単なるAPI呼び出しではなく、深い統合が求められる。

### 5. DAO投票ツール（基本機能のみ）

Snapshot/Tally相当の機能しかないDAO管理ツールは差別化点がなく、賞を取るのが難しい。

---

## これから狙いやすいニッチ

### 1. AI Agent × オンチェーン経済（最重要トレンド）

**自律型AIエージェントがオンチェーンで資産を管理・取引・交渉する**ユースケースが急速に評価されている。

- エージェント間のマイクロペイメント決済
- タスク完了を条件にした報酬支払いのエスクロー
- エージェントのオンチェーンアイデンティティ・レピュテーション
- x402プロトコルやERC-4337を活用したエージェント用スマートウォレット

ETH Global 2024後半〜2025にかけて、このカテゴリの受賞が急増している。

### 2. インテントベースのUX（Intent-Centric）

ユーザーが「何をしたいか」を自然言語や高レベルの意図で表現し、バックエンドがクロスチェーンで最適実行するアーキテクチャ。ERC-7683（CrossChainOrder）やUniswapX、AcrossプロトコルのSolverモデルが注目されている。

### 3. ZK Proof × プライバシー保護アイデンティティ

World ID（Proof of Personhood）、Semaphore、Noir（Aztec）等を使った「証明するが明かさない」ユースケース。特に：
- KYC/AML対応しながらプライバシーを保護するオンチェーン金融
- 匿名投票・評判システム
- クレデンシャルの選択的開示

### 4. クロスチェーン / チェーン抽象化（Chain Abstraction）

ユーザーがどのチェーンにいるか意識せずにアプリを使える設計。LayerZero、Wormhole、LI.FI等のブリッジを透過的に活用するUX。ETH Global 2025では特にBase + Optimism Superchain周りのインターオペラビリティが評価されている。

### 5. DePIN（分散型物理インフラ）× ユーティリティ

IoTデバイス、センサー、コンピューティングリソース等の物理インフラをトークン化・分散管理するモデル。Helium後継や新しいDePINプロトコルへの統合で差別化可能。

### 6. Real World Assets（RWA）のオンチェーン化

不動産、請求書ファイナンス、コモディティなどの現実資産のトークン化。Chainlinkのオフチェーンデータと親和性が高く、スポンサー賞狙いにも適している。

### 7. ソーシャル × Web3 / SocialFi の再発明

Farcaster、Lens Protocol上でのアプリケーション。特にチャンネルベースのコラボレーション、収益化可能なコンテンツ、レピュテーションシステムが評価されている。

---

## Chainlinkスポンサー賞を狙う戦略

### Chainlinkが評価する軸

Chainlinkは以下のプロダクト群でスポンサー賞を出している：

1. **Chainlink Data Feeds** - 価格フィード、レート等
2. **Chainlink VRF（Verifiable Random Function）** - オンチェーン乱数
3. **Chainlink CCIP（Cross-Chain Interoperability Protocol）** - クロスチェーンメッセージング
4. **Chainlink Functions** - スマートコントラクトからWeb APIを呼び出す
5. **Chainlink Automation** - 条件トリガー型の自動実行

### 有効なアプローチ

#### ベストプラクティス：Chainlink Functionsを使ったAI Agent統合

```
AIエージェントが判断した結果 → Chainlink Functions経由でオフチェーンAPIを呼び出し → 
結果をスマートコントラクトに返す → 自動実行（Automation）
```

これは「AI × Web3」の薄い統合とは異なり、Chainlinkのインフラを核に据えた設計。

#### CCIPを使ったクロスチェーンインテント実行

ユーザーのインテントをCCIPでBase↔他チェーン間でブロードキャストし、最適チェーンで実行するアーキテクチャ。Chainlink CCIPの使用量が最大になるため賞を取りやすい。

#### VRFを使った公正な分配メカニズム

単なるゲームだけでなく、**公正なDAO意思決定・タスク割り当て・リソース分配**にVRFを使うと審査員の注目を集めやすい。ユーティリティが明確であることが重要。

#### RWA × Chainlink Data Feeds

現実資産のオンチェーン価格評価にData Feedsを使い、清算やリバランスをAutomationで自動化するモデル。機関投資家向けの実用性が評価される。

### Chainlink賞を取るために避けること

- Data Feedsのみを使った単純な価格表示 → 深度が足りない
- CCIPのHello World相当のデモ → 応用が見えない
- Chainlink製品を「サブ機能」として添えるだけ → コア設計に組み込むべき

---

## Baseスポンサー賞を狙う戦略

### Baseが評価する軸

BaseはCoinbaseが推進するLayer 2で、以下を重視している：

1. **オンチェーンエコノミー** - 実際にユーザーが使う・支払うプロダクト
2. **Coinbase製品との連携** - Coinbase Wallet、Smart Wallet（ERC-4337）、CDP（Coinbase Developer Platform）
3. **消費者向けUX** - Web2並みの使いやすさ
4. **Basenames（ENS相当）の活用**
5. **ガスレス・スポンサードトランザクション**

### 有効なアプローチ

#### Smart Wallet × ガスレスUX

ERC-4337ベースのCoinbase Smart Walletを使い、**初心者がガスを意識せずに使えるアプリ**を作る。Paymasterによるガス代スポンサーを実装すると評価が高い。

```
ユーザー登録（Web2ライク） → Smart Wallet自動作成 → 
スポンサードトランザクション → オンチェーン操作
```

#### Coinbase CDP（Developer Platform）を核にしたエージェント

AgentKit（Coinbase）を使ってAIエージェントにウォレット機能を持たせ、Base上で自律的に行動させる。2024年後半〜2025年のBaseスポンサー賞の常連テーマ。

#### ソーシャルペイメント × Basenames

Basenames（.base.eth）でユーザーを特定し、**友人間送金・クリエイター収益化・チップ機能**を実装。Web2のVenmo/PayPayに相当するオンチェーン版。

#### Base上のRWA × コンシューマーファイナンス

ステーブルコイン（USDC）を核にした：
- P2Pレンディング（知人間）
- 給与の分割払い・前払い
- クロスボーダー送金

#### MiniApp × Farcaster × Base

Farcaster Framesを使ってFeed内で完結するミニアプリ。USDC支払いをBase上で処理し、フレームの中だけで経済が完結するモデルが2025年に台頭している。

### Baseが評価しないパターン

- ただBase Sepoliaにデプロイしただけ（他のEVMと差がない）
- Baseの特徴的な機能（Smart Wallet、CDP、Basenames）を一切使っていない
- UXが複雑でMetaMask必須のもの

---

## Chainlink + Baseを同時に狙う複合戦略

最も強力なアプローチは両スポンサーの機能を有機的に組み合わせること。

### 推奨アーキテクチャ例：「AI-Powered Intent Execution Engine」

```
[ユーザー（Base Smart Wallet）]
    ↓ 自然言語インテント
[AI Agent（AgentKit / CDP）]
    ↓ オンチェーンデータ判断
[Chainlink Functions + Data Feeds]  ← オフチェーンAPI・価格取得
    ↓ 最適ルート決定
[Chainlink CCIP]  ← クロスチェーン実行
    ↓
[Base上のコントラクト実行 + Automation]
    ↓ 結果通知
[Basenames紐づきユーザーへ通知]
```

このアーキテクチャは：
- Chainlink: Functions、Data Feeds、CCIP、Automationを全て使用
- Base: Smart Wallet、CDP AgentKit、Basenames、ガスレス実行
- 両方に対して「コアに組み込まれている」と評価される

---

## まとめ：2025年後半のETH Global攻略チェックリスト

| 観点 | 推奨 | 避けるべき |
|------|------|----------|
| カテゴリ | AI Agent経済、インテント、ZK Identity | 汎用DEX、単純NFT、薄いAI統合 |
| Chainlink活用 | CCIP + Functions + Automation の組み合わせ | Data Feedsのみの単純実装 |
| Base活用 | Smart Wallet + CDP AgentKit + Basenames | ただBase上にデプロイするだけ |
| UX | ガスレス・Web2ライク | MetaMask必須・複雑な操作 |
| 差別化 | 現実の課題を解決するユーティリティ | 「できることを見せる」だけのデモ |
| ピッチ | 「なぜこれが必要か」から始まるストーリー | 技術説明から始まるプレゼン |

---

*注：本分析は筆者の知識に基づく（カットオフ：2025年8月）。ETH Global公式サイトのShowcaseで最新の受賞作品を確認することを強く推奨する。*
