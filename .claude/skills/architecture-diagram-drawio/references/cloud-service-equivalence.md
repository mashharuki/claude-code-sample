# クラウドサービス対応表 (AWS ⇔ GCP ⇔ Azure)

テンプレートはAWSを主軸に作り込んである(draw.ioのAWS4シェイプライブラリが最も網羅的で
アイコンも綺麗なため)。GCP/Azure案件では、**同じレイアウト(コンテナ構造・矢印・色分けの
ルール)を維持したまま、アイコンだけをそのクラウドのものに差し替える**。ゼロからレイアウトを
作り直す必要はない。

## 差し替え手順

1. 対応表で相当サービスの英語名を確認する。
2. `mcp__drawio__search_shapes(query="gcp <サービス名>")` または `"azure <サービス名>"` で
   スタイル文字列を取得する(GCPは `mxgraph.gcp2.*`、Azureは `mxgraph.azure7.*` または
   `image;...image=https://app.diagrams.net/img/lib/azure2/...` 形式の画像シェイプが多い)。
3. `AWS["xxx"]` を使っている `node()` 呼び出しの style 引数だけを新しいスタイルに置き換える。
   ラベル・座標・親コンテナはそのまま流用できる。
4. GCPのグループ表現(VPC等)は `mxgraph.gcp2.*` に専用のコンテナシェイプがないことが多いので、
   `GROUPS["generic"]` (角丸の汎用枠)で代用し、ラベルでサービス名を明示する。

## 対応表

| 分類 | AWS | GCP | Azure |
|---|---|---|---|
| ロードバランサ | Application Load Balancer | Cloud Load Balancing | Azure Load Balancer / Application Gateway |
| CDN | CloudFront | Cloud CDN | Azure Front Door / CDN |
| DNS | Route 53 | Cloud DNS | Azure DNS |
| WAF | AWS WAF | Cloud Armor | Azure WAF |
| VM | EC2 | Compute Engine | Virtual Machines |
| コンテナオーケストレーション | EKS / ECS | GKE / Cloud Run | AKS / Container Apps |
| サーバーレス関数 | Lambda | Cloud Functions | Azure Functions |
| APIゲートウェイ | API Gateway | Apigee / API Gateway | API Management |
| リレーショナルDB | RDS / Aurora | Cloud SQL / AlloyDB | Azure SQL / Database for PostgreSQL |
| NoSQL DB | DynamoDB | Firestore / Bigtable | Cosmos DB |
| オブジェクトストレージ | S3 | Cloud Storage | Blob Storage |
| メッセージキュー | SQS | Pub/Sub (プル型) | Service Bus Queue |
| Pub/Sub | SNS / EventBridge | Pub/Sub | Event Grid |
| ストリーミング | Kinesis | Pub/Sub + Dataflow | Event Hubs |
| ETL | Glue | Dataflow / Dataproc | Data Factory |
| アドホック分析 | Athena | BigQuery | Synapse Analytics |
| DWH | Redshift | BigQuery | Synapse Analytics (Dedicated SQL Pool) |
| Secrets管理 | Secrets Manager | Secret Manager | Key Vault |
| 鍵管理(KMS) | KMS | Cloud KMS | Key Vault (Managed HSM) |
| IAM/ID基盤 | IAM + Cognito | Cloud IAM + Identity Platform | Entra ID (旧Azure AD) |
| 監視 | CloudWatch | Cloud Monitoring | Azure Monitor |
| 脅威検知 | GuardDuty | Security Command Center | Microsoft Defender for Cloud |
| Backup | AWS Backup | Backup and DR Service | Azure Backup |
| CI/CDパイプライン | CodePipeline + CodeBuild | Cloud Build + Cloud Deploy | Azure Pipelines |
| コンテナレジストリ | ECR | Artifact Registry | Container Registry |
| Transit/Hub-Spoke | Transit Gateway | Network Connectivity Center | Virtual WAN |
| Direct接続 | Direct Connect | Cloud Interconnect | ExpressRoute |
| マネージドML | SageMaker | Vertex AI | Azure Machine Learning |
| 生成AI基盤 | Bedrock | Vertex AI (Gemini) | Azure OpenAI Service |
| Managed Blockchain | Managed Blockchain | Blockchain Node Engine | (主要マネージドサービスなし。VM上に自前構築が一般的) |

## GCP/Azureの汎用クラウドアイコン(構成の全体像だけ示したい場合)

- GCP: `search_shapes(query="gcp cloud generic")` → `mxgraph.gcp2.*` 系。
- Azure: `search_shapes(query="azure generic cloud")` →
  `shape=mxgraph.office.clouds.azure;fillColor=#505050;...` または
  `image=https://app.diagrams.net/img/lib/azure2/general/Azure.svg` 系の画像シェイプ。

いずれも `w`/`h` は検索結果の値をそのまま使う(統一サイズにしたい場合は `width`/`height` を
上書きしてよいが、Azureの画像シェイプは `aspect=fixed` が付くことが多いので縦横比は崩さない)。
