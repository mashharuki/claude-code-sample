# AWS 最新ニュースまとめ（2026年3月5日〜11日）

## AI・機械学習

### Amazon Bedrock AgentCore Policy が一般提供開始
AIエージェントのツールアクセスや入力バリデーションルールを、自然言語で定義できる集中管理型のポリシー機能が一般提供（GA）となった。自然言語で記述されたポリシーはCedar（AWSオープンソースポリシー言語）に自動変換され、AgentCore Gatewayがエージェントとツール間のトラフィックを傍受してポリシーを評価する。13のAWSリージョンで利用可能。

- [公式アナウンス](https://aws.amazon.com/about-aws/whats-new/2026/03/policy-amazon-bedrock-agentcore-generally-available/)
- [AWS News Blog](https://aws.amazon.com/blogs/aws/amazon-bedrock-agentcore-adds-quality-evaluations-and-policy-controls-for-deploying-trusted-ai-agents/)

### Strands Labs の立ち上げ
AWSが実験的なエージェントAIプロジェクトを支援するため、Strands Labsを独立したGit組織として新設。ローンチ時には「Robots」「Robots Sim」「AI Functions」の3プロジェクトが公開された。

- [AWS Weekly Roundup（3月2日）](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-openai-partnership-aws-elemental-inference-strands-labs-and-more-march-2-2026/)

### AWS Elastic Beanstalk にAI環境分析機能を追加
環境の劣化時にイベント、インスタンスヘルス、ログを収集し、Amazon Bedrockに送信してステップバイステップのトラブルシューティング推奨を提供する新機能が追加された。

---

## ヘルスケア

### Amazon Connect Health が一般提供開始
ヘルスケア向けに5つのAIエージェントを搭載した Amazon Connect Health が GA となった。各エージェントの機能は以下の通り：

| AIエージェント | 機能 |
|---|---|
| 患者確認 | 患者の本人確認 |
| 予約管理 | 予約のスケジューリング |
| 患者インサイト | 患者情報の分析 |
| アンビエントドキュメンテーション | 診療記録の自動作成 |
| 医療コーディング | 医療コードの自動付与 |

全機能がHIPAA対応で、既存の臨床ワークフローに数日でデプロイ可能。

- [AWS Weekly Roundup（3月9日）](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-amazon-connect-health-bedrock-agentcore-policy-gameday-europe-and-more-march-9-2026/)

---

## メディア・動画

### AWS Elemental Inference の提供開始
ライブおよびオンデマンド動画をモバイル・ソーシャルプラットフォーム向けにリアルタイムで自動変換するフルマネージドAIサービス。AI搭載のクロッピング機能により、TikTok、Instagram Reels、YouTube Shortsに最適化された縦型フォーマットを自動生成する。

- [AWS Weekly Roundup（3月2日）](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-openai-partnership-aws-elemental-inference-strands-labs-and-more-march-2-2026/)

---

## セキュリティ

### AWS Security Hub Extended の提供
AWS検出サービスとキュレーションされたパートナーソリューションを統合し、フルスタックのエンタープライズセキュリティソリューションを提供するプランが発表された。調達、デプロイ、統合を簡素化する。

### VPC暗号化コントロールが有料化
2026年3月1日より、VPC暗号化コントロールが無料プレビューから有料機能に移行。リージョン内のVPC間およびVPC内のすべてのトラフィックフローに対して、転送中の暗号化を監査・強制する機能を提供する。

---

## コンピューティング

### Amazon EC2 G7eインスタンスが一般提供開始
G6eインスタンスと比較して最大2.3倍の推論パフォーマンスを実現し、GPUメモリは2倍。最大8 GPUで合計768 GBのGPUメモリをサポートする。US East (N. Virginia) および US East (Ohio) で利用可能。

### OpenClaw on Amazon Lightsail
プライベートなセルフホスト型AIアシスタント「OpenClaw」をAmazon Lightsail上に簡単にデプロイできるようになった。Slack、Telegram、WhatsApp、Discordなどのメッセージングプラットフォームとの統合が可能で、メール管理やウェブブラウジング、ファイル整理などのタスクを実行できる。

- [公式アナウンス](https://aws.amazon.com/about-aws/whats-new/2026/03/amazon-lightsail-openclaw/)
- [AWS News Blog](https://aws.amazon.com/blogs/aws/introducing-openclaw-on-amazon-lightsail-to-run-your-autonomous-private-ai-agents/)

---

## コンテナ・Kubernetes

### Amazon EKS Node Monitoring Agent がオープンソース化
EKSノード監視エージェントのソースコードがGitHubで公開された。ノードログを読み取ってヘルス問題を検出し、特にGPUワークロードの障害検出に有用。EKS Auto Modeに含まれ、EKSアドオンとして全リージョンで利用可能。

- [公式アナウンス](https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-eks-node-monitoring-agent-open-source/)
- [GitHub](https://github.com/aws/eks-node-monitoring-agent)

---

## コスト最適化

### Database Savings Plans の対象サービス拡大
Amazon OpenSearch ServiceとAmazon Neptune Analyticsが Database Savings Plans の対象に追加。1年間のコミットメントで、対象のサーバーレスおよびプロビジョンドインスタンスの利用料が最大35%削減される。

---

## コミュニティ・イベント

### JAWS Days 2026（3月7日開催済み）
世界最大のAWSコミュニティイベント「JAWS Days 2026」が3月7日に開催され、1,500名以上が参加。100以上の技術・コミュニティセッションが実施された。

### AWS Community GameDay Europe（3月17日開催予定）
23カ国から55のAWSユーザーグループが参加するゲーミフィケーション型学習イベント。チームで実際のクラウド課題に取り組む。

- [GameDay Europe](https://www.awsgameday.eu/)

---

## パートナーシップ

### OpenAIとの提携
AWSとOpenAIのパートナーシップが発表された。

- [AWS Weekly Roundup（3月2日）](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-openai-partnership-aws-elemental-inference-strands-labs-and-more-march-2-2026/)

---

*情報ソース: AWS News Blog、AWS What's New*

- [AWS Weekly Roundup（3月9日）](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-amazon-connect-health-bedrock-agentcore-policy-gameday-europe-and-more-march-9-2026/)
- [AWS Weekly Roundup（3月2日）](https://aws.amazon.com/blogs/aws/aws-weekly-roundup-openai-partnership-aws-elemental-inference-strands-labs-and-more-march-2-2026/)
- [AWS What's New](https://aws.amazon.com/new/)
- [Newsy Today - AWS News Roundup](https://www.newsy-today.com/aws-news-roundup-ai-agents-connect-health-new-services-march-2026-updates/)
