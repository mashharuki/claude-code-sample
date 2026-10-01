# ETH Global 受賞パターン詳細分析

## データソース
- ETH Global Showcase: https://ethglobal.com/showcase
- ETH Global Explorer: https://www.ethglobalexplorer.com/
- 各ハッカソンの公式発表

---

## 年別トレンド変遷

### 2026（最新 — ETHGlobal Tokyo 2026 / ETHOnline 2026 Showcase 実データ調査済み、2026-10 時点）
**支配的テーマ**: Agentic Commerce インフラ（AI Agent を「決済する経済主体」として扱う）

2026-10 に ETHGlobal Tokyo 2026（全 43 件）・ETHOnline 2026（全 32 件）の
Showcase を実際に調査した結果、2025 の「AI Agent × Web3」という漠然としたテーマが、
2026 には以下のように具体化・細分化していることが確認できた。

- **x402（HTTP 402 マイクロペイメント規格）を核心技術に据えた作品が最多**。
  Agent 同士・Agent と人間の間の支払いを前提にしたプロダクトが突出して多く、
  単なる決済実行だけでなく「与信審査」「エスクロー留保」「不正請求の検知」
  「支払いの監査証跡」など決済の**周辺インフラ**まで踏み込んだものが上位に多い。
  実例: `Dead or Alive Agent`（x402 支払いの事前審査・自動保留）、
  `Held`（x402 決済をエスクローに留保し買い手確認後に解放）、
  `FieldProof402`（Agent が人間に x402 で事実検証を依頼し監査可能な領収書を発行）、
  `Recibo`（x402 Agent 決済のエスクロー＋納品証明）、
  `Klaxon`（CI シークレットを分割し決済と引き換えでしか使えなくする）。
- **Agent 向け ID・権限・与信インフラ**: Agent に「財布」「支出上限」
  「取消可能な権限」「信用・評判スコア」を与える基盤系プロダクトが急増。
  実例: `Cypher Brain`（ENSv2 スコープの取消可能ウォレット権限）、
  `Accord`（人間と Agent 双方への支出上限付き予算）、`Agentic World`
  （Agent のオンチェーン ID）、`Bonded`（Agent の不正請求書払いを防止）、
  `Agent's List`（Agent 版の口コミ評価）、`Vigil`（Agent の支払能力継続監視）、
  `Vector52`（人間/Agent 向けオンチェーン・フォレンジック）。
- **ENS / ENSv2 が人間・Agent 共通の ID レイヤーとして定番化**。単なる
  ネームサービスでなく「誰が・どの Agent が・どんな権限を持つか」の表現基盤として
  組み込まれる（`Kakunin`, `Enscribe`, `Floatt`, `Meigi`, `Pact`）。
- **World ID 等の本人確認が決済・抽選・ガバナンスと組み合わされる**のが定番
  （`Axis`, `hackpass`, `GomiGo`, `ScalpLess`, `KawaiPay`）。
- **持続的に強い**: 1inch Aqua / Uniswap v4 Hook を使った DeFi 深堀り
  （`Iceberg`, `OniBlock`, `nacre`, `Solvent Aqua`, `Orbital Swap`）、
  Arc / Hedera 上のステーブルコイン決済レール、セキュリティ・不正検知ツール
  （`Sentinelio`, `Tripwire`, `Ninja Check`, `Secueji`）、
  ZK を使ったプライバシー・本人確認（`MynaHealth`: 日本の医療資格の ZK 証明、`yuin`）。
- **要注意**: Agentic Commerce 自体が 2026 時点で最大のレッドオーシャン。
  「Agent が決済する」だけの作品は多数あり差別化にならない。決済の周辺インフラ
  （与信・エスクロー・不正防止・監査・紛争解決）まで踏み込むことが
  ファイナリスト入りの分水嶺になっている。

**注目スポンサー**: x402 系決済インフラ、ENS / ENSv2、World、1inch（Aqua）、
Uniswap（v4 Hook）、Hedera、Arc / Circle（USDC）、Sui、The Graph

**データソース注記**: Showcase は `?events=<slug>` で絞り込み可能。slug は
`https://ethglobal.com/events` で確認すること（例: オンラインイベントの slug は
`ethonline2026` であり `online2026` ではない。推測せず必ず確認する）。

### 2025（旧データ・参考値）
**支配的テーマ**: AI Agent × Web3
- LLM（主に Claude / GPT-4o）がオンチェーン操作を自律実行するエージェント
- Agentic Commerce（Agent 間の自律決済・交渉）
- x402 / HTTP 402 を使ったマイクロペイメント
- Prediction Market の復活（Polymarket 効果）

**注目スポンサー**: World (Worldcoin), Circle (USDC), Chainlink, Base, Privy

### 2024
**支配的テーマ**: インテント + クロスチェーン
- Intent-centric Architecture（ERC-7521 など）
- Across Protocol / Stargate を使ったクロスチェーン UX
- ERC-4337 アカウントアブストラクション本格普及
- RWA（Real World Asset）トークン化

**代表受賞作の傾向**:
- Chainlink CCIP を使ったクロスチェーンアプリ多数
- Uniswap v4 フックを使った AMM カスタマイズ
- ZK Proof で本人確認を保護するプライバシーアプリ

### 2023
**支配的テーマ**: DeFi 成熟期 + コンシューマー
- コンシューマー向け Web3 アプリ（ソーシャル、ゲーム）
- Lens Protocol / Farcaster 上のソーシャルアプリ
- zkEVM 上のプライバシー DeFi
- Worldcoin / Proof of Personhood 活用

### 2022 以前
- NFT × ゲーミフィケーション（Play-to-Earn の派生）
- DAO ガバナンスツール
- DeFi プロトコルの最適化

---

## 受賞プロジェクトの共通特徴

### 必須要素（これがないと上位に入れない）
1. **動くデモ** — 審査員が実際に触れる UI がある
2. **明確な課題定義** — 「誰の何が辛いか」が 1 文で言える
3. **Web3 の必然性** — 「なぜブロックチェーンか」に答えられる
4. **スポンサー技術の深い活用** — 表面的な統合ではなく核心部分での活用

### 差別化要素（上位 3 位以内に入るために必要）
1. **Wow Moment** — デモで審査員が前のめりになる瞬間
2. **技術的深さ** — 既存ライブラリのラッパーでない独自の実装
3. **スコープの最適化** — 1 つの機能を完璧に、複数の機能を中途半端にではなく

### 失敗パターン
- DEX / NFT マーケット / DAO ツールの n 番煎じ
- 「将来的には X もできる」と未実装機能を語る
- スマートコントラクトがなく、単なる Web アプリ
- ホワイトペーパー / アーキテクチャ図だけでデモなし

---

## イベント別の特色

### ETHGlobal in-person（SF, NYC, Bangkok etc.）
- 現地の雰囲気が重要。デモが盛り上がると口コミで審査員が集まる
- ネットワーキングでスポンサーエンジニアに直接フィードバックもらえる
- Prize booth でスポンサーに直接売り込む機会がある

### ETHOnline（オンライン）
- デモビデオの質が重要（審査員が現地で見ない分）
- GitHub / ドキュメントの充実度が評価される
- 録画デモは 3 分以内、最初の 30 秒で興味を引く

---

## 賞の種類と戦略

### Best Overall / Grand Prize
- 全スポンサー技術を横断的に活用
- 審査員全員に刺さるストーリー
- 技術的完成度と UX の両立

### Sponsor-specific Prize
- そのスポンサーの最新 SDK / コントラクトを核心部分で使う
- スポンサーのドキュメントを熟読し、他チームが見落としている機能を使う
- Prize booth でスポンサーエンジニアと事前コミュニケーション

### Pool Prize（プール賞）
- 締め切り前に駆け込み申請するのではなく、事前にスポンサー技術を組み込んでおく
- 複数の Pool Prize を狙って申請できる = 受賞確率が上がる
- 技術統合の証拠（コード、デモ）を明示的に記載

---

## 過去の注目受賞作（タイプ別）

### AI × Web3 タイプ
- **AI Agent が DeFi を自動実行** — ユーザーの意図を自然言語で受け取り、
  最適な DeFi 操作（スワップ・流動性提供）を自律実行
- **オンチェーン AI 推論** — ZK Proof で AI モデルの実行を証明

### Privacy タイプ
- **プライベート投票** — ZK で匿名性を保ちながら投票結果を検証
- **プライベート残高** — 口座残高を公開せずに送金を証明

### UX 改善タイプ
- **ガスレストランザクション** — Paymaster × AA でユーザーがガスを意識しない体験
- **1 クリック DeFi** — Intent で複数操作を 1 アクションに集約

### RWA タイプ
- **不動産トークン化** — Chainlink + 法的書類のオンチェーン管理
- **インボイスファイナンス** — 請求書をオンチェーンで担保に融資
