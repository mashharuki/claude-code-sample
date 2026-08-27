# AWS アイコンガイド

`scripts/dio.py` の `AWS` 辞書に、2026-08-27 時点で `mcp__drawio__search_shapes` により
検証済みのスタイル文字列を収録している。Python から使う場合は `AWS["ec2"]` のように
参照するだけでよい。手でXMLを書く場合は、このファイルの表からコピーするか、
載っていないサービスは **必ず `search_shapes` で再検索する**(記憶で `resIcon=` を書かない — 
draw.io のシェイプ名はAWSのサービス改廃やアイコンセット更新で変わることがある)。

## カテゴリ色(AWS4 2021+ アイコンセット)

| カテゴリ | 色 | 該当サービス例 |
|---|---|---|
| Compute | `#ED7100`(オレンジ) | EC2, Lambda, ECS/Fargate, EKS, ECR |
| Storage | `#7AA116`(緑) | S3, EBS, Backup |
| Database | `#C925D1`(マゼンタ) | RDS, DynamoDB, Aurora |
| Networking & Content Delivery | `#8C4FFF`(紫) | ALB/NLB, Route 53, CloudFront, Transit Gateway, NAT GW, Direct Connect, VPN, OpenSearch |
| Analytics | `#8C4FFF`(紫、Networkingと共用) | Glue, Athena, Kinesis, Redshift |
| App Integration | `#E7157B`(ピンク) | EventBridge, SQS, SNS, CloudWatch, Systems Manager |
| Security, Identity & Compliance | `#DD344C`(赤) | WAF, Shield, GuardDuty, Cognito, Secrets Manager, KMS, IAM Role |
| Machine Learning | `#01A88D`(teal) | Bedrock, Bedrock AgentCore, SageMaker |

色は意味を持たせるためのものなので、新しいサービスを追加するときも上記カテゴリに沿った色を選ぶ。

## 検証済みアイコン一覧(`scripts/dio.py` の `AWS` 辞書のキー)

`ec2` `lambda` `ecs_fargate` `eks` `ecr` `s3` `ebs` `backup` `rds` `dynamodb` `aurora`
`alb` `nlb` `route53` `cloudfront` `global_accelerator` `transit_gateway` `nat_gateway`
`direct_connect` `vpn_gateway` `internet_gateway` `vpc_endpoint` `opensearch` `glue`
`athena` `kinesis` `kinesis_data_analytics` `redshift` `quicksight` `eventbridge` `sqs`
`sns` `api_gateway` `waf` `shield` `guardduty` `cognito` `secrets_manager` `kms`
`iam_role` `cloudwatch` `systems_manager` `organizations_account` `organizational_unit`
`control_tower` `cloudtrail` `config` `codepipeline` `codebuild` `bedrock`
`bedrock_agentcore` `sagemaker` `managed_blockchain` `mediaconvert` `iot_core`
`elasticache_redis` `user` `internet` `step_functions`

これらは全て 78x78px(actor/internetのみ 60x70, 60x60)の `mxgraph.aws4.resourceIcon` 系
スタイルで統一している。図の中で意図的にサイズを変える理由がなければ、このサイズのまま使う
(サイズを揃えると格段に整った印象になる)。

## コンテナ(グループ)の書き方

AWS4のグループシェイプは角に小さいアイコンが付くのが特徴。`scripts/dio.py` の `GROUPS` 辞書に
以下を用意している:

- `vpc` — VPC境界(水色)
- `public_subnet` / `private_subnet` / `isolated_subnet` — サブネット種別ごとの色分け
- `security_group` — セキュリティグループの点線囲み
- `region` — リージョン境界(角丸の実線、AWS4公式のgroupシェイプではなく汎用の枠。
  複数リージョンを1枚に並べるときに使う)
- `az` — アベイラビリティゾーン境界(角丸の点線)
- `tenant` — マルチテナント図でのテナント境界(オレンジ系)
- `generic` — 上記に当てはまらない汎用の囲み

**重要な仕様**: draw.io ではコンテナの子要素の `<mxGeometry x= y=>` は、コンテナ自身の
左上を原点とした**相対座標**になる(絶対座標ではない)。`scripts/dio.py` の
`Diagram.node(..., parent=<container_id>)` を使えば自動的にこの規約に従う。

## 使用例

```python
from dio import AWS, GROUPS, Diagram

d = Diagram()
vpc = d.container("VPC (10.0.0.0/16)", GROUPS["vpc"], 100, 100, 800, 600)
ec2 = d.node("Web Server", AWS["ec2"], 40, 60, parent=vpc)  # vpc内の相対座標
d.edge(ec2, ec2, "自己参照は通常しない")  # 例示のみ
d.save("output.drawio")
```

## 未収録サービスの調べ方

```
mcp__drawio__search_shapes(query="aws <サービス名の英語>", limit=5)
```

結果の `style` フィールドをそのまま `node()` の style 引数に渡す。複数候補が返る場合は、
`shape=mxgraph.aws4.resourceIcon;resIcon=...` 形式(78x78、他のアイコンと統一感がある)を
優先する。`mxgraph.aws3.*` (旧世代)や `productIcon`(縦長、80x110)は既存アイコンと
サイズ・世代が混ざって見た目が揃わなくなるため、同じ図の中で `aws4.resourceIcon` 系が
使えるならそちらを優先する。
