# レポート構造とfindingスキーマ

## カテゴリ担当サブエージェントが返すJSON（親に渡すのはこれだけ）

生のコマンド出力やログを親コンテキストに持ち帰らせない。各カテゴリのサブエージェントには
必ず「この形式のJSON配列だけを最後に出力せよ、途中のコマンド出力は要約に留めよ」と指示する。

```json
{
  "category": "authentication",
  "status": "completed",
  "notes": "対象は /api 配下。ローカルで npm run dev により起動して検証した。",
  "findings": [
    {
      "id": "AUTH-01",
      "severity": "critical",
      "title": "パスワードリセットAPIが未認証で任意ユーザーのトークンを発行する",
      "category": "authentication",
      "location": "src/routes/auth.ts:42",
      "description": "POST /api/reset-password は email のみを検証しており、所有者確認なしにトークンを返す。",
      "evidence": "curl -X POST localhost:3000/api/reset-password -d '{\"email\":\"victim@example.com\"}' → 200 { token: \"...\" }",
      "reproduction_steps": [
        "対象をローカルで起動する (npm run dev)",
        "curl -X POST localhost:3000/api/reset-password -d '{\"email\":\"victim@example.com\"}'",
        "レスポンスに含まれる token でパスワードを変更できることを確認する"
      ],
      "impact": "任意アカウントの乗っ取りが可能",
      "remediation": "リクエスト元がメールのオーナーであることを検証する（メール送付＋トークンをメールのみで配布する等）まで、レスポンスにtokenを含めない",
      "suggested_regression_test": "test/auth/reset-password.test.ts に、email だけでは token が返らないことを確認するテストを追加する",
      "confidence": "confirmed"
    }
  ]
}
```

フィールドの意味:
- `severity`: `critical` / `high` / `medium` / `low` / `info`（`references/report-template.md`下部の基準）
- `confidence`: `confirmed`（実際に再現した）/ `likely`（コードレビューから強く推測されるが未実行確認）/
  `needs-review`（さらなる調査が必要）。**再現していないものを`confirmed`にしない**
- `status`（カテゴリ全体）: `completed` / `partial`（一部未実施、`notes`に理由） / `skipped`（対象外、理由必須）

## Severity基準

| Severity | 目安 |
|---|---|
| critical | 認証/認可バイパス、リモートコード実行、任意ファイル読み書き、シークレット漏洩による全体侵害 |
| high | 特定条件下でのデータ漏洩・改ざん、権限昇格、深刻なDoS |
| medium | 情報漏洩（内部パス、スタックトレース）、レート制限欠如、軽度のリソース枯渇 |
| low | ベストプラクティス逸脱で直接の悪用シナリオが弱いもの |
| info | 所見だが脆弱性ではない（性能観点、コード品質等） |

## 最終レポート（Markdown、`AUDIT_REPORT.md` として保存）の構成

```markdown
# セキュリティ・性能監査レポート: <対象名>

## 概要
- 対象: <repo/path、コミットハッシュ>
- 実施日: <date>
- スコープ: <実施したカテゴリ一覧、未実施カテゴリと理由>
- サマリ: critical N件 / high N件 / medium N件 / low N件 / info N件

## 重大な所見（critical / high）
<各所見をタイトル・場所・再現手順・影響・修正案・推奨回帰テストつきで記載>

## その他の所見（medium / low / info）
<同上、簡潔に>

## パフォーマンス/負荷テスト結果
<レイテンシ・スループット・劣化ポイント。severityではなくobservationとして記載>

## 実施した既存テストスイートの結果
<unit/integration/regression/buildの結果>

## 静的解析・依存関係スキャン結果
<ツール名・検出件数・重大なもの>

## GitHub/CIセキュリティ
<Actions権限、pin、シークレット露出等>

## 未実施のテストと理由
<対象を起動できなかった、外部ホストのため実行しなかった等>

## 付録: 全所見一覧（表形式）
| ID | Severity | Category | Title | Confidence |
```

HTML Artifact版も作る場合は、上記と同じ内容を `artifact-design` スキルの指示に従って
構成する（severityごとの色分け、フィルタ機能程度に留め、過剰な装飾はしない）。
