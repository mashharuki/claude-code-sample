# AI Engineering ブログアイデア集

AWS Community Builder（AI Engineering カテゴリ）向けのブログネタを体系的にまとめたリスト。
投稿先は Zenn / Qiita / dev.to を想定。

---

## カテゴリ別ネタリスト

### 1. Amazon Bedrock 関連

**入門・基礎:**
- Bedrock の基本的な使い方と料金体系を解説
- Bedrock で利用可能なモデル一覧と選び方ガイド
- Bedrock Playground で各モデルの性能を比較してみた
- Converse API を使ったマルチターン会話の実装

**応用・実践:**
- Bedrock + Lambda でサーバーレス AI チャットボットを構築
- Bedrock Knowledge Bases で社内 RAG システムを構築
- Bedrock Agents でツール使用可能な AI エージェントを作成
- Bedrock Guardrails でコンテンツフィルタリングを実装
- Bedrock Fine-tuning でドメイン特化モデルを作成
- Bedrock Flows でマルチステップ AI ワークフローを構築
- Bedrock Model Evaluation で複数モデルを定量比較

**アーキテクチャ:**
- Bedrock ベースの RAG アプリケーション設計パターン
- マルチモーダル AI アプリのサーバーレスアーキテクチャ
- Bedrock + Step Functions による AI パイプライン設計

### 2. Amazon SageMaker 関連

- SageMaker Studio の新UIを完全解説
- SageMaker Canvas でノーコード ML を体験
- SageMaker Pipelines で MLOps パイプラインを構築
- SageMaker Endpoints のオートスケーリング設定ガイド
- SageMaker でカスタムコンテナを使ったモデルデプロイ
- SageMaker Feature Store の活用パターン

### 3. Amazon Q 関連

- Amazon Q Developer でコーディング効率を上げる方法
- Amazon Q Business で社内ナレッジ検索を構築
- Amazon Q in Connect でカスタマーサポートを強化
- Amazon Q Apps でビジネスアプリをノーコード作成

### 4. AI/ML インフラ・最適化

- AWS Trainium / Inferentia によるコスト最適化
- Bedrock のスロットリング対策とリトライ戦略
- AI ワークロードの AWS コスト最適化テクニック
- Lambda のレスポンスストリーミングで AI 応答を高速化

### 5. 横断・統合系

- CDK で AI アプリのインフラを一発構築
- Terraform で Bedrock 環境を IaC 管理する
- GitHub Actions + AWS で AI アプリの CI/CD を構築
- CloudWatch で AI アプリのモニタリング・アラート設定
- AI アプリのセキュリティベストプラクティス（IAM設計含む）

### 6. 他サービス連携

- Bedrock + Amazon Kendra で高精度な検索 AI を構築
- Bedrock + Amazon Lex で音声対話 AI アシスタントを作成
- Bedrock + Amazon Connect でコールセンター AI を構築
- Textract + Bedrock で請求書自動処理システムを構築
- Rekognition + Bedrock でマルチモーダル分析システム

### 7. 比較・レビュー系

- Amazon Bedrock vs Azure OpenAI Service：料金・機能比較
- Claude on Bedrock vs Anthropic API 直接利用：どちらを選ぶべきか
- SageMaker vs Google Vertex AI：MLOps 機能比較
- Amazon Q vs GitHub Copilot：AI コーディングアシスタント比較

---

## ブログ執筆テンプレート

### 速報記事テンプレート
```
タイトル: 【速報】{サービス名}に{新機能}が追加されたので早速試してみた

1. TL;DR（3行まとめ）
2. 何が変わったのか
3. 実際に試してみた（スクリーンショット付き）
4. 料金への影響
5. まとめ・所感
```

### ハンズオン記事テンプレート
```
タイトル: {ゴール}を{サービスの組み合わせ}で実現する方法

1. この記事で作るもの（完成図）
2. 前提条件・環境
3. アーキテクチャ概要
4. ステップバイステップ実装
5. 動作確認
6. コスト試算
7. まとめ・応用アイデア
```

### 比較記事テンプレート
```
タイトル: {サービスA} vs {サービスB}：{観点}で徹底比較

1. 比較の背景・目的
2. 比較観点の定義
3. 各項目の比較（表形式）
4. ユースケース別おすすめ
5. まとめ
```

---

## 投稿プラットフォーム戦略

| プラットフォーム | 言語 | 特徴 | 推奨記事タイプ |
|---------------|------|------|-------------|
| **Qiita** | 日本語 | 日本最大の技術コミュニティ | ハンズオン、トラブルシュート |
| **Zenn** | 日本語 | 質の高い技術記事が集まる | 設計・アーキテクチャ、深い解説 |
| **dev.to** | 英語 | グローバル。CB評価で加点 | 速報、比較、チュートリアル |
| **Medium** | 英語 | SEOに強い | 長編・詳細な解説記事 |
| **note** | 日本語 | 非エンジニアにもリーチ | 体験談、キャリア系 |

**推奨戦略:**
- メイン: Zenn / Qiita で月2本以上
- 英語: dev.to で月1本（CB評価の加点になる）
- 日英両方で書くことで、同じネタで2本稼げる
