# Amazon Bedrock 直近3日間アップデートレポート (2026年3月9日〜11日)

調査日: 2026年3月11日

---

## 1. 主要アップデート一覧

### 1-1. Amazon Bedrock AgentCore の Policy が一般提供開始 (GA)

- **発表日**: 2026年3月3日 (3月9日のWeekly Roundupで取り上げ)
- **概要**: Amazon Bedrock AgentCore の Policy 機能が一般提供（GA）となった。エージェントとツール間のやり取りに対して、一元的かつきめ細かなアクセス制御を提供する。
- **主な特徴**:
  - エージェントコードの外部で動作し、セキュリティ・コンプライアンス・運用チームがエージェントコードを変更せずにツールアクセスやバリデーションルールを定義可能
  - **自然言語でポリシーを記述**すると、AWSのオープンソースポリシー言語「Cedar」に自動変換される
  - ポリシーはポリシーエンジンに格納され、AgentCore Gatewayに紐付けられる
  - AgentCore Gatewayがエージェント・ツール間のトラフィックを傍受し、リクエストごとにポリシーを評価して許可/拒否を判定
- **対応リージョン**: 13リージョン（東京リージョン含む: US East (N. Virginia), US East (Ohio), US West (Oregon), Asia Pacific (Mumbai, Seoul, Singapore, Sydney, Tokyo) など）
- **参照**: [Policy in Amazon Bedrock AgentCore is now generally available](https://aws.amazon.com/about-aws/whats-new/2026/03/policy-amazon-bedrock-agentcore-generally-available/)

### 1-2. Amazon Bedrock OpenAI互換 Projects API の発表

- **発表日**: 2026年2月26日〜3月初旬
- **概要**: Amazon Bedrock の Mantle 推論エンジン上で OpenAI 互換の Projects API が利用可能に。複数アプリケーション・環境・チームを持つ組織向けに、プロジェクト単位の分離を実現する。
- **主な特徴**:
  - プロジェクトごとに異なるIAMベースのアクセス制御を設定可能
  - プロジェクトにタグを付与し、コスト可視性を向上
  - OpenAI互換API（Responses API、Chat Completions API）を通じて利用可能
  - Mantle推論エンジンによる高性能・信頼性の高いサーバーレス推論
- **参照**: [Amazon Bedrock announces OpenAI-compatible Projects API](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-projects-api-mantle-inference-engine/)

### 1-3. OpenClaw on Amazon Lightsail (Bedrock連携)

- **発表日**: 2026年3月4日
- **概要**: Amazon Lightsail 上でオープンソースのプライベートAIアシスタント「OpenClaw」をデプロイ可能に。Amazon Bedrock がデフォルトのモデルプロバイダーとして統合されている。
- **主な特徴**:
  - デフォルトモデルは Anthropic Claude Sonnet 4.6
  - サンドボックス化されたエージェントセッション
  - ワンクリックHTTPS、デバイスペアリング認証
  - Slack、Telegram、WhatsApp、Discord、Microsoft Teamsとの連携
  - シェルコマンド実行を含むツール利用が可能
- **対応リージョン**: Amazon Lightsailが利用可能な全AWSリージョン
- **参照**: [Introducing OpenClaw on Amazon Lightsail](https://aws.amazon.com/blogs/aws/introducing-openclaw-on-amazon-lightsail-to-run-your-autonomous-private-ai-agents/)

---

## 2. 直近の関連アップデート（参考: 2月後半〜3月上旬）

| 日付 | アップデート内容 |
|------|-----------------|
| 2026/02/04 | Amazon Bedrock で Structured Outputs (構造化出力) が利用可能に |
| 2026/02/10 | 6つの新しいオープンウェイトモデルを追加 (DeepSeek V3.2, MiniMax M2.1, GLM 4.7, GLM 4.7 Flash, Kimi K2.5, Qwen3 Coder Next) |
| 2026/02/17 | Claude Sonnet 4.6 が Amazon Bedrock で利用可能に |
| 2026/02/17 | Reinforcement Fine-Tuning (RFT) がオープンウェイトモデルに対応、OpenAI互換Fine-Tuning APIを導入 |
| 2026/02/26 | OpenAI互換 Projects API を発表 |
| 2026/03/03 | Bedrock AgentCore Policy が GA |
| 2026/03/04 | OpenClaw on Amazon Lightsail (Bedrock連携) |

---

## 3. ブログネタ提案

### 提案1: 「Amazon Bedrock AgentCore Policy で実現する "コードに触らない" AIエージェントガバナンス」

- **切り口**: エージェントのセキュリティ制御をコード外で宣言的に管理できるという新しいパラダイムを解説
- **ポイント**:
  - 自然言語 → Cedar への自動変換がどう機能するか、実際に試してみる
  - AgentCore Gateway のインターセプト方式の仕組み図を作成
  - エンタープライズでのAIエージェント導入時にセキュリティチームが抱える懸念をどう解消するか
- **想定読者**: AIエージェントをプロダクションで運用したい企業のセキュリティ担当・プラットフォームエンジニア
- **注目度**: 高 -- エージェントのガバナンスは業界全体の課題であり、AWSの具体的な解をいち早く紹介する価値あり

### 提案2: 「OpenClaw + Amazon Lightsail でプライベートAIアシスタントを爆速構築してみた」

- **切り口**: ハンズオン形式で、Lightsail上にOpenClawをデプロイし、Bedrockモデルで自分専用のAIアシスタントを動かす
- **ポイント**:
  - セットアップ手順をスクリーンショット付きで紹介
  - Slack/Discord連携を実際にやってみる
  - Claude Sonnet 4.6 から他モデルへの切り替え方法
  - セルフホスト型AIアシスタントのメリット（データプライバシー、カスタマイズ性）
- **想定読者**: 個人開発者、小規模チームでAIアシスタントを使いたい人
- **注目度**: 中〜高 -- 「自分専用AI」という文脈は個人ブログ・技術コミュニティで関心が高い

### 提案3: 「Amazon Bedrock の OpenAI 互換エコシステム全体像 -- Mantle, Projects API, Structured Outputs」

- **切り口**: 2月〜3月のアップデートを俯瞰し、BedrockのOpenAI互換戦略の全体像をまとめる
- **ポイント**:
  - Mantle 推論エンジンとは何か
  - Projects API による組織的なワークロード管理
  - Structured Outputs、Reinforcement Fine-Tuning の OpenAI互換APIサポート
  - 既存のOpenAI SDKからの移行パス
- **想定読者**: 現在OpenAI APIを使っているがAWS移行を検討している開発者・アーキテクト
- **注目度**: 高 -- OpenAI互換化はAWSの重要戦略であり、包括的なまとめ記事のニーズが高い

---

## Sources

- [AWS Weekly Roundup (March 9, 2026)](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-amazon-connect-health-bedrock-agentcore-policy-gameday-europe-and-more-march-9-2026/)
- [Policy in Amazon Bedrock AgentCore is now generally available](https://aws.amazon.com/about-aws/whats-new/2026/03/policy-amazon-bedrock-agentcore-generally-available/)
- [Amazon Bedrock announces OpenAI-compatible Projects API](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-bedrock-projects-api-mantle-inference-engine/)
- [Introducing OpenClaw on Amazon Lightsail](https://aws.amazon.com/blogs/aws/introducing-openclaw-on-amazon-lightsail-to-run-your-autonomous-private-ai-agents/)
- [Amazon Lightsail now offers OpenClaw](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-lightsail-openclaw/)
- [Amazon Bedrock AgentCore Policy Reaches GA - AWSInsider](https://awsinsider.net/blogs/awsinsider-release-radar/2026/03/amazon-bedrock-agentcore.aspx)
- [Amazon Bedrock adds support for six open weights models](https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-bedrock-adds-support-six-open-weights-models/)
- [Claude Sonnet 4.6 available in Amazon Bedrock](https://aws.amazon.com/about-aws/whats-new/2026/02/claude-sonnet-4.6-available-in-amazon-bedrock/)
- [Structured Outputs available in Amazon Bedrock](https://aws.amazon.com/about-aws/whats-new/2026/02/structured-outputs-available-amazon-bedrock/)
