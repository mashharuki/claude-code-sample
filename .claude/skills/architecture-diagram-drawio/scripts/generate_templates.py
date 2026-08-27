#!/usr/bin/env python3
"""
Generates every bundled .drawio template under ../templates/.

This is the source of truth for the templates - if a template needs a
layout tweak, edit the corresponding build_* function here and re-run this
script, rather than hand-editing the XML output.

Usage: python3 generate_templates.py
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))
from dio import AWS, GENERIC, GROUPS, Diagram, EDGE_STYLE, EDGE_STYLE_BOLD  # noqa: E402
import web3icons as w3  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "..", "templates")

ICON = 78


# ---------------------------------------------------------------------------
# AWS templates
# ---------------------------------------------------------------------------

def build_3tier_web_app_multi_az() -> Diagram:
    d = Diagram(width=1720, height=1180)
    d.text("3-Tier Web Application - Multi-AZ High Availability (AWS)", 40, 20, 900, 30)

    user = d.node("User", AWS["user"], 40, 420, 60, 70)
    igw = d.node("Internet Gateway", AWS["internet_gateway"], 220, 415, ICON, ICON)
    waf = d.node("AWS WAF", AWS["waf"], 220, 250, ICON, ICON)
    alb = d.node("Application\nLoad Balancer", AWS["alb"], 360, 415, ICON, ICON)

    vpc = d.container("VPC (10.0.0.0/16)", GROUPS["vpc"], 500, 80, 1180, 1040)

    for i, az in enumerate(["ap-northeast-1a", "ap-northeast-1c"]):
        ax = 40 + i * 580
        az_box = d.container(f"Availability Zone: {az}", GROUPS["az"], ax, 60, 540, 940, parent=vpc)

        pub = d.container("Public Subnet", GROUPS["public_subnet"], 30, 60, 480, 160, parent=az_box)
        nat = d.node("NAT Gateway", AWS["nat_gateway"], 200, 60, ICON, ICON, parent=pub)

        app = d.container("Private App Subnet", GROUPS["private_subnet"], 30, 260, 480, 260, parent=az_box)
        asg = d.node(f"EC2 Auto Scaling\n(App Server {i+1})", AWS["ec2"], 200, 90, ICON, ICON, parent=app)

        db = d.container("Isolated DB Subnet", GROUPS["isolated_subnet"], 30, 560, 480, 340, parent=az_box)
        role = "RDS Primary" if i == 0 else "RDS Standby"
        rds = d.node(role, AWS["rds"], 200, 120, ICON, ICON, parent=db)

        d.edge(alb, asg, "HTTPS", dashed=False)
        d.edge(asg, rds, "SQL")
        if i == 0:
            rds_primary = rds
        else:
            rds_standby = rds

    d.edge(rds_primary, rds_standby, "同期レプリケーション (Multi-AZ)", dashed=True)
    d.edge(user, igw, "")
    d.edge(igw, waf, "")
    d.edge(waf, alb, "検査済みトラフィック")

    cw = d.node("CloudWatch", AWS["cloudwatch"], 40, 1000, ICON, ICON)
    d.edge(cw, vpc, "メトリクス/ログ", dashed=True, style=EDGE_STYLE_BOLD)
    return d


def build_serverless_event_driven_api() -> Diagram:
    d = Diagram(width=1720, height=760)
    d.text("Serverless Event-Driven API (AWS)", 40, 20, 700, 30)

    user = d.node("Client App", AWS["user"], 40, 260, 60, 70)
    cognito = d.node("Cognito\nUser Pool", AWS["cognito"], 40, 400, ICON, ICON)
    apigw = d.node("API Gateway\n(REST/HTTP)", AWS["api_gateway"], 220, 260, ICON, ICON)
    lam = d.node("Lambda\n(Business Logic)", AWS["lambda"], 400, 260, ICON, ICON)
    ddb = d.node("DynamoDB", AWS["dynamodb"], 580, 260, ICON, ICON)

    eb = d.node("EventBridge", AWS["eventbridge"], 400, 440, ICON, ICON)
    sqs = d.node("SQS\n(非同期処理)", AWS["sqs"], 580, 440, ICON, ICON)
    lam2 = d.node("Lambda\n(Async Worker)", AWS["lambda"], 760, 440, ICON, ICON)
    sns = d.node("SNS\n(通知)", AWS["sns"], 940, 440, ICON, ICON)
    s3 = d.node("S3\n(結果保存)", AWS["s3"], 760, 260, ICON, ICON)

    d.edge(user, apigw, "HTTPS")
    d.edge(apigw, cognito, "JWT検証", dashed=True)
    d.edge(apigw, lam, "invoke")
    d.edge(lam, ddb, "read/write")
    d.edge(lam, eb, "put event")
    d.edge(lam, s3, "store result")
    d.edge(eb, sqs, "route")
    d.edge(sqs, lam2, "poll")
    d.edge(lam2, sns, "publish")
    return d


def build_microservices_containers() -> Diagram:
    d = Diagram(width=1720, height=980)
    d.text("Microservices on Containers - EKS + Service Mesh (AWS)", 40, 20, 900, 30)

    user = d.node("User", AWS["user"], 40, 400, 60, 70)
    alb = d.node("ALB / Ingress", AWS["alb"], 200, 400, ICON, ICON)

    vpc = d.container("VPC", GROUPS["vpc"], 340, 80, 1340, 860, )
    eks = d.container("EKS Cluster", GROUPS["generic"], 40, 60, 1260, 560, parent=vpc)

    services = ["Orders Svc", "Payments Svc", "Inventory Svc", "Notification Svc"]
    svc_ids = []
    for i, name in enumerate(services):
        sx = 40 + i * 300
        svc = d.container(name, GROUPS["private_subnet"], sx, 60, 260, 220, parent=eks)
        pod = d.node("Pod (ECS/EKS)", AWS["ecs_fargate"], 90, 70, ICON, ICON, parent=svc)
        svc_ids.append((name, pod))

    ecr = d.node("ECR\n(container images)", AWS["ecr"], 40, 340, ICON, ICON, parent=eks)
    cw = d.node("CloudWatch\nContainer Insights", AWS["cloudwatch"], 240, 340, ICON, ICON, parent=eks)

    rds = d.node("RDS\n(Orders/Payments)", AWS["rds"], 40, 640, ICON, ICON, parent=vpc)
    ddb = d.node("DynamoDB\n(Inventory)", AWS["dynamodb"], 240, 640, ICON, ICON, parent=vpc)
    sqs = d.node("SQS\n(Notification Queue)", AWS["sqs"], 440, 640, ICON, ICON, parent=vpc)

    d.edge(user, alb, "HTTPS")
    d.edge(alb, vpc, "route")
    for name, pod in svc_ids:
        if "Orders" in name:
            d.edge(pod, rds, "SQL", dashed=True)
        if "Payments" in name:
            d.edge(pod, rds, "SQL", dashed=True)
        if "Inventory" in name:
            d.edge(pod, ddb, "R/W", dashed=True)
        if "Notification" in name:
            d.edge(pod, sqs, "consume", dashed=True)
    return d


def build_data_lake_analytics_pipeline() -> Diagram:
    d = Diagram(width=1780, height=560)
    d.text("Data Lake & Analytics Pipeline (AWS)", 40, 20, 700, 30)

    src = d.node("Application /\nOn-prem DB", GENERIC["box"], 40, 220, 160, 70)
    kinesis = d.node("Kinesis\nData Streams", AWS["kinesis"], 260, 210, ICON, ICON)
    s3raw = d.node("S3\n(Raw / Bronze)", AWS["s3"], 440, 210, ICON, ICON)
    glue = d.node("Glue ETL\n(変換 / クレンジング)", AWS["glue"], 620, 210, ICON, ICON)
    s3curated = d.node("S3\n(Curated / Gold)", AWS["s3"], 800, 210, ICON, ICON)
    athena = d.node("Athena\n(アドホック分析)", AWS["athena"], 980, 100, ICON, ICON)
    redshift = d.node("Redshift\n(DWH)", AWS["redshift"], 980, 320, ICON, ICON)
    glue_cat = d.node("Glue Data Catalog", AWS["glue"], 620, 380, ICON, ICON)
    bi = d.node("BI Dashboard\n(QuickSight等)", GENERIC["box_purple"], 1160, 210, 160, 70)

    d.edge(src, kinesis, "ingest")
    d.edge(kinesis, s3raw, "firehose")
    d.edge(s3raw, glue, "read")
    d.edge(glue, s3curated, "write")
    d.edge(glue, glue_cat, "catalog", dashed=True)
    d.edge(s3curated, athena, "query")
    d.edge(s3curated, redshift, "COPY / Spectrum")
    d.edge(athena, bi, "")
    d.edge(redshift, bi, "")
    return d


def build_multi_region_active_active_dr() -> Diagram:
    d = Diagram(width=1720, height=900)
    d.text("Multi-Region Active-Active (High Availability / DR)", 40, 20, 900, 30)

    user = d.node("User", AWS["user"], 40, 380, 60, 70)
    r53 = d.node("Route 53\n(Latency/Health-based Routing)", AWS["route53"], 200, 375, ICON, ICON)
    ga = d.node("Global\nAccelerator", AWS["global_accelerator"], 200, 500, ICON, ICON)

    regions = [("ap-northeast-1 (Tokyo)", 420), ("us-east-1 (N.Virginia)", 1080)]
    region_data = []
    for label, rx in regions:
        region = d.container(f"Region: {label}", GROUPS["region"], rx, 80, 560, 760)
        alb = d.node("ALB", AWS["alb"], 60, 100, ICON, ICON, parent=region)
        ecs = d.node("ECS Fargate\n(App)", AWS["ecs_fargate"], 220, 100, ICON, ICON, parent=region)
        s3 = d.node("S3\n(Cross-Region\nReplication)", AWS["s3"], 60, 260, ICON, ICON, parent=region)
        aurora = d.node("Aurora Global\nDatabase", AWS["aurora"], 220, 260, ICON, ICON, parent=region)
        cw = d.node("CloudWatch", AWS["cloudwatch"], 380, 260, ICON, ICON, parent=region)
        d.edge(alb, ecs, "")
        d.edge(ecs, aurora, "read/write")
        region_data.append({"alb": alb, "s3": s3, "aurora": aurora})

    d.edge(user, r53, "DNS lookup")
    d.edge(r53, ga, "", dashed=True)
    d.edge(r53, region_data[0]["alb"], "route (最寄りの正常なリージョンへ)")
    d.edge(r53, region_data[1]["alb"], "route (最寄りの正常なリージョンへ)")
    d.edge(region_data[0]["s3"], region_data[1]["s3"], "Cross-Region Replication", dashed=True)
    d.edge(region_data[0]["aurora"], region_data[1]["aurora"], "Global Database 同期 (< 1s)", dashed=True)
    return d


def build_multi_region_pilot_light_backup_dr() -> Diagram:
    d = Diagram(width=1600, height=820)
    d.text("Backup & Restore / Pilot Light Disaster Recovery (AWS)", 40, 20, 900, 30)

    primary = d.container("Primary Region: ap-northeast-1 (稼働中)", GROUPS["region"], 40, 80, 700, 660)
    alb = d.node("ALB", AWS["alb"], 60, 100, ICON, ICON, parent=primary)
    ec2 = d.node("EC2 Auto Scaling\n(本番稼働)", AWS["ec2"], 240, 100, ICON, ICON, parent=primary)
    rds = d.node("RDS Primary", AWS["rds"], 60, 260, ICON, ICON, parent=primary)
    backup = d.node("AWS Backup\n(定期スナップショット)", AWS["backup"], 240, 260, ICON, ICON, parent=primary)
    s3 = d.node("S3\n(バックアップ保管)", AWS["s3"], 420, 260, ICON, ICON, parent=primary)

    dr = d.container("DR Region: us-west-2 (Pilot Light: 最小構成で待機)", GROUPS["region"], 840, 80, 700, 660)
    ec2_dr = d.node("EC2\n(停止中 / 最小台数)", AWS["ec2"], 240, 100, ICON, ICON, parent=dr)
    rds_dr = d.node("RDS Read Replica\n(スタンバイ)", AWS["rds"], 60, 260, ICON, ICON, parent=dr)
    s3_dr = d.node("S3\n(レプリケート先)", AWS["s3"], 420, 260, ICON, ICON, parent=dr)
    r53_dr = d.node("Route 53\nヘルスチェック", AWS["route53"], 240, 420, ICON, ICON, parent=dr)

    d.edge(alb, ec2, "")
    d.edge(ec2, rds, "")
    d.edge(rds, backup, "定期バックアップ", dashed=True)
    d.edge(backup, s3, "保管")
    d.edge(s3, s3_dr, "クロスリージョン\nレプリケーション", dashed=True)
    d.edge(rds, rds_dr, "非同期レプリケーション", dashed=True)
    d.edge(r53_dr, ec2_dr, "障害検知時にフェイルオーバー\n(スケールアウト)", dashed=True, style=EDGE_STYLE_BOLD)
    return d


def build_hub_and_spoke_network() -> Diagram:
    d = Diagram(width=1600, height=900)
    d.text("Hub-and-Spoke Network with Transit Gateway (AWS)", 40, 20, 900, 30)

    tgw = d.node("Transit\nGateway", AWS["transit_gateway"], 720, 380, ICON, ICON)
    dx = d.node("Direct Connect", AWS["direct_connect"], 720, 60, ICON, ICON)
    vpn = d.node("Site-to-Site VPN", AWS["vpn_gateway"], 720, 700, ICON, ICON)
    onprem = d.node("On-premises\nData Center", GENERIC["box_gray"], 900, 60, 160, 70)

    hub = d.container("Hub VPC (Shared Services)", GROUPS["vpc"], 380, 300, 260, 260)
    dns = d.node("Route 53\nResolver", AWS["route53"], 90, 90, ICON, ICON, parent=hub)

    spokes = ["Prod VPC", "Staging VPC", "Dev VPC", "Security/Log VPC"]
    for i, name in enumerate(spokes):
        angle_x = [40, 40, 1220, 1220][i]
        angle_y = [80, 640, 80, 640][i]
        spoke = d.container(name, GROUPS["vpc"], angle_x, angle_y, 260, 220)
        ec2 = d.node("Workload", AWS["ec2"], 90, 90, ICON, ICON, parent=spoke)
        d.edge(tgw, spoke, "attachment")

    d.edge(dx, tgw, "")
    d.edge(vpn, tgw, "")
    d.edge(onprem, dx, "専用線")
    d.edge(tgw, hub, "attachment")
    return d


def build_cicd_pipeline() -> Diagram:
    d = Diagram(width=1720, height=460)
    d.text("CI/CD Pipeline (AWS CodePipeline)", 40, 20, 700, 30)

    dev = d.node("Developer", AWS["user"], 40, 190, 60, 70)
    repo = d.node("CodeCommit /\nGitHub", GENERIC["box"], 180, 190, ICON, ICON)
    pipeline = d.node("CodePipeline", AWS["codepipeline"], 360, 190, ICON, ICON)
    build = d.node("CodeBuild\n(test + build)", AWS["codebuild"], 540, 190, ICON, ICON)
    ecr = d.node("ECR\n(image registry)", AWS["ecr"], 720, 190, ICON, ICON)
    staging = d.container("Staging", GROUPS["generic"], 900, 100, 260, 180)
    ecs_stg = d.node("ECS Fargate", AWS["ecs_fargate"], 90, 70, ICON, ICON, parent=staging)
    prod = d.container("Production", GROUPS["generic"], 1220, 100, 260, 180)
    ecs_prod = d.node("ECS Fargate", AWS["ecs_fargate"], 90, 70, ICON, ICON, parent=prod)

    d.edge(dev, repo, "git push")
    d.edge(repo, pipeline, "trigger")
    d.edge(pipeline, build, "")
    d.edge(build, ecr, "push image")
    d.edge(ecr, staging, "deploy")
    d.edge(staging, prod, "承認後に昇格", dashed=True, style=EDGE_STYLE_BOLD)
    return d


def build_multi_tenant_saas_pool_model() -> Diagram:
    d = Diagram(width=1600, height=760)
    d.text("Multi-Tenant SaaS - Pool Model (Silo/Pool/Bridge の Pool)", 40, 20, 900, 30)

    tenant_ids = []
    for i in range(3):
        t = d.node(f"Tenant {chr(65+i)}", AWS["user"], 40, 120 + i * 160, 60, 70)
        tenant_ids.append(t)

    apigw = d.node("API Gateway\n(テナントコンテキスト付与)", AWS["api_gateway"], 220, 340, ICON, ICON)
    authz = d.node("Cognito\n(テナント別ユーザープール/属性)", AWS["cognito"], 220, 500, ICON, ICON)

    shared = d.container("共有コンピュート層 (Pool)", GROUPS["generic"], 420, 220, 460, 260)
    ecs = d.node("ECS Fargate\n(全テナント共用)", AWS["ecs_fargate"], 190, 90, ICON, ICON, parent=shared)

    ddb = d.node(
        "DynamoDB\n(パーティションキー = tenant_id)",
        AWS["dynamodb"], 980, 260, ICON, ICON,
    )
    metrics = d.node("CloudWatch\n(テナント別メトリクス)", AWS["cloudwatch"], 980, 460, ICON, ICON)

    for t in tenant_ids:
        d.edge(t, apigw, "")
    d.edge(apigw, authz, "認証", dashed=True)
    d.edge(apigw, shared, "route")
    d.edge(shared, ddb, "R/W (tenant_idでフィルタ)")
    d.edge(shared, metrics, "", dashed=True)
    return d


def build_multi_tenant_saas_silo_model() -> Diagram:
    d = Diagram(width=1680, height=760)
    d.text("Multi-Tenant SaaS - Silo Model (テナントごとに完全分離)", 40, 20, 900, 30)

    r53 = d.node("Route 53\n(tenant.example.comで振り分け)", AWS["route53"], 40, 340, ICON, ICON)

    for i in range(2):
        tx = 220 + i * 700
        silo = d.container(f"Tenant {chr(65+i)} 専用スタック", GROUPS["tenant"], tx, 80, 620, 620)
        alb = d.node("ALB", AWS["alb"], 40, 80, ICON, ICON, parent=silo)
        ecs = d.node("ECS Fargate", AWS["ecs_fargate"], 220, 80, ICON, ICON, parent=silo)
        rds = d.node("RDS\n(専用DB)", AWS["rds"], 40, 260, ICON, ICON, parent=silo)
        s3 = d.node("S3\n(専用バケット)", AWS["s3"], 220, 260, ICON, ICON, parent=silo)
        kms = d.node("KMS\n(テナント別CMK)", AWS["kms"], 400, 260, ICON, ICON, parent=silo)
        d.edge(r53, silo, "サブドメイン振り分け")
        d.edge(alb, ecs, "")
        d.edge(ecs, rds, "")
        d.edge(ecs, s3, "")
        d.edge(rds, kms, "暗号化", dashed=True)
    return d


def build_zero_trust_identity_auth() -> Diagram:
    d = Diagram(width=1680, height=620)
    d.text("Zero Trust Identity & Authentication (OIDC/SAML)", 40, 20, 900, 30)

    user = d.node("User / Device", AWS["user"], 40, 260, 60, 70)
    idp = d.node("Cognito\n(IdP / OIDC Provider)", AWS["cognito"], 220, 100, ICON, ICON)
    mfa = d.node("MFA\n(多要素認証)", GENERIC["box"], 220, 260, ICON, ICON)
    waf = d.node("WAF", AWS["waf"], 400, 260, ICON, ICON)
    apigw = d.node("API Gateway\n(JWT Authorizer)", AWS["api_gateway"], 580, 260, ICON, ICON)
    lam_authz = d.node("Lambda\nAuthorizer\n(認可判定)", AWS["lambda"], 760, 100, ICON, ICON)
    secrets = d.node("Secrets Manager", AWS["secrets_manager"], 760, 400, ICON, ICON)
    app = d.node("Application\n(最小権限IAMロール)", AWS["ec2"], 940, 260, ICON, ICON)
    iam = d.node("IAM Role\n(最小権限)", AWS["iam_role"], 1120, 260, ICON, ICON)
    guardduty = d.node("GuardDuty\n(異常検知)", AWS["guardduty"], 1120, 100, ICON, ICON)

    d.edge(user, idp, "ログイン")
    d.edge(idp, mfa, "", dashed=True)
    d.edge(user, waf, "APIリクエスト + JWT")
    d.edge(waf, apigw, "検査済み")
    d.edge(apigw, lam_authz, "認可検証")
    d.edge(lam_authz, idp, "JWKS検証", dashed=True)
    d.edge(apigw, app, "許可されたリクエストのみ")
    d.edge(app, secrets, "シークレット取得", dashed=True)
    d.edge(app, iam, "AssumeRole", dashed=True)
    d.edge(guardduty, app, "監視", dashed=True)
    return d


def build_waf_cdn_edge_security() -> Diagram:
    d = Diagram(width=1600, height=460)
    d.text("Edge Security: CDN + WAF + Shield (AWS)", 40, 20, 700, 30)

    user = d.node("User", AWS["user"], 40, 170, 60, 70)
    shield = d.node("Shield\n(DDoS対策)", AWS["shield"], 220, 60, ICON, ICON)
    cf = d.node("CloudFront\n(CDN)", AWS["cloudfront"], 220, 220, ICON, ICON)
    waf = d.node("WAF\n(SQLi/XSS/レート制限)", AWS["waf"], 400, 220, ICON, ICON)
    alb = d.node("ALB", AWS["alb"], 580, 220, ICON, ICON)
    s3 = d.node("S3\n(静的アセット)", AWS["s3"], 400, 60, ICON, ICON)
    origin = d.node("EC2 / ECS\n(オリジン)", AWS["ec2"], 760, 220, ICON, ICON)
    guardduty = d.node("GuardDuty", AWS["guardduty"], 940, 60, ICON, ICON)

    d.edge(user, cf, "HTTPS")
    d.edge(shield, cf, "保護", dashed=True)
    d.edge(cf, s3, "静的コンテンツ")
    d.edge(cf, waf, "動的リクエスト")
    d.edge(waf, alb, "検査済み")
    d.edge(alb, origin, "")
    d.edge(guardduty, origin, "監視", dashed=True)
    return d


def build_static_site_jamstack() -> Diagram:
    d = Diagram(width=1080, height=520)
    d.text("Static Site / JAMstack Hosting (AWS)", 40, 20, 700, 30)

    git = d.node("Git Repository", GENERIC["box"], 40, 60, 160, 60)
    codebuild = d.node("CodeBuild\n(ビルド)", AWS["codebuild"], 240, 55, ICON, ICON)

    user = d.node("User", AWS["user"], 40, 240, 60, 70)
    route53 = d.node("Route 53", AWS["route53"], 200, 235, ICON, ICON)
    cloudfront = d.node("CloudFront\n(CDN + Lambda@Edge)", AWS["cloudfront"], 360, 235, ICON, ICON)
    s3 = d.node("S3\n(静的サイト, OACで非公開)", AWS["s3"], 540, 235, ICON, ICON)

    apigw = d.node("API Gateway\n(動的API)", AWS["api_gateway"], 540, 400, ICON, ICON)
    lam = d.node("Lambda", AWS["lambda"], 720, 400, ICON, ICON)
    ddb = d.node("DynamoDB", AWS["dynamodb"], 900, 400, ICON, ICON)

    d.edge(git, codebuild, "push時にビルド")
    d.edge(codebuild, s3, "静的アセットをデプロイ", dashed=True)
    d.edge(user, route53, "")
    d.edge(route53, cloudfront, "")
    d.edge(cloudfront, s3, "静的アセット取得 (OAC)")
    d.edge(cloudfront, apigw, "/api/* をオリジン転送")
    d.edge(apigw, lam, "")
    d.edge(lam, ddb, "")
    return d


def build_realtime_websocket_chat() -> Diagram:
    d = Diagram(width=800, height=520)
    d.text("Real-time WebSocket Chat Architecture (AWS)", 40, 20, 700, 30)

    user_a = d.node("User A", AWS["user"], 40, 120, 60, 70)
    user_b = d.node("User B", AWS["user"], 40, 340, 60, 70)
    wsapi = d.node("API Gateway\n(WebSocket API)", AWS["api_gateway"], 240, 220, ICON, ICON)
    connect_lambda = d.node("Lambda\n($connect / $disconnect)", AWS["lambda"], 420, 110, ICON, ICON)
    message_lambda = d.node("Lambda\n(メッセージ処理)", AWS["lambda"], 420, 330, ICON, ICON)
    connections_table = d.node("DynamoDB\n(Connections)", AWS["dynamodb"], 620, 110, ICON, ICON)
    messages_table = d.node("DynamoDB\n(メッセージ履歴)", AWS["dynamodb"], 620, 330, ICON, ICON)

    d.edge(user_a, wsapi, "接続 (wss://)")
    d.edge(user_b, wsapi, "接続 (wss://)")
    d.edge(wsapi, connect_lambda, "$connect / $disconnect")
    d.edge(connect_lambda, connections_table, "接続情報を登録/削除")
    d.edge(wsapi, message_lambda, "$default (メッセージ受信)")
    d.edge(message_lambda, messages_table, "履歴保存")
    d.edge(message_lambda, connections_table, "宛先のconnectionIdを取得", dashed=True)
    d.edge(message_lambda, wsapi, "Management APIで配信", dashed=True)
    d.edge(wsapi, user_b, "リアルタイム配信", dashed=True)
    return d


def build_media_processing_pipeline() -> Diagram:
    d = Diagram(width=1300, height=460)
    d.text("Media Processing Pipeline (AWS)", 40, 20, 700, 30)

    uploader = d.node("Uploader", AWS["user"], 40, 215, 60, 70)
    s3_raw = d.node("S3\n(アップロード, Raw)", AWS["s3"], 200, 210, ICON, ICON)
    lambda_trigger = d.node("Lambda\n(アップロード検知)", AWS["lambda"], 380, 210, ICON, ICON)
    mediaconvert = d.node("MediaConvert\n(トランスコード)", AWS["mediaconvert"], 560, 210, ICON, ICON)
    s3_processed = d.node("S3\n(処理済み, HLS/複数解像度)", AWS["s3"], 740, 210, ICON, ICON)
    cloudfront = d.node("CloudFront\n(配信)", AWS["cloudfront"], 920, 210, ICON, ICON)
    viewer = d.node("Viewer", AWS["user"], 1100, 215, 60, 70)
    eventbridge = d.node("EventBridge\n(ジョブ完了通知)", AWS["eventbridge"], 560, 60, ICON, ICON)
    sns = d.node("SNS\n(処理完了を通知)", AWS["sns"], 740, 60, ICON, ICON)

    d.edge(uploader, s3_raw, "アップロード")
    d.edge(s3_raw, lambda_trigger, "S3イベント", dashed=True)
    d.edge(lambda_trigger, mediaconvert, "ジョブ作成")
    d.edge(mediaconvert, s3_processed, "出力")
    d.edge(mediaconvert, eventbridge, "ジョブ完了", dashed=True)
    d.edge(eventbridge, sns, "", dashed=True)
    d.edge(s3_processed, cloudfront, "配信元")
    d.edge(cloudfront, viewer, "HLSストリーミング")
    return d


def build_search_platform_opensearch() -> Diagram:
    d = Diagram(width=1240, height=460)
    d.text("Search Platform Architecture (OpenSearch)", 40, 20, 700, 30)

    source = d.node("データソース\n(RDS/DynamoDB/S3)", GENERIC["box_gray"], 40, 215, 160, 70)
    etl = d.node("Glue ETL\n(インデックス変換)", AWS["glue"], 260, 210, ICON, ICON)
    opensearch = d.node("OpenSearch\n(検索インデックス)", AWS["opensearch"], 440, 210, ICON, ICON)
    dashboards = d.node("OpenSearch Dashboards\n(運用可視化)", GENERIC["box_gray"], 420, 60, 200, 60)
    search_api = d.node("API Gateway\n(検索API)", AWS["api_gateway"], 620, 210, ICON, ICON)
    lambda_search = d.node("Lambda\n(クエリ処理)", AWS["lambda"], 800, 210, ICON, ICON)
    app = d.node("アプリケーション", GENERIC["box"], 980, 215, 160, 70)

    d.edge(source, etl, "定期/イベント駆動で取り込み")
    d.edge(etl, opensearch, "インデックス投入 (bulk API)")
    d.edge(opensearch, dashboards, "", dashed=True)
    d.edge(app, search_api, "検索クエリ")
    d.edge(search_api, lambda_search, "")
    d.edge(lambda_search, opensearch, "検索実行")
    return d


def build_iot_ingestion_pipeline() -> Diagram:
    d = Diagram(width=1160, height=520)
    d.text("IoT Ingestion Pipeline (AWS)", 40, 20, 700, 30)

    devices = d.node("IoTデバイス群", GENERIC["box_gray"], 40, 220, 160, 70)
    iot_core = d.node("IoT Core\n(MQTT, デバイス管理)", AWS["iot_core"], 260, 215, ICON, ICON)
    kinesis = d.node("Kinesis Data Streams", AWS["kinesis"], 440, 215, ICON, ICON)
    kda = d.node("Kinesis Data Analytics\n(リアルタイム処理)", AWS["kinesis_data_analytics"], 620, 120, ICON, ICON)
    lam = d.node("Lambda\n(異常検知/変換)", AWS["lambda"], 620, 320, ICON, ICON)
    s3 = d.node("S3\n(生データレイク)", AWS["s3"], 800, 320, ICON, ICON)
    ddb = d.node("DynamoDB\n(デバイス状態/最新値)", AWS["dynamodb"], 800, 120, ICON, ICON)
    quicksight = d.node("QuickSight\n(ダッシュボード)", AWS["quicksight"], 980, 120, ICON, ICON)

    d.edge(devices, iot_core, "MQTT publish")
    d.edge(iot_core, kinesis, "IoT Rule経由で転送")
    d.edge(kinesis, kda, "ストリーム処理")
    d.edge(kinesis, lam, "異常検知/変換")
    d.edge(kda, ddb, "集計結果を反映")
    d.edge(lam, s3, "生データ保存")
    d.edge(ddb, quicksight, "可視化", dashed=True)
    d.edge(iot_core, ddb, "デバイスシャドウ (最新状態)", dashed=True)
    return d


def build_landing_zone_multi_account() -> Diagram:
    d = Diagram(width=1460, height=700)
    d.text("Landing Zone / Multi-Account Governance (AWS Control Tower)", 40, 20, 900, 30)

    management = d.node("Management Account\n(課金/組織管理)", GENERIC["box_gray"], 40, 90, 240, 80)
    control_tower = d.node("Control Tower\n(ガードレール管理)", AWS["control_tower"], 320, 95, ICON, ICON)
    identity_center = d.node(
        "IAM Identity Center\n(SSOで各アカウントへ一元アクセス)", GENERIC["box_gray"], 440, 95, 240, 80
    )

    security_ou = d.container("Security OU", GROUPS["generic"], 40, 240, 640, 200)
    log_archive = d.node("Log Archive Account\n(CloudTrail/Config集約)", GENERIC["box_gray"], 60, 60, 260, 90, parent=security_ou)
    audit_account = d.node("Audit / Security Tooling Account\n(GuardDuty集約)", GENERIC["box_gray"], 360, 60, 260, 90, parent=security_ou)

    workloads_ou = d.container("Workloads OU", GROUPS["generic"], 720, 240, 640, 200)
    prod_account = d.node("Production Account", GENERIC["box"], 40, 60, 260, 90, parent=workloads_ou)
    nonprod_account = d.node("Non-Production Account\n(Dev/Staging)", GENERIC["box"], 340, 60, 260, 90, parent=workloads_ou)

    sandbox_ou = d.container("Sandbox OU", GROUPS["generic"], 40, 480, 640, 160)
    sandbox_account = d.node("Sandbox Account\n(個人検証用, 予算制限あり)", GENERIC["box_orange"], 40, 60, 260, 80, parent=sandbox_ou)

    # Container top-left corners carry the OU label (verticalAlign=top, align=left,
    # spacingLeft=12) - point governance/log edges at specific entry/exit sides so
    # they don't route straight through that label text.
    entry_top = "entryX={x};entryY=0;entryDx=0;entryDy=0;"
    side_pair = "exitX={ex};exitY={ey};exitDx=0;exitDy=0;entryX={tx};entryY={ty};entryDx=0;entryDy=0;"

    d.edge(management, control_tower, "")
    d.edge(control_tower, identity_center, "", dashed=True)
    d.edge(control_tower, security_ou, "SCP / ガードレール適用", dashed=True,
           style=EDGE_STYLE + entry_top.format(x=0.5))
    d.edge(control_tower, workloads_ou, "SCP / ガードレール適用", dashed=True,
           style=EDGE_STYLE + entry_top.format(x=0.4))
    d.edge(control_tower, sandbox_ou, "SCP / ガードレール適用", dashed=True,
           style=EDGE_STYLE + entry_top.format(x=0.5))
    d.edge(prod_account, log_archive, "CloudTrailログを集約",
           style=EDGE_STYLE + side_pair.format(ex=0, ey=0.3, tx=1, ty=0.3))
    d.edge(nonprod_account, log_archive, "CloudTrailログを集約", dashed=True,
           style=EDGE_STYLE + side_pair.format(ex=0, ey=0.7, tx=1, ty=0.7))
    d.edge(audit_account, prod_account, "GuardDuty/Configで監視", dashed=True,
           style=EDGE_STYLE + side_pair.format(ex=1, ey=0.3, tx=0, ty=0.3))
    d.edge(audit_account, nonprod_account, "GuardDuty/Configで監視", dashed=True,
           style=EDGE_STYLE + side_pair.format(ex=1, ey=0.7, tx=0, ty=0.7))
    return d


def build_caching_layer_cache_aside() -> Diagram:
    d = Diagram(width=760, height=380)
    d.text("Caching Layer - Cache-Aside Pattern (AWS)", 40, 20, 700, 30)

    app = d.node("アプリケーション", GENERIC["box"], 40, 150, 160, 70)
    cache = d.node("ElastiCache\n(Redis)", AWS["elasticache_redis"], 280, 140, ICON, ICON)
    db = d.node("RDS\n(正データ)", AWS["rds"], 520, 140, ICON, ICON)

    d.edge(app, cache, "① まずキャッシュを確認 (GET)")
    d.edge(cache, app, "②-a ヒット時: 即座に返却", dashed=True)
    d.edge(app, db, "②-b ミス時: DBへ問い合わせ")
    d.edge(db, app, "③ 結果を返却", dashed=True)
    d.edge(app, cache, "④ 結果をキャッシュに書き込み (TTL付き)", dashed=True)
    return d


def build_warm_standby_dr() -> Diagram:
    d = Diagram(width=1600, height=760)
    d.text("Warm Standby Disaster Recovery (AWS)", 40, 20, 900, 30)

    route53 = d.node("Route 53\n(ヘルスチェックベースのフェイルオーバー)", AWS["route53"], 700, 50, ICON, ICON)

    primary = d.container("Primary Region: ap-northeast-1 (フル稼働)", GROUPS["region"], 40, 150, 700, 590)
    alb = d.node("ALB", AWS["alb"], 60, 100, ICON, ICON, parent=primary)
    ec2 = d.node("EC2 Auto Scaling\n(本番トラフィック 100%)", AWS["ec2"], 240, 100, ICON, ICON, parent=primary)
    rds = d.node("RDS Primary", AWS["rds"], 60, 260, ICON, ICON, parent=primary)

    dr = d.container("DR Region: us-west-2 (Warm Standby: 縮小構成で常時稼働)", GROUPS["region"], 840, 150, 700, 590)
    alb_dr = d.node("ALB", AWS["alb"], 60, 100, ICON, ICON, parent=dr)
    ec2_dr = d.node("EC2 Auto Scaling\n(最小台数で稼働, 障害時に自動スケールアウト)", AWS["ec2"], 240, 100, ICON, ICON, parent=dr)
    rds_dr = d.node("RDS Read Replica\n(読み取り専用で稼働中)", AWS["rds"], 60, 260, ICON, ICON, parent=dr)

    d.edge(alb, ec2, "")
    d.edge(ec2, rds, "")
    d.edge(alb_dr, ec2_dr, "")
    d.edge(ec2_dr, rds_dr, "")
    d.edge(rds, rds_dr, "非同期レプリケーション", dashed=True)
    d.edge(route53, alb, "通常時: 100%ルーティング")
    d.edge(route53, alb_dr, "障害検知時: フェイルオーバー", dashed=True, style=EDGE_STYLE_BOLD)
    return d


AWS_TEMPLATES = {
    "3tier-web-app-multi-az": build_3tier_web_app_multi_az,
    "serverless-event-driven-api": build_serverless_event_driven_api,
    "microservices-containers": build_microservices_containers,
    "data-lake-analytics-pipeline": build_data_lake_analytics_pipeline,
    "multi-region-active-active-dr": build_multi_region_active_active_dr,
    "multi-region-pilot-light-backup-dr": build_multi_region_pilot_light_backup_dr,
    "hub-and-spoke-network": build_hub_and_spoke_network,
    "cicd-pipeline": build_cicd_pipeline,
    "multi-tenant-saas-pool-model": build_multi_tenant_saas_pool_model,
    "multi-tenant-saas-silo-model": build_multi_tenant_saas_silo_model,
    "zero-trust-identity-auth": build_zero_trust_identity_auth,
    "waf-cdn-edge-security": build_waf_cdn_edge_security,
    "static-site-jamstack": build_static_site_jamstack,
    "realtime-websocket-chat": build_realtime_websocket_chat,
    "media-processing-pipeline": build_media_processing_pipeline,
    "search-platform-opensearch": build_search_platform_opensearch,
    "iot-ingestion-pipeline": build_iot_ingestion_pipeline,
    "landing-zone-multi-account": build_landing_zone_multi_account,
    "caching-layer-cache-aside": build_caching_layer_cache_aside,
    "warm-standby-dr": build_warm_standby_dr,
}


# ---------------------------------------------------------------------------
# Blockchain templates (generic shapes - not tied to one chain)
# ---------------------------------------------------------------------------

def build_dapp_fullstack() -> Diagram:
    d = Diagram(width=1680, height=560)
    d.text("Full-Stack dApp Architecture", 40, 20, 700, 30)

    user = d.node("User", AWS["user"], 40, 220, 60, 70)
    wallet = d.node("MetaMask\n(Wallet)", w3.wallet("metamask"), 200, 210, 60, 60)
    frontend = d.node("Frontend\n(React/Next.js)", GENERIC["box"], 340, 220, 160, 70)
    cdn = d.node("CDN / Hosting\n(CloudFront, Vercel等)", AWS["cloudfront"], 340, 60, ICON, ICON)
    rpc = d.node("RPC Provider\n(Alchemy/Infura等)", GENERIC["box_purple"], 560, 220, 160, 70)
    contract = d.node("Smart Contract\n(オンチェーン)", GENERIC["smart_contract"], 800, 210, 90, 90)
    indexer = d.node("Indexer\n(The Graph等)", GENERIC["box_orange"], 560, 380, 160, 70)
    backend = d.node("Backend API\n(オフチェーン処理)", GENERIC["box"], 340, 380, 160, 70)
    db = d.node("Database\n(キャッシュ/メタデータ)", GENERIC["db_cylinder"], 120, 380, 70, 80)

    d.edge(user, wallet, "署名")
    d.edge(user, frontend, "操作")
    d.edge(frontend, cdn, "配信元", dashed=True)
    d.edge(wallet, rpc, "トランザクション送信")
    d.edge(rpc, contract, "invoke")
    d.edge(contract, indexer, "イベント購読", dashed=True)
    d.edge(indexer, backend, "同期")
    d.edge(backend, db, "R/W")
    d.edge(frontend, backend, "REST/GraphQL")
    return d


def build_l1_node_validator_architecture() -> Diagram:
    d = Diagram(width=1600, height=560)
    d.text("L1 Node / Validator Architecture", 40, 20, 700, 30)

    client = d.node("dApp / Wallet\nClient", GENERIC["box"], 40, 220, 160, 70)
    lb = d.node("Load Balancer", AWS["nlb"], 260, 210, ICON, ICON)

    rpc_nodes = d.container("RPC Node Pool (Full Nodes)", GROUPS["generic"], 420, 100, 380, 300)
    for i in range(2):
        d.node(f"Full Node #{i+1}", GENERIC["box_purple"], 40 + i * 180, 80, 140, 70, parent=rpc_nodes)

    validators = d.container("Validator Set", GROUPS["tenant"], 860, 100, 380, 300)
    for i in range(2):
        d.node(f"Validator #{i+1}\n(ステーキング)", GENERIC["box_orange"], 40 + i * 180, 80, 140, 70, parent=validators)

    p2p = d.text("P2P Gossip Network", 500, 420, 400, 30)
    storage = d.node("State DB\n(LevelDB/RocksDB)", GENERIC["db_cylinder"], 1300, 220, 70, 80)
    monitor = d.node("監視\n(Prometheus/Grafana)", GENERIC["box_gray"], 420, 440, 160, 70)

    d.edge(client, lb, "JSON-RPC")
    d.edge(lb, rpc_nodes, "route")
    d.edge(rpc_nodes, validators, "gossip / ブロック伝播", dashed=True)
    d.edge(validators, storage, "state write")
    d.edge(rpc_nodes, monitor, "metrics", dashed=True)
    return d


def build_cross_chain_bridge() -> Diagram:
    d = Diagram(width=1600, height=520)
    d.text("Cross-Chain Bridge Architecture", 40, 20, 700, 30)

    chainA = d.container("Chain A: Ethereum", GROUPS["generic"], 40, 100, 360, 300)
    chainA_logo = d.node("Ethereum", w3.network("ethereum"), 40, 100, 50, 50, parent=chainA)
    lockContract = d.node("Lock/Burn\nContract", GENERIC["smart_contract"], 150, 100, 90, 90, parent=chainA)

    relayers = d.container("Relayer / Oracle Network\n(署名の集約・検証)", GROUPS["tenant"], 500, 100, 500, 300)
    for i in range(3):
        d.node(f"Relayer #{i+1}", GENERIC["box_orange"], 40 + i * 150, 100, 120, 80, parent=relayers)

    chainB = d.container("Chain B: Base", GROUPS["generic"], 1100, 100, 360, 300)
    chainB_logo = d.node("Base", w3.network("base"), 40, 100, 50, 50, parent=chainB)
    mintContract = d.node("Mint/Release\nContract", GENERIC["smart_contract"], 150, 100, 90, 90, parent=chainB)

    monitor = d.node("監視 / 不正検知\n(異常な引き出しをブロック)", GENERIC["box_gray"], 500, 440, 500, 60)

    d.edge(lockContract, relayers, "ロックイベント検知")
    d.edge(relayers, mintContract, "マルチシグ承認後にmint")
    d.edge(relayers, monitor, "", dashed=True)
    return d


def build_oracle_integration() -> Diagram:
    d = Diagram(width=1600, height=460)
    d.text("Oracle Integration Architecture", 40, 20, 700, 30)

    sources = d.container("外部データソース", GROUPS["generic"], 40, 100, 300, 260)
    for i, name in enumerate(["価格API #1", "価格API #2", "価格API #3"]):
        d.node(name, GENERIC["box"], 30, 60 + i * 70, 240, 50, parent=sources)

    nodes = d.container("Oracle Node Network\n(複数ノードで集約・中央値算出)", GROUPS["tenant"], 420, 100, 480, 260)
    for i in range(3):
        d.node(f"Oracle Node #{i+1}", GENERIC["box_orange"], 40 + i * 150, 100, 120, 80, parent=nodes)

    onchain = d.node("Oracle Contract\n(オンチェーン価格フィード)", GENERIC["smart_contract"], 1000, 190, 100, 100)
    consumer = d.node("DeFiプロトコル\n(価格を参照)", GENERIC["box_purple"], 1200, 210, 160, 70)

    d.edge(sources, nodes, "取得")
    d.edge(nodes, onchain, "署名付きレポート提出\n(複数ノードの合意)")
    d.edge(onchain, consumer, "read")
    return d


def build_mpc_wallet_custody() -> Diagram:
    d = Diagram(width=1600, height=460)
    d.text("MPC Wallet / Custody Architecture", 40, 20, 700, 30)

    user = d.node("User", AWS["user"], 40, 190, 60, 70)
    app = d.node("Custody App\n(承認フロー)", GENERIC["box"], 200, 190, 160, 70)

    mpc = d.container("MPC Key Shard Network\n(秘密鍵を分散保管、単一障害点なし)", GROUPS["tenant"], 420, 80, 640, 300)
    for i in range(3):
        d.node(f"Key Shard #{i+1}\n(HSM/Enclave)", GENERIC["box_orange"], 40 + i * 200, 100, 160, 80, parent=mpc)

    policy = d.node("承認ポリシー\n(閾値署名 t-of-n)", GENERIC["box_gray"], 420, 400, 200, 60)
    chain = d.node("Blockchain\nネットワーク", GENERIC["smart_contract"], 1160, 220, 90, 90)
    audit = d.node("監査ログ\n(改ざん検知)", GENERIC["box_purple"], 1160, 400, 160, 60)

    d.edge(user, app, "送金リクエスト")
    d.edge(app, mpc, "署名リクエスト")
    d.edge(mpc, policy, "閾値署名検証", dashed=True)
    d.edge(mpc, chain, "署名済みトランザクション送信")
    d.edge(mpc, audit, "", dashed=True)
    return d


def build_rollup_l2_architecture() -> Diagram:
    d = Diagram(width=1600, height=460)
    d.text("Rollup / L2 Architecture", 40, 20, 700, 30)

    user = d.node("User", AWS["user"], 40, 190, 60, 70)
    seq = d.node("Sequencer\n(トランザクション順序決定)", GENERIC["box_orange"], 220, 180, 160, 90)

    l2 = d.container("L2 Network\n(高速・低コストな実行環境)", GROUPS["generic"], 460, 100, 340, 260)
    exec_ = d.node("Execution Engine", GENERIC["box"], 40, 100, 260, 70, parent=l2)

    prover = d.node("Prover\n(ZK Proof生成)", GENERIC["box_purple"], 860, 100, 160, 70)
    batcher = d.node("Batcher\n(バッチ圧縮)", GENERIC["box_purple"], 860, 220, 160, 70)

    l1 = d.node("L1 (Ethereum)\nロールアップコントラクト", GENERIC["smart_contract"], 1120, 180, 100, 100)

    d.edge(user, seq, "トランザクション送信")
    d.edge(seq, l2, "実行")
    d.edge(l2, prover, "state diff", dashed=True)
    d.edge(l2, batcher, "state diff", dashed=True)
    d.edge(prover, l1, "Validity Proof提出 (ZK-Rollup)")
    d.edge(batcher, l1, "Batch提出 (Optimistic Rollup, チャレンジ期間あり)", dashed=True)
    return d


def build_nft_marketplace() -> Diagram:
    d = Diagram(width=1320, height=640)
    d.text("NFT Marketplace Architecture", 40, 20, 700, 30)

    creator = d.node("Creator", AWS["user"], 40, 110, 60, 70)
    nft_contract = d.node("NFT Contract\n(ERC-721/1155)", GENERIC["smart_contract"], 200, 100, 90, 90)
    ipfs = d.node("IPFS / Arweave\n(メタデータ/画像)", GENERIC["db_cylinder"], 380, 110, 80, 90)

    marketplace = d.node("Marketplace Contract\n(出品 / エスクロー)", GENERIC["smart_contract"], 560, 270, 100, 100)

    buyer = d.node("Buyer", AWS["user"], 40, 380, 60, 70)
    wallet = d.node("Wallet", GENERIC["wallet"], 180, 370, 70, 90)
    frontend = d.node("Frontend\n(マーケットプレイスUI)", GENERIC["box"], 320, 380, 160, 70)

    royalty = d.node("クリエイターへ\nロイヤリティ", GENERIC["box_green"], 760, 180, 180, 60)
    fee = d.node("プラットフォーム\n手数料", GENERIC["box_gray"], 760, 270, 180, 60)
    proceeds = d.node("出品者へ\n売却代金", GENERIC["box_green"], 760, 360, 180, 60)

    indexer = d.node("Indexer\n(出品/取引履歴)", GENERIC["box_orange"], 320, 500, 220, 60)

    d.edge(creator, nft_contract, "mint()")
    d.edge(nft_contract, ipfs, "tokenURI参照", dashed=True)
    d.edge(creator, marketplace, "出品 (approve + list)")
    d.edge(buyer, wallet, "署名")
    d.edge(buyer, frontend, "閲覧・購入操作")
    d.edge(frontend, marketplace, "purchase()")
    d.edge(wallet, marketplace, "")
    d.edge(marketplace, nft_contract, "所有権移転")
    d.edge(marketplace, royalty, "")
    d.edge(marketplace, fee, "")
    d.edge(marketplace, proceeds, "")
    d.edge(marketplace, indexer, "イベント発行 (Transfer/Sale)", dashed=True)
    d.edge(indexer, frontend, "出品一覧・検索", dashed=True)
    return d


def build_x402_agentic_payments() -> Diagram:
    d = Diagram(width=1160, height=460)
    d.text("x402 Agentic Payments (HTTP 402 Protocol)", 40, 20, 900, 30)

    agent = d.node("AI Agent\n(x402 Client / Buyer)", GENERIC["box_purple"], 40, 220, 160, 80)
    wallet = d.node("Wallet", w3.wallet("metamask"), 250, 225, 60, 60)
    server = d.node("Server / API\n(x402 Seller Middleware)", GENERIC["box"], 440, 220, 200, 80)
    facilitator = d.node("Facilitator\n(/verify, /settle)", GENERIC["box_orange"], 700, 220, 200, 80)
    chain = d.node("Blockchain\n(USDC決済, Base/Solana)", GENERIC["smart_contract"], 960, 215, 100, 100)
    resource = d.node("保護されたリソース\n(API / MCP Tool)", GENERIC["box_gray"], 440, 60, 200, 60)

    d.edge(agent, server, "① GET /resource")
    d.edge(server, agent, "② 402 Payment Required\n(支払い条件を提示)", dashed=True)
    d.edge(agent, wallet, "③ 支払いペイロード署名")
    d.edge(wallet, server, "④ リトライ (X-PAYMENT-SIGNATURE)")
    d.edge(server, facilitator, "⑤ /verify")
    d.edge(facilitator, server, "⑥ 検証OK", dashed=True)
    d.edge(server, resource, "⑦ アクセス許可", dashed=True)
    d.edge(server, agent, "⑧ 200 OK + リソース")
    d.edge(server, facilitator, "⑨ /settle (非同期)", dashed=True)
    d.edge(facilitator, chain, "⑩ オンチェーン決済", dashed=True)
    return d


def build_dex_amm() -> Diagram:
    d = Diagram(width=1440, height=580)
    d.text("Decentralized Exchange (DEX) - AMM Architecture", 40, 20, 900, 30)

    trader = d.node("Trader", AWS["user"], 40, 230, 60, 70)
    wallet = d.node("Wallet", w3.wallet("metamask"), 190, 235, 60, 60)
    frontend = d.node("Frontend\n(Swap UI)", GENERIC["box"], 320, 230, 160, 70)
    router = d.node("Router Contract\n(最適経路探索)", GENERIC["smart_contract"], 560, 220, 110, 100)

    pools = d.container("Liquidity Pools (AMM, x*y=k)", GROUPS["generic"], 740, 80, 340, 320)
    pool1 = d.node("Pool: ETH / USDC", GENERIC["box_orange"], 40, 60, 260, 70, parent=pools)
    pool2 = d.node("Pool: USDC / DAI", GENERIC["box_orange"], 40, 180, 260, 70, parent=pools)

    lp = d.node("流動性提供者\n(LP)", GENERIC["box_gray"], 560, 420, 160, 70)
    factory = d.node("Factory Contract\n(新規プール作成)", GENERIC["box_purple"], 1140, 90, 180, 70)
    oracle = d.node("Price Oracle\n(TWAP)", GENERIC["box_purple"], 1140, 260, 180, 70)

    d.edge(trader, wallet, "署名")
    d.edge(trader, frontend, "スワップ操作")
    d.edge(wallet, router, "swap()")
    d.edge(frontend, router, "")
    d.edge(router, pool1, "経路選択・実行")
    d.edge(router, pool2, "マルチホップ経路", dashed=True)
    d.edge(lp, pool1, "デポジット / LPトークン受取")
    d.edge(lp, pool2, "デポジット / LPトークン受取", dashed=True)
    d.edge(factory, pools, "プール作成", dashed=True)
    d.edge(pool1, oracle, "価格フィード (TWAP)", dashed=True)
    return d


def build_cex_architecture() -> Diagram:
    d = Diagram(width=1500, height=800)
    d.text("Centralized Exchange (CEX) Architecture", 40, 20, 900, 30)

    user = d.node("User", AWS["user"], 40, 220, 60, 70)
    webapp = d.node("Web / App", GENERIC["box"], 200, 230, 160, 70)
    apigw = d.node("API Gateway", GENERIC["box"], 400, 230, 160, 70)
    auth = d.node("Auth / KYC", GENERIC["box_gray"], 600, 230, 160, 70)

    oms = d.node("Order Management\nSystem (OMS)", GENERIC["box"], 400, 360, 160, 70)
    matching = d.node("Matching Engine\n(オーダーブック, インメモリ)", GENERIC["box_orange"], 600, 360, 180, 90)
    settlement = d.node("Trade Settlement", GENERIC["box"], 820, 360, 160, 70)
    ledger = d.node("Ledger DB\n(残高)", GENERIC["db_cylinder"], 1020, 355, 90, 90)

    risk = d.node("Risk & Compliance\n(監視)", GENERIC["box_gray"], 600, 520, 180, 70)

    node = d.node("Blockchain Node\n(入金監視)", GENERIC["box_purple"], 40, 520, 160, 70)
    deposit_monitor = d.node("入金検知\n(Deposit Monitor)", GENERIC["box"], 240, 520, 160, 70)

    hot_wallet = d.node("Hot Wallet\n(自動出金用, 少額)", GENERIC["box_orange"], 1020, 520, 160, 70)
    cold_wallet = d.node("Cold Wallet\n(オフライン, マルチシグ)", GENERIC["box_green"], 1240, 520, 180, 70)
    blockchain_out = d.node("Blockchain\n(送金)", GENERIC["smart_contract"], 1260, 660, 100, 100)

    d.edge(user, webapp, "")
    d.edge(webapp, apigw, "")
    d.edge(apigw, auth, "認証/KYC確認", dashed=True)
    d.edge(apigw, oms, "注文送信")
    d.edge(oms, matching, "板に登録")
    d.edge(matching, settlement, "約定")
    d.edge(settlement, ledger, "残高更新")
    d.edge(node, deposit_monitor, "入金検知")
    d.edge(deposit_monitor, ledger, "入金反映")
    d.edge(matching, risk, "監視", dashed=True)
    d.edge(ledger, hot_wallet, "出金リクエスト\n(Risk承認後)")
    d.edge(risk, hot_wallet, "承認", dashed=True)
    d.edge(hot_wallet, cold_wallet, "定期スイープ (余剰資金)", dashed=True)
    d.edge(hot_wallet, blockchain_out, "署名・ブロードキャスト")
    d.edge(cold_wallet, blockchain_out, "大口出金\n(マルチシグ承認)", dashed=True)
    return d


def build_dao_governance() -> Diagram:
    d = Diagram(width=1360, height=400)
    d.text("DAO Governance Architecture", 40, 20, 700, 30)

    holder = d.node("Token Holder", AWS["user"], 40, 210, 60, 70)
    gov_token = d.node("Governance Token\n(ERC-20Votes)", GENERIC["smart_contract"], 220, 200, 90, 90)
    snapshot = d.node("Snapshot\n(オフチェーン投票シグナリング, 任意)", GENERIC["box_purple"], 400, 60, 200, 70)
    proposal = d.node("Proposal\n(Governor Contract)", GENERIC["box_orange"], 400, 205, 180, 90)
    voting = d.node("投票期間\n(Quorum/閾値チェック)", GENERIC["box_orange"], 640, 205, 180, 90)
    timelock = d.node("Timelock Controller\n(実行遅延)", GENERIC["box_gray"], 880, 205, 180, 90)
    treasury = d.node("Treasury / Multisig", GENERIC["box_green"], 1120, 205, 180, 90)

    d.edge(holder, gov_token, "保有 / delegate")
    d.edge(gov_token, proposal, "投票権")
    d.edge(snapshot, proposal, "温度感の事前確認 (任意)", dashed=True)
    d.edge(proposal, voting, "提案 (on-chain)")
    d.edge(gov_token, voting, "投票", dashed=True)
    d.edge(voting, timelock, "可決後キューイング")
    d.edge(timelock, treasury, "遅延後に実行")
    return d


def build_defi_lending_protocol() -> Diagram:
    d = Diagram(width=1080, height=520)
    d.text("DeFi Lending Protocol Architecture", 40, 20, 700, 30)

    lender = d.node("Lender", AWS["user"], 40, 150, 60, 70)
    borrower = d.node("Borrower", AWS["user"], 40, 380, 60, 70)
    pool = d.node("Lending Pool Contract\n(金利モデル, aToken/cToken発行)", GENERIC["box_orange"], 280, 220, 220, 120)
    collateral = d.node("ETH\n(担保資産の例)", w3.token("ETH"), 300, 400, 60, 60)
    oracle = d.node("Price Oracle", GENERIC["box_purple"], 560, 150, 160, 70)
    healthbot = d.node("Liquidation Bot\n(Health Factor監視)", GENERIC["box_orange"], 560, 400, 200, 70)
    liquidator = d.node("Liquidator\n(清算実行者)", GENERIC["box_green"], 820, 400, 160, 70)

    d.edge(lender, pool, "預入 (供給)")
    d.edge(pool, lender, "aToken発行 / 金利収益", dashed=True)
    d.edge(borrower, collateral, "担保預入")
    d.edge(collateral, pool, "担保として登録")
    d.edge(pool, borrower, "借入")
    d.edge(oracle, pool, "担保評価額", dashed=True)
    d.edge(pool, healthbot, "Health Factor監視対象", dashed=True)
    d.edge(healthbot, liquidator, "清算トリガー\n(担保割れ検知)")
    d.edge(liquidator, pool, "負債返済 + 担保取得\n(清算ボーナス)")
    return d


def build_staking_liquid_staking() -> Diagram:
    d = Diagram(width=1400, height=560)
    d.text("Staking / Liquid Staking Architecture", 40, 20, 700, 30)

    staker = d.node("Staker", AWS["user"], 40, 220, 60, 70)
    wallet = d.node("Wallet", GENERIC["wallet"], 180, 210, 70, 90)
    protocol = d.node("Liquid Staking Protocol\n(デポジット管理)", GENERIC["box_orange"], 340, 200, 220, 110)
    lst = d.node("Liquid Staking Token\n(例: stETH)", GENERIC["box_purple"], 620, 80, 160, 70)

    validators = d.container("Validator Set", GROUPS["generic"], 620, 260, 320, 220)
    val1 = d.node("Validator Operator #1", GENERIC["box_orange"], 40, 60, 240, 70, parent=validators)
    val2 = d.node("Validator Operator #2", GENERIC["box_orange"], 40, 150, 240, 70, parent=validators)

    defi = d.node("DeFi プロトコル\n(Lending/DEXで担保として利用)", GENERIC["box_gray"], 1020, 80, 220, 70)
    withdrawal = d.node("出金キュー\n(Unbonding Period)", GENERIC["box"], 340, 400, 220, 70)

    d.edge(staker, wallet, "署名")
    d.edge(wallet, protocol, "stake() (ネイティブトークン預入)")
    d.edge(protocol, lst, "LST mint (例: stETH)")
    d.edge(protocol, validators, "委任 (delegate)")
    d.edge(validators, protocol, "ステーキング報酬", dashed=True)
    d.edge(lst, defi, "担保として利用可能 (流動性)", dashed=True)
    d.edge(protocol, withdrawal, "unstake() 要求")
    d.edge(withdrawal, wallet, "Unbonding Period後に返却")
    return d


def build_perpetuals_dex() -> Diagram:
    d = Diagram(width=1460, height=560)
    d.text("Perpetuals DEX (無期限先物) Architecture", 40, 20, 900, 30)

    trader = d.node("Trader", AWS["user"], 40, 220, 60, 70)
    wallet = d.node("Wallet", w3.wallet("metamask"), 190, 225, 60, 60)
    frontend = d.node("Frontend\n(Trading UI)", GENERIC["box"], 320, 220, 160, 70)
    perp = d.node("Perpetuals Contract\n(ポジション管理)", GENERIC["smart_contract"], 560, 205, 120, 100)

    vault = d.node("Liquidity Vault\n(トレーダーの対向)", GENERIC["box_orange"], 760, 100, 180, 80)
    oracle = d.node("Price Oracle\n(マーク価格)", GENERIC["box_purple"], 760, 300, 180, 70)
    funding = d.node("Funding Rate\n(Long/Short間で定期精算)", GENERIC["box_gray"], 1000, 100, 200, 70)
    liquidation = d.node("Liquidation Engine\n(証拠金維持率監視)", GENERIC["box_orange"], 1000, 300, 200, 70)
    insurance = d.node("Insurance Fund\n(清算損失を補填)", GENERIC["box_green"], 1240, 300, 180, 70)
    keeper = d.node("Keeper / Liquidator", GENERIC["box"], 1000, 440, 200, 70)

    d.edge(trader, wallet, "署名")
    d.edge(trader, frontend, "発注操作")
    d.edge(wallet, perp, "open/close position")
    d.edge(frontend, perp, "")
    d.edge(perp, vault, "証拠金 / PnL決済")
    d.edge(oracle, perp, "マーク価格フィード", dashed=True)
    d.edge(oracle, funding, "Index価格との乖離計算", dashed=True)
    d.edge(perp, funding, "Funding Rate適用", dashed=True)
    d.edge(perp, liquidation, "ポジション監視対象", dashed=True)
    d.edge(liquidation, keeper, "清算トリガー")
    d.edge(keeper, perp, "清算実行 + 報酬受取")
    d.edge(liquidation, insurance, "不足分を補填", dashed=True)
    return d


def build_stablecoin() -> Diagram:
    d = Diagram(width=1400, height=460)
    d.text("Collateralized Stablecoin Architecture (CDP型, 例: MakerDAO/DAI)", 40, 20, 900, 30)

    user = d.node("User", AWS["user"], 40, 220, 60, 70)
    wallet = d.node("Wallet", w3.wallet("metamask"), 190, 225, 60, 60)
    vault = d.node("Vault / CDP Contract\n(担保管理)", GENERIC["smart_contract"], 340, 200, 130, 110)
    stablecoin = d.node("DAI", w3.token("DAI"), 650, 100, 60, 60)
    oracle = d.node("Price Oracle", GENERIC["box_purple"], 620, 300, 160, 70)
    liquidation = d.node("Liquidation\n(担保割れ時に清算)", GENERIC["box_orange"], 860, 300, 200, 70)
    psm = d.node("Peg Stability Module\n(USDC等と1:1交換)", GENERIC["box_gray"], 860, 80, 220, 70)
    governance = d.node("Governance\n(担保比率/手数料設定)", GENERIC["box_green"], 1140, 190, 180, 70)

    d.edge(user, wallet, "署名")
    d.edge(wallet, vault, "担保預入 (ETH等)")
    d.edge(vault, stablecoin, "mint (過剰担保)")
    d.edge(oracle, vault, "担保評価額", dashed=True)
    d.edge(vault, liquidation, "担保割れ時", dashed=True)
    d.edge(psm, stablecoin, "1:1交換でペグ維持", dashed=True)
    d.edge(governance, vault, "担保比率/清算閾値を設定", dashed=True)
    d.edge(governance, psm, "手数料設定", dashed=True)
    return d


def build_token_launchpad() -> Diagram:
    d = Diagram(width=1300, height=520)
    d.text("Token Launchpad / ICO Architecture", 40, 20, 700, 30)

    project = d.node("Project Team", AWS["user"], 40, 130, 60, 70)
    launchpad = d.node("Launchpad Platform\n(審査 / ホスティング)", GENERIC["box_orange"], 220, 115, 200, 90)
    sale_contract = d.node("Token Sale Contract\n(募集 / 上限管理)", GENERIC["smart_contract"], 480, 115, 130, 90)
    whitelist = d.node("Whitelist / KYC", GENERIC["box_gray"], 460, 280, 200, 70)
    investor = d.node("Investor", AWS["user"], 40, 380, 60, 70)
    vesting = d.node("Vesting Contract\n(クリフ + 段階的解放)", GENERIC["box_purple"], 760, 115, 200, 90)
    token = d.node("Project Token", GENERIC["box_purple"], 780, 280, 180, 70)
    liquidity = d.node("初期流動性\n(DEXプールへシード)", GENERIC["box_orange"], 1020, 115, 220, 90)

    d.edge(project, launchpad, "セール申請 / 審査")
    d.edge(launchpad, sale_contract, "デプロイ")
    d.edge(investor, whitelist, "KYC / ホワイトリスト登録")
    d.edge(whitelist, sale_contract, "承認済み投資家のみ参加可", dashed=True)
    d.edge(investor, sale_contract, "資金拠出 (ETH/USDC)")
    d.edge(sale_contract, vesting, "配分をロック")
    d.edge(vesting, token, "クリフ後に段階的解放")
    d.edge(sale_contract, liquidity, "調達資金の一部でプール作成")
    return d


def build_prediction_market() -> Diagram:
    d = Diagram(width=1440, height=600)
    d.text("Prediction Market Architecture (Polymarket型)", 40, 20, 900, 30)

    trader = d.node("Trader", AWS["user"], 40, 220, 60, 70)
    wallet = d.node("Wallet", GENERIC["wallet"], 180, 210, 70, 90)
    clob = d.node("Off-chain CLOB\n(オーダーマッチング, Operatorが運営)", GENERIC["box"], 340, 200, 220, 90)
    ctf = d.node("Conditional Tokens\nFramework (CTF)\n(担保分割 / 決済)", GENERIC["smart_contract"], 620, 190, 160, 110)
    outcome = d.node("Outcome Tokens\n(YES / NO シェア)", GENERIC["box_purple"], 860, 90, 180, 70)
    proposer = d.node("Resolution Proposer\n(結果提案 + ボンド)", GENERIC["box_orange"], 860, 320, 200, 70)
    oo = d.node("UMA Optimistic Oracle\n(チャレンジ期間: 通常2時間)", GENERIC["box_orange"], 1120, 320, 220, 90)
    dvm = d.node("UMA DVM\n(異議時: UMAトークン保有者投票)", GENERIC["box_gray"], 1120, 460, 220, 70)

    d.edge(trader, wallet, "署名")
    d.edge(trader, clob, "発注 (Buy/Sell YES/NO)")
    d.edge(wallet, ctf, "担保預入 (Split Position, USDC)")
    d.edge(ctf, outcome, "mint YES/NO")
    d.edge(outcome, clob, "取引対象として提示", dashed=True)
    d.edge(clob, ctf, "約定分をオンチェーン決済 (Operator実行)")
    d.edge(proposer, oo, "結果提案 + ボンド")
    d.edge(oo, ctf, "解決結果を報告 (チャレンジ期間経過後)", dashed=True)
    d.edge(oo, dvm, "異議申し立て時にエスカレーション", dashed=True)
    d.edge(dvm, oo, "投票結果を反映", dashed=True)
    d.edge(ctf, wallet, "勝ち手のOutcome Tokenを1:1でUSDC償還")
    return d


def build_rwa_tokenization() -> Diagram:
    d = Diagram(width=1580, height=580)
    d.text("RWA (Real World Asset) Tokenization Architecture", 40, 20, 900, 30)

    originator = d.node("Originator\n(原資産保有者)", AWS["user"], 40, 120, 60, 70)
    investor = d.node("Investor", AWS["user"], 40, 380, 60, 70)

    spv = d.node("SPV / Trust\n(資産の法的保有者)", GENERIC["box_gray"], 220, 110, 180, 90)
    custodian = d.node("Qualified Custodian\n(現物資産を保管)", GENERIC["box_gray"], 460, 110, 180, 90)
    auditor = d.node("監査人\n(Proof-of-Reserve検証)", GENERIC["box"], 460, 260, 180, 70)
    oracle = d.node("Oracle Network\n(例: Chainlink PoR)", GENERIC["box_purple"], 700, 260, 180, 70)
    compliance_gate = d.node(
        "Tokenization Platform +\nCompliance Gate", GENERIC["box_orange"], 700, 110, 220, 90
    )
    token = d.node("RWA Token\n(ERC-3643)", GENERIC["box_purple"], 980, 110, 160, 90)
    identity_registry = d.node(
        "Identity Registry\n(ONCHAINID / KYC)", GENERIC["box_gray"], 980, 260, 220, 70
    )
    secondary_market = d.node(
        "許可制の二次流通市場\n(Permissioned DEX/ATS)", GENERIC["box_orange"], 1260, 110, 220, 90
    )

    d.edge(originator, spv, "資産譲渡")
    d.edge(spv, custodian, "現物資産の保管を委託")
    d.edge(custodian, auditor, "残高情報を提供", dashed=True)
    d.edge(auditor, oracle, "Proof-of-Reserveを証明", dashed=True)
    d.edge(oracle, compliance_gate, "準備金証明をオンチェーンに反映", dashed=True)
    d.edge(compliance_gate, token, "準備金確認後にmint")
    d.edge(investor, identity_registry, "KYC / 適格投資家確認")
    d.edge(identity_registry, compliance_gate, "検証済みウォレットのみ許可", dashed=True)
    d.edge(token, identity_registry, "移転時に必ず照会 (未認証は失敗)", dashed=True)
    d.edge(token, secondary_market, "認証済み保有者間で取引")
    d.edge(investor, token, "burnして償還請求")
    d.edge(token, spv, "償還: SPV経由で資産価値を返却", dashed=True)
    return d


BLOCKCHAIN_TEMPLATES = {
    "dapp-fullstack": build_dapp_fullstack,
    "l1-node-validator-architecture": build_l1_node_validator_architecture,
    "cross-chain-bridge": build_cross_chain_bridge,
    "oracle-integration": build_oracle_integration,
    "mpc-wallet-custody": build_mpc_wallet_custody,
    "rollup-l2-architecture": build_rollup_l2_architecture,
    "nft-marketplace": build_nft_marketplace,
    "x402-agentic-payments": build_x402_agentic_payments,
    "dex-amm": build_dex_amm,
    "cex-architecture": build_cex_architecture,
    "dao-governance": build_dao_governance,
    "defi-lending-protocol": build_defi_lending_protocol,
    "staking-liquid-staking": build_staking_liquid_staking,
    "perpetuals-dex": build_perpetuals_dex,
    "stablecoin": build_stablecoin,
    "token-launchpad": build_token_launchpad,
    "prediction-market": build_prediction_market,
    "rwa-tokenization": build_rwa_tokenization,
}


# ---------------------------------------------------------------------------
# AI / ML templates
# ---------------------------------------------------------------------------

def build_rag_pipeline() -> Diagram:
    d = Diagram(width=1680, height=560)
    d.text("RAG (Retrieval-Augmented Generation) Pipeline", 40, 20, 700, 30)

    user = d.node("User", AWS["user"], 40, 220, 60, 70)
    app = d.node("Application\n(Chat UI)", GENERIC["box"], 200, 220, 160, 70)

    docs = d.node("ドキュメント\n(社内資料/PDF等)", GENERIC["box_gray"], 200, 60, 160, 70)
    embed_ingest = d.node("Embedding Model\n(取り込み時)", GENERIC["box_purple"], 420, 60, 160, 70)
    vecdb = d.node("Vector Database\n(類似検索)", GENERIC["db_cylinder"], 640, 60, 90, 90)

    embed_query = d.node("Embedding Model\n(クエリ時)", GENERIC["box_purple"], 420, 220, 160, 70)
    retriever = d.node("Retriever\n(Top-K検索)", GENERIC["box_orange"], 640, 220, 160, 70)
    llm = d.node("LLM\n(生成)", AWS["bedrock"], 860, 220, ICON, ICON)
    guardrail = d.node("Guardrails\n(有害コンテンツ検知)", GENERIC["box_gray"], 860, 380, 160, 70)

    d.edge(user, app, "質問")
    d.edge(docs, embed_ingest, "バッチ処理")
    d.edge(embed_ingest, vecdb, "埋め込み保存")
    d.edge(app, embed_query, "クエリ")
    d.edge(embed_query, retriever, "")
    d.edge(retriever, vecdb, "類似検索")
    d.edge(retriever, llm, "関連文書 + プロンプト")
    d.edge(llm, guardrail, "", dashed=True)
    d.edge(llm, app, "生成結果")
    return d


def build_multi_agent_orchestration() -> Diagram:
    d = Diagram(width=1680, height=620)
    d.text("Multi-Agent Orchestration Architecture", 40, 20, 700, 30)

    user = d.node("User", AWS["user"], 40, 260, 60, 70)
    orchestrator = d.node("Orchestrator Agent\n(タスク分解 / ルーティング)", AWS["bedrock_agentcore"], 220, 250, ICON, ICON)

    agents = d.container("Sub-Agents", GROUPS["generic"], 400, 60, 620, 340)
    names = ["Research Agent", "Coding Agent", "Review Agent"]
    for i, name in enumerate(names):
        d.node(name, GENERIC["box_purple"], 40 + i * 200, 100, 160, 80, parent=agents)

    tools = d.container("Tools / MCP Servers", GROUPS["generic"], 1080, 60, 400, 340)
    for i, name in enumerate(["Web検索", "コード実行", "社内DB"]):
        d.node(name, GENERIC["box_orange"], 40, 80 + i * 90, 320, 60, parent=tools)

    memory = d.node("メモリ / 状態管理\n(会話履歴・タスク進捗)", GENERIC["db_cylinder"], 220, 440, 90, 90)
    guard = d.node("Guardrails\n(権限・出力検証)", GENERIC["box_gray"], 400, 460, 160, 70)

    d.edge(user, orchestrator, "指示")
    d.edge(orchestrator, agents, "サブタスク委任")
    d.edge(agents, tools, "ツール呼び出し (MCP)")
    d.edge(orchestrator, memory, "", dashed=True)
    d.edge(agents, guard, "", dashed=True)
    d.edge(orchestrator, user, "最終結果")
    return d


def build_llm_inference_gateway() -> Diagram:
    d = Diagram(width=1680, height=460)
    d.text("LLM Inference Gateway Architecture", 40, 20, 700, 30)

    app = d.node("アプリケーション", GENERIC["box"], 40, 190, 160, 70)
    gw = d.node("LLM Gateway\n(ルーティング/認証/課金)", GENERIC["box_orange"], 260, 180, 180, 90)
    cache = d.node("セマンティック\nキャッシュ", GENERIC["db_cylinder"], 260, 40, 90, 90)
    rate = d.node("レート制限 /\nコスト管理", GENERIC["box_gray"], 260, 340, 160, 70)

    models = d.container("モデルプロバイダ (マルチプロバイダ)", GROUPS["generic"], 540, 100, 500, 260)
    for i, name in enumerate(["Bedrock (Claude)", "OpenAI", "自社ホスティング"]):
        d.node(name, GENERIC["box_purple"], 30, 60 + i * 70, 440, 50, parent=models)

    obs = d.node("観測性\n(トークン数/レイテンシ/コスト)", GENERIC["box_gray"], 1120, 190, 180, 70)

    d.edge(app, gw, "リクエスト")
    d.edge(gw, cache, "キャッシュ確認", dashed=True)
    d.edge(gw, rate, "", dashed=True)
    d.edge(gw, models, "フォールバック付きルーティング")
    d.edge(models, obs, "", dashed=True)
    return d


def build_mcp_server_architecture() -> Diagram:
    d = Diagram(width=1600, height=460)
    d.text("MCP (Model Context Protocol) Server Architecture", 40, 20, 900, 30)

    agent = d.node("AI Agent / LLM Host\n(Claude Desktop, IDE等)", AWS["bedrock_agentcore"], 40, 190, ICON, ICON)
    client = d.node("MCP Client", GENERIC["box"], 200, 190, 160, 70)

    server = d.container("MCP Server", GROUPS["generic"], 440, 80, 380, 300)
    tools = d.node("Tools\n(関数実行)", GENERIC["box_orange"], 40, 80, 140, 70, parent=server)
    resources = d.node("Resources\n(データ提供)", GENERIC["box_orange"], 200, 80, 140, 70, parent=server)
    prompts = d.node("Prompts\n(テンプレート)", GENERIC["box_orange"], 40, 190, 140, 70, parent=server)
    auth = d.node("認証/認可", GENERIC["box_gray"], 200, 190, 140, 70, parent=server)

    backend = d.node("バックエンドAPI /\nデータベース", GENERIC["db_cylinder"], 920, 210, 90, 90)

    d.edge(agent, client, "")
    d.edge(client, server, "JSON-RPC over stdio/HTTP")
    d.edge(server, backend, "実際の処理を実行")
    return d


def build_vector_db_architecture() -> Diagram:
    d = Diagram(width=1600, height=460)
    d.text("Vector Database Architecture", 40, 20, 700, 30)

    ingest = d.node("データソース\n(文書/画像/ログ)", GENERIC["box_gray"], 40, 190, 160, 70)
    embed = d.node("Embedding Model", GENERIC["box_purple"], 260, 190, 160, 70)

    vecdb = d.container("Vector Database", GROUPS["generic"], 480, 80, 440, 300)
    index = d.node("ANNインデックス\n(HNSW/IVF)", GENERIC["db_cylinder"], 40, 100, 90, 90, parent=vecdb)
    meta = d.node("メタデータ\nフィルタリング", GENERIC["box"], 200, 100, 140, 90, parent=vecdb)
    shard = d.node("シャーディング /\nレプリケーション", GENERIC["box_orange"], 40, 210, 300, 60, parent=vecdb)

    query_app = d.node("検索アプリケーション\n(類似検索/RAG)", GENERIC["box"], 1000, 210, 160, 70)

    d.edge(ingest, embed, "")
    d.edge(embed, vecdb, "upsert")
    d.edge(vecdb, query_app, "Top-K類似検索\n(ANN)")
    return d


def build_fine_tuning_pipeline() -> Diagram:
    d = Diagram(width=1680, height=460)
    d.text("Model Fine-Tuning Pipeline", 40, 20, 700, 30)

    data = d.node("学習データ\n(ラベル付きデータセット)", GENERIC["box_gray"], 40, 190, 160, 70)
    prep = d.node("データ前処理 /\nクレンジング", GENERIC["box"], 260, 190, 160, 70)
    base = d.node("ベースモデル", AWS["sagemaker"], 460, 190, ICON, ICON)
    train = d.container("学習ジョブ (分散学習)", GROUPS["generic"], 620, 100, 340, 260)
    gpu = d.node("GPU Cluster\n(マルチノード)", GENERIC["box_orange"], 40, 100, 260, 80, parent=train)
    tuned = d.node("Fine-tuned Model", AWS["sagemaker"], 1040, 190, ICON, ICON)
    eval_ = d.node("評価\n(ベンチマーク/人手評価)", GENERIC["box"], 1220, 100, 160, 70)
    registry = d.node("モデルレジストリ", GENERIC["db_cylinder"], 1220, 260, 90, 90)
    deploy = d.node("推論エンドポイント\nへデプロイ", AWS["sagemaker"], 1420, 190, ICON, ICON)

    d.edge(data, prep, "")
    d.edge(prep, base, "")
    d.edge(base, train, "fine-tune")
    d.edge(train, tuned, "")
    d.edge(tuned, eval_, "")
    d.edge(tuned, registry, "バージョン管理", dashed=True)
    d.edge(eval_, deploy, "合格基準を満たした場合")
    return d


AI_TEMPLATES = {
    "rag-pipeline": build_rag_pipeline,
    "multi-agent-orchestration": build_multi_agent_orchestration,
    "llm-inference-gateway": build_llm_inference_gateway,
    "mcp-server-architecture": build_mcp_server_architecture,
    "vector-db-architecture": build_vector_db_architecture,
    "fine-tuning-pipeline": build_fine_tuning_pipeline,
}


# ---------------------------------------------------------------------------
# Cloud-agnostic distributed systems design patterns (generic shapes - not
# tied to AWS/GCP/Azure so the layout can be reused for any cloud)
# ---------------------------------------------------------------------------

def build_cqrs_event_sourcing() -> Diagram:
    d = Diagram(width=1360, height=520)
    d.text("CQRS + Event Sourcing Pattern", 40, 20, 700, 30)

    client = d.node("Client", AWS["user"], 40, 220, 60, 70)
    command = d.node("Command\n(状態を変更する意図)", GENERIC["box"], 200, 210, 160, 70)
    command_handler = d.node("Command Handler\n(ビジネスロジック検証)", GENERIC["box_orange"], 400, 205, 180, 80)
    event_store = d.node("Event Store\n(Append-Onlyイベントログ)", GENERIC["db_cylinder"], 620, 195, 160, 110)
    projector = d.node("Event Handler / Projector", GENERIC["box_purple"], 860, 120, 180, 70)
    read_model = d.node("Read Model\n(非正規化, クエリ最適化)", GENERIC["db_cylinder"], 1080, 115, 180, 80)
    query_api = d.node("Query API", GENERIC["box"], 860, 320, 180, 70)

    d.edge(client, command, "コマンド送信")
    d.edge(command, command_handler, "")
    d.edge(command_handler, event_store, "イベントをAppend")
    d.edge(event_store, projector, "イベント購読 (非同期)", dashed=True)
    d.edge(projector, read_model, "Read Modelを更新")
    d.edge(client, query_api, "クエリ")
    d.edge(query_api, read_model, "読み取り")
    return d


def build_saga_pattern() -> Diagram:
    d = Diagram(width=800, height=460)
    d.text("Saga Pattern (Orchestration-based, 分散トランザクション)", 40, 20, 900, 30)

    client = d.node("Client", AWS["user"], 40, 190, 60, 70)
    orchestrator = d.node("Saga Orchestrator\n(実行順序を管理)", GENERIC["box_orange"], 200, 180, 200, 90)
    order_svc = d.node("Order Service", GENERIC["box"], 480, 80, 180, 70)
    payment_svc = d.node("Payment Service", GENERIC["box"], 480, 200, 180, 70)
    inventory_svc = d.node("Inventory Service", GENERIC["box"], 480, 320, 180, 70)

    d.edge(client, orchestrator, "注文開始")
    d.edge(orchestrator, order_svc, "① 注文作成")
    d.edge(orchestrator, payment_svc, "② 決済実行")
    d.edge(orchestrator, inventory_svc, "③ 在庫引当")
    d.edge(payment_svc, orchestrator, "④ 決済失敗を通知", dashed=True)
    d.edge(orchestrator, order_svc, "⑤ 補償: 注文をキャンセル", dashed=True)
    return d


def build_circuit_breaker_bulkhead() -> Diagram:
    d = Diagram(width=1200, height=420)
    d.text("Circuit Breaker + Bulkhead Pattern", 40, 20, 900, 30)

    client = d.node("Client", AWS["user"], 40, 190, 60, 70)
    service_a = d.node("Service A\n(呼び出し元)", GENERIC["box"], 200, 180, 180, 90)
    cb = d.node("Circuit Breaker\n(Closed/Open/Half-Open)", GENERIC["box_orange"], 440, 180, 200, 90)
    bulkhead = d.node("Bulkhead\n(依存先ごとに独立したスレッド/接続プール)", GENERIC["box_gray"], 700, 90, 220, 70)
    service_b = d.node("Service B\n(正常時)", GENERIC["box"], 960, 90, 180, 70)
    service_c = d.node("Service C\n(障害発生中)", GENERIC["box_gray"], 960, 230, 180, 70)
    fallback = d.node("Fallback\n(デフォルト応答/キャッシュ)", GENERIC["box_green"], 700, 300, 220, 70)

    d.edge(client, service_a, "")
    d.edge(service_a, cb, "呼び出し")
    d.edge(cb, bulkhead, "Closed: 通過")
    d.edge(bulkhead, service_b, "専用プール経由")
    d.edge(bulkhead, service_c, "専用プール経由 (他依存先に影響しない)")
    d.edge(cb, fallback, "Open: 即座にフォールバック (障害の連鎖を防ぐ)", dashed=True)
    d.edge(service_c, cb, "連続失敗を検知 → Openへ遷移", dashed=True)
    return d


def build_strangler_fig_migration() -> Diagram:
    d = Diagram(width=980, height=420)
    d.text("Strangler Fig Migration Pattern", 40, 20, 700, 30)

    client = d.node("Client", AWS["user"], 40, 180, 60, 70)
    router = d.node("Facade / Router\n(ルーティングルールで振り分け)", GENERIC["box_orange"], 200, 170, 200, 90)
    legacy = d.node("Legacy Monolith\n(未移行機能, 段階的に縮小)", GENERIC["box_gray"], 480, 80, 220, 90)
    new_svc1 = d.node("New Microservice A\n(移行済み)", GENERIC["box_green"], 480, 260, 200, 80)
    new_svc2 = d.node("New Microservice B\n(移行済み)", GENERIC["box_green"], 720, 260, 200, 80)

    d.edge(client, router, "")
    d.edge(router, legacy, "未移行の機能はそのまま転送")
    d.edge(router, new_svc1, "移行済み機能Aへ転送")
    d.edge(router, new_svc2, "移行済み機能Bへ転送")
    d.text("→ 機能ごとに段階的に移行し、最終的にLegacyを完全に廃止する", 480, 180, 440, 30)
    return d


def build_backend_for_frontend() -> Diagram:
    d = Diagram(width=1140, height=460)
    d.text("Backend for Frontend (BFF) Pattern", 40, 20, 700, 30)

    web_client = d.node("Web Client", GENERIC["box"], 40, 80, 140, 70)
    mobile_client = d.node("Mobile Client", GENERIC["box"], 40, 220, 140, 70)
    partner_client = d.node("Partner / 3rd-party", GENERIC["box"], 40, 360, 140, 70)

    web_bff = d.node("Web BFF\n(Web向けに集約/整形)", GENERIC["box_orange"], 280, 80, 200, 70)
    mobile_bff = d.node("Mobile BFF\n(Mobile向けに集約/整形)", GENERIC["box_orange"], 280, 220, 200, 70)
    partner_bff = d.node("Partner BFF\n(外部公開用に制限)", GENERIC["box_orange"], 280, 360, 200, 70)

    svc_container = d.container("共有バックエンドマイクロサービス", GROUPS["generic"], 580, 80, 300, 350)
    user_svc = d.node("User Service", GENERIC["box"], 40, 40, 220, 70, parent=svc_container)
    order_svc = d.node("Order Service", GENERIC["box"], 40, 140, 220, 70, parent=svc_container)
    product_svc = d.node("Product Service", GENERIC["box"], 40, 240, 220, 70, parent=svc_container)

    d.edge(web_client, web_bff, "")
    d.edge(mobile_client, mobile_bff, "")
    d.edge(partner_client, partner_bff, "")
    d.edge(web_bff, svc_container, "必要なサービスのみ呼び出し")
    d.edge(mobile_bff, svc_container, "必要なサービスのみ呼び出し")
    d.edge(partner_bff, svc_container, "公開範囲を制限して呼び出し")
    return d


PATTERN_TEMPLATES = {
    "cqrs-event-sourcing": build_cqrs_event_sourcing,
    "saga-pattern": build_saga_pattern,
    "circuit-breaker-bulkhead": build_circuit_breaker_bulkhead,
    "strangler-fig-migration": build_strangler_fig_migration,
    "backend-for-frontend": build_backend_for_frontend,
}


def main():
    groups = {
        "aws": AWS_TEMPLATES,
        "blockchain": BLOCKCHAIN_TEMPLATES,
        "ai": AI_TEMPLATES,
        "patterns": PATTERN_TEMPLATES,
    }
    total = 0
    for folder, templates in groups.items():
        out_dir = os.path.join(OUT, folder)
        os.makedirs(out_dir, exist_ok=True)
        for name, builder in templates.items():
            d = builder()
            path = os.path.join(out_dir, f"{name}.drawio")
            d.save(path, name=name)
            print(f"wrote {path}")
            total += 1
    print(f"\n{total} templates generated.")


if __name__ == "__main__":
    main()
