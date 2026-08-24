#!/usr/bin/env python3
"""各カテゴリのJSON所見ファイルを集約し、AUDIT_REPORT.md を生成する。

Usage:
  python3 aggregate_report.py --findings-dir <dir> --target <name> --out AUDIT_REPORT.md \
      [--commit <sha>] [--scope-note "text"]

各カテゴリJSONは references/report-template.md のスキーマに従う:
  {"category": str, "status": "completed"|"partial"|"skipped", "notes": str, "findings": [...]}

<findings-dir> 内の *.json をすべて読み込み、findings を severity 順に並べて
Markdownレポートを組み立てる。生ログではなく、この構造化データだけを扱う。
"""
import argparse
import json
import sys
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}


def load_category_files(findings_dir: Path):
    categories = []
    for f in sorted(findings_dir.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            print(f"WARN: skipping unparseable file {f}: {e}", file=sys.stderr)
            continue
        data.setdefault("_source_file", f.name)
        categories.append(data)
    return categories


def all_findings(categories):
    findings = []
    skipped_duplicates = 0
    for cat in categories:
        for finding in cat.get("findings", []):
            if finding.get("duplicate_of"):
                # 別カテゴリの所見と根本原因が同じであることを手動でマークされたもの。
                # 集約レポートを水増ししないよう除外する（元のfindingは残す方のIDに統合済みの前提）。
                skipped_duplicates += 1
                continue
            finding = dict(finding)
            finding.setdefault("category", cat.get("category", "unknown"))
            findings.append(finding)
    findings.sort(key=lambda x: SEVERITY_ORDER.get(x.get("severity", "info"), 5))
    if skipped_duplicates:
        print(f"INFO: excluded {skipped_duplicates} finding(s) marked duplicate_of", file=sys.stderr)
    return findings


def counts_by_severity(findings):
    c = defaultdict(int)
    for f in findings:
        c[f.get("severity", "info")] += 1
    return c


def render_finding(f, index):
    lines = []
    sev = f.get("severity", "info").upper()
    lines.append(f"### [{sev}] {f.get('id', f'F-{index}')}: {f.get('title', '(no title)')}")
    lines.append("")
    lines.append(f"- **Category**: {f.get('category', 'unknown')}")
    lines.append(f"- **Location**: {f.get('location', 'n/a')}")
    lines.append(f"- **Confidence**: {f.get('confidence', 'unknown')}")
    lines.append("")
    if f.get("description"):
        lines.append(f"**説明**: {f['description']}")
        lines.append("")
    if f.get("evidence"):
        lines.append("**証跡**:")
        lines.append("```")
        lines.append(str(f["evidence"]))
        lines.append("```")
        lines.append("")
    steps = f.get("reproduction_steps")
    if steps:
        lines.append("**再現手順**:")
        for i, s in enumerate(steps, 1):
            lines.append(f"{i}. {s}")
        lines.append("")
    if f.get("impact"):
        lines.append(f"**影響**: {f['impact']}")
        lines.append("")
    if f.get("remediation"):
        lines.append(f"**修正案**: {f['remediation']}")
        lines.append("")
    if f.get("suggested_regression_test"):
        lines.append(f"**推奨する回帰テスト**: {f['suggested_regression_test']}")
        lines.append("")
    return "\n".join(lines)


def build_report(categories, target, commit, scope_note):
    findings = all_findings(categories)
    counts = counts_by_severity(findings)
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    completed = [c["category"] for c in categories if c.get("status") == "completed"]
    partial = [(c["category"], c.get("notes", "")) for c in categories if c.get("status") == "partial"]
    skipped = [(c["category"], c.get("notes", "")) for c in categories if c.get("status") == "skipped"]

    out = []
    out.append(f"# セキュリティ・性能監査レポート: {target}")
    out.append("")
    out.append("## 概要")
    out.append(f"- 対象: {target}")
    if commit:
        out.append(f"- コミット: {commit}")
    out.append(f"- 実施日時: {now}")
    if scope_note:
        out.append(f"- スコープメモ: {scope_note}")
    out.append(
        "- サマリ: "
        + ", ".join(f"{sev} {counts.get(sev, 0)}件" for sev in ["critical", "high", "medium", "low", "info"])
    )
    out.append(f"- 実施カテゴリ: {', '.join(completed) if completed else '(なし)'}")
    if partial:
        out.append("- 一部実施: " + ", ".join(f"{c}（{n}）" for c, n in partial))
    if skipped:
        out.append("- 未実施: " + ", ".join(f"{c}（{n}）" for c, n in skipped))
    out.append("")

    critical_high = [f for f in findings if f.get("severity") in ("critical", "high")]
    other = [f for f in findings if f.get("severity") not in ("critical", "high")]

    out.append("## 重大な所見（critical / high）")
    out.append("")
    if not critical_high:
        out.append("該当なし。")
    for i, f in enumerate(critical_high, 1):
        out.append(render_finding(f, i))
    out.append("")

    out.append("## その他の所見（medium / low / info）")
    out.append("")
    if not other:
        out.append("該当なし。")
    for i, f in enumerate(other, 1):
        out.append(render_finding(f, i))
    out.append("")

    out.append("## 未実施のテストと理由")
    out.append("")
    if not (partial or skipped):
        out.append("すべてのカテゴリを実施した。")
    else:
        for c, n in partial + skipped:
            out.append(f"- {c}: {n}")
    out.append("")

    out.append("## 付録: 全所見一覧")
    out.append("")
    out.append("| ID | Severity | Category | Title | Confidence |")
    out.append("|---|---|---|---|---|")
    for f in findings:
        out.append(
            f"| {f.get('id', '-')} | {f.get('severity', '-')} | {f.get('category', '-')} "
            f"| {f.get('title', '-')} | {f.get('confidence', '-')} |"
        )
    out.append("")

    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--findings-dir", required=True, type=Path)
    ap.add_argument("--target", required=True)
    ap.add_argument("--out", required=True, type=Path)
    ap.add_argument("--commit", default="")
    ap.add_argument("--scope-note", default="")
    args = ap.parse_args()

    categories = load_category_files(args.findings_dir)
    if not categories:
        print(f"WARN: no category JSON files found in {args.findings_dir}", file=sys.stderr)

    report = build_report(categories, args.target, args.commit, args.scope_note)
    args.out.write_text(report, encoding="utf-8")
    findings_count = sum(len(c.get("findings", [])) for c in categories)
    print(f"Wrote {args.out} ({findings_count} findings across {len(categories)} categories)")


if __name__ == "__main__":
    main()
