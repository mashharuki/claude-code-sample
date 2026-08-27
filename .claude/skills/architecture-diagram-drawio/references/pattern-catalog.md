# パターンカタログ

各テンプレートは `templates/<category>/<name>.drawio` にある。draw.io デスクトップ/Web版で
直接開けるほか、`mcp__drawio__list_pages` / `get_page` で内容を読み取れる。

複数パターンを組み合わせたいとき(例:「サーバーレスAPIをマルチリージョンでDR構成にしたい」)は、
片方をベースにもう片方の要素(リージョンコンテナ、Route 53 等)を移植する。

## AWS (`templates/aws/`)

| ファイル | 何を示す図か | 主な要素 | こういう要望で使う |
|---|---|---|---|
| `3tier-web-app-multi-az.drawio` | Web/App/DB 3層をMulti-AZで冗長化 | ALB, EC2 ASG, RDS Multi-AZ, WAF, NAT GW | 「典型的なWebアプリの構成図」「可用性を意識した3層構成」 |
| `serverless-event-driven-api.drawio` | フルサーバーレスAPI + 非同期処理 | API Gateway, Lambda, DynamoDB, EventBridge, SQS, SNS | 「サーバーレスで作りたい」「イベント駆動のAPI」 |
| `microservices-containers.drawio` | コンテナ基盤上のマイクロサービス群 | EKS, ECS Fargate, ECR, RDS/DynamoDB/SQSへの接続 | 「マイクロサービス」「Kubernetes構成」 |
| `data-lake-analytics-pipeline.drawio` | 取り込み→変換→分析のデータ基盤 | Kinesis, S3(Raw/Curated), Glue, Athena, Redshift | 「データ基盤」「分析パイプライン」「ETL」 |
| `multi-region-active-active-dr.drawio` | 2リージョン同時稼働の高可用性構成 | Route 53, Global Accelerator, Aurora Global DB, S3 CRR | 「マルチリージョン」「Active-Active」「可用性を最大化したい」 |
| `multi-region-pilot-light-backup-dr.drawio` | バックアップ&リストア/Pilot Light型DR | AWS Backup, S3クロスリージョンレプリケーション, RDS Read Replica | 「DR構成」「バックアップリカバリー」「RTO/RPOを意識した設計」 |
| `hub-and-spoke-network.drawio` | Transit Gatewayによる集約ネットワーク | Transit Gateway, Direct Connect, VPN, 複数VPC | 「マルチVPC」「ネットワーク基盤」「オンプレ接続」 |
| `cicd-pipeline.drawio` | ソース→ビルド→ステージング→本番 | CodePipeline, CodeBuild, ECR, ECS(Staging/Prod) | 「CI/CD構成」「デプロイパイプライン」 |
| `multi-tenant-saas-pool-model.drawio` | 全テナント共有インフラ(Poolモデル) | 共有ECS, DynamoDB(tenant_idパーティション) | 「マルチテナントSaaS」「コスト効率重視のテナント分離」 |
| `multi-tenant-saas-silo-model.drawio` | テナントごとに完全分離(Siloモデル) | テナント別ALB/ECS/RDS/S3/KMS | 「テナントを完全に分離したい」「エンタープライズ向けSaaS」 |
| `zero-trust-identity-auth.drawio` | ゼロトラストな認証・認可フロー | Cognito, Lambda Authorizer, WAF, GuardDuty, Secrets Manager | 「認証基盤」「ゼロトラスト」「OIDC/SAML構成」 |
| `waf-cdn-edge-security.drawio` | エッジでの防御(CDN+WAF+Shield) | CloudFront, WAF, Shield, GuardDuty | 「セキュリティ構成」「DDoS対策」「エッジ保護」 |
| `static-site-jamstack.drawio` | 静的サイト/SPAホスティング(JAMstack) | S3, CloudFront(+Lambda@Edge), Route 53, API Gateway+Lambda(動的API) | 「静的サイト」「SPA」「JAMstack構成」 |
| `realtime-websocket-chat.drawio` | リアルタイム双方向通信(チャット等) | API Gateway WebSocket API, Lambda($connect/$default), DynamoDB(Connections) | 「WebSocket」「チャット」「リアルタイム通知」 |
| `media-processing-pipeline.drawio` | 動画/音声のアップロード〜配信 | S3, MediaConvert, EventBridge, CloudFront | 「動画配信」「トランスコード」「メディア処理」 |
| `search-platform-opensearch.drawio` | 全文検索基盤 | Glue ETL, OpenSearch, API Gateway+Lambda(検索API) | 「検索機能」「全文検索」「OpenSearch」 |
| `iot-ingestion-pipeline.drawio` | IoTデバイスからのデータ収集基盤 | IoT Core, Kinesis Data Streams/Analytics, S3, DynamoDB, QuickSight | 「IoT」「デバイスデータ収集」「センサーデータ基盤」 |
| `landing-zone-multi-account.drawio` | マルチアカウント統治基盤 | Control Tower, Organizations(OU), Log Archive/Audit Account, IAM Identity Center | 「マルチアカウント」「Landing Zone」「アカウント統治」「ガバナンス」 |
| `caching-layer-cache-aside.drawio` | Cache-Asideキャッシュパターン | ElastiCache(Redis), RDS | 「キャッシュ」「Redis」「読み取り高速化」 |
| `warm-standby-dr.drawio` | 縮小構成で常時稼働するDR(Pilot LightとActive-Activeの中間) | ALB/EC2/RDSを両リージョンに配置、DR側は最小構成で稼働 | 「Warm Standby」「中間レベルのDR」 |

## ブロックチェーン (`templates/blockchain/`)

| ファイル | 何を示す図か | 主な要素 |
|---|---|---|
| `dapp-fullstack.drawio` | フロントエンド〜オンチェーンまでのdApp全体構成 | Wallet, Frontend, RPC Provider, Smart Contract, Indexer |
| `l1-node-validator-architecture.drawio` | L1ノード/バリデータの構成 | Full Node Pool, Validator Set, State DB, 監視 |
| `cross-chain-bridge.drawio` | チェーン間ブリッジのRelayer構成 | Lock/Burn Contract, Relayer Network, Mint/Release Contract |
| `oracle-integration.drawio` | オフチェーンデータのオンチェーン反映 | 外部データソース, Oracle Node Network, Oracle Contract |
| `mpc-wallet-custody.drawio` | MPCによる秘密鍵の分散管理 | Key Shard Network, 閾値署名ポリシー, 監査ログ |
| `rollup-l2-architecture.drawio` | L2ロールアップの構成 | Sequencer, Execution Engine, Prover/Batcher, L1コントラクト |
| `nft-marketplace.drawio` | NFTの出品・購入・ロイヤリティ分配の全体構成 | NFT Contract, Marketplace Contract(エスクロー), IPFS/Arweave, Indexer, ロイヤリティ分配 |
| `x402-agentic-payments.drawio` | HTTP 402ベースのエージェント自動決済フロー | Client(AI Agent), Server(Seller Middleware), Facilitator(/verify, /settle), オンチェーン決済(USDC) |
| `dex-amm.drawio` | AMM型分散型取引所(DEX)の構成 | Router Contract, Liquidity Pool(x*y=k), LP, Factory Contract, Price Oracle(TWAP) |
| `cex-architecture.drawio` | 中央集権型取引所(CEX)のバックエンド構成 | Matching Engine(オーダーブック), Ledger DB, Hot/Cold Wallet, Deposit Monitor, Risk & Compliance |
| `dao-governance.drawio` | DAOのガバナンス(提案〜投票〜実行)フロー | Governance Token, Governor Contract, Timelock Controller, Treasury/Multisig, Snapshot |
| `defi-lending-protocol.drawio` | 担保付き融資プロトコルの構成 | Lending Pool Contract, Price Oracle, Liquidation Bot, Liquidator |
| `staking-liquid-staking.drawio` | (Liquid)Stakingの預入〜報酬〜出金フロー | Liquid Staking Protocol, Validator Set, Liquid Staking Token(LST), 出金キュー(Unbonding) |
| `perpetuals-dex.drawio` | 無期限先物DEXのポジション/清算管理 | Perpetuals Contract, Liquidity Vault, Funding Rate, Liquidation Engine, Insurance Fund |
| `stablecoin.drawio` | 過剰担保型ステーブルコイン(CDP型)の構成 | Vault/CDP Contract, Price Oracle, Liquidation, Peg Stability Module, Governance |
| `token-launchpad.drawio` | トークンセール(ICO/IDO)の募集〜配布フロー | Launchpad Platform, Token Sale Contract, Whitelist/KYC, Vesting Contract, 初期流動性 |
| `prediction-market.drawio` | 予測市場の取引〜解決フロー(Polymarket型) | Off-chain CLOB, Gnosis Conditional Tokens Framework, UMA Optimistic Oracle, UMA DVM(異議時投票) |
| `rwa-tokenization.drawio` | 実物資産(不動産/国債等)のトークン化フロー | SPV/Trust, Qualified Custodian, Proof-of-Reserve, Oracle Network, ERC-3643 Token, Identity Registry |

`prediction-market.drawio` と `rwa-tokenization.drawio` は実在するプロトコル(Polymarket、
ERC-3643/T-REX)の公開アーキテクチャ資料を調査した上で作成した(2026-08-28)。特に以下の
用語・仕組みは実装依存度が高いので、具体的な要件がある場合は最新のドキュメントで再確認する
こと: UMAのチャレンジ期間の長さ(記事執筆時点で標準2時間、2025年11月にMOOV2へアップグレードされ
提案者が37の承認済みアドレスに制限された)、ERC-3643のIdentity Registry実装詳細。

## AI / ML (`templates/ai/`)

| ファイル | 何を示す図か | 主な要素 |
|---|---|---|
| `rag-pipeline.drawio` | RAG(検索拡張生成)の全体フロー | Embedding, Vector DB, Retriever, LLM, Guardrails |
| `multi-agent-orchestration.drawio` | オーケストレータ+サブエージェント構成 | Orchestrator, Sub-Agents, Tools/MCP Servers, メモリ |
| `llm-inference-gateway.drawio` | 複数LLMプロバイダを束ねるゲートウェイ | Gateway, セマンティックキャッシュ, レート制限, 観測性 |
| `mcp-server-architecture.drawio` | MCPサーバーの内部構成 | MCP Client, Tools/Resources/Prompts, 認証 |
| `vector-db-architecture.drawio` | ベクトルDBの内部構成 | ANNインデックス, メタデータフィルタ, シャーディング |
| `fine-tuning-pipeline.drawio` | モデルのファインチューニング工程 | データ前処理, GPU Cluster, 評価, モデルレジストリ |

## クラウド非依存の汎用設計パターン (`templates/patterns/`)

AWS/GCP/Azureのどれにも縛られない、分散システムの設計パターン。特定のクラウドサービスに
依存しないため、`GENERIC`の汎用シェイプで構成している。実装時にどのクラウド/フレームワークを
使っても、このレイアウトのまま流用できる。

| ファイル | 何を示す図か | 主な要素 |
|---|---|---|
| `cqrs-event-sourcing.drawio` | CQRS + Event Sourcing | Command Handler, Event Store(Append-Only), Projector, Read Model |
| `saga-pattern.drawio` | Sagaパターン(オーケストレーション方式の分散トランザクション) | Saga Orchestrator, 各サービス, 補償トランザクション |
| `circuit-breaker-bulkhead.drawio` | Circuit Breaker + Bulkhead(耐障害性パターン) | Circuit Breaker(状態遷移), Bulkhead(プール分離), Fallback |
| `strangler-fig-migration.drawio` | Strangler Fig(レガシー移行パターン) | Facade/Router, Legacy Monolith, 新Microservices |
| `backend-for-frontend.drawio` | BFF(Backend for Frontend) | Web/Mobile/Partner向けBFF, 共有バックエンドサービス群 |

## 選び方のヒント

- 「可用性・耐障害性・DR」を主眼に置きたい → `multi-region-active-active-dr` or
  `multi-region-pilot-light-backup-dr`(RTO/RPO要件で使い分け。詳細は `ha-dr-patterns.md`)。
- 「認証・セキュリティ」を主眼に置きたい → `zero-trust-identity-auth` +
  `waf-cdn-edge-security` を組み合わせる(詳細は `security-patterns.md`)。
- 「マルチテナント」を主眼に置きたい → コスト重視なら `pool-model`、分離重視なら
  `silo-model`(詳細は `multi-tenant-patterns.md`)。
- 「サーバーレス」を主眼に置きたい → `serverless-event-driven-api` がベース。
