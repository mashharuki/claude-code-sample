#!/usr/bin/env python3
"""
AWS最新ニュースをRSSフィードから一括取得するスクリプト。
全カテゴリのフィードを取得し、分類・重複排除してJSON/Markdown形式で出力する。

Usage:
    python fetch_aws_news.py --days 7 --json
    python fetch_aws_news.py --days 3 --category ai-ml --focus bedrock
    python fetch_aws_news.py --days 14 --markdown
"""

import argparse
import concurrent.futures
import json
import re
import ssl
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from urllib.error import URLError
from urllib.request import Request, urlopen

# ---------------------------------------------------------------------------
# Feed definitions
# ---------------------------------------------------------------------------

RSS_FEEDS: Dict[str, Dict] = {
    # Group 1: Core
    "AWS News Blog": {
        "url": "https://aws.amazon.com/blogs/aws/feed/",
        "group": 1,
        "categories": ["new-services", "updates"],
    },
    "AWS What's New": {
        "url": "https://aws.amazon.com/new/feed/",
        "group": 1,
        "categories": ["new-services", "updates"],
    },
    "AWS Japan Blog": {
        "url": "https://aws.amazon.com/jp/blogs/news/feed/",
        "group": 1,
        "categories": ["japan"],
    },
    # Group 2: Service blogs
    "Architecture Blog": {
        "url": "https://aws.amazon.com/blogs/architecture/feed/",
        "group": 2,
        "categories": ["updates"],
    },
    "Compute Blog": {
        "url": "https://aws.amazon.com/blogs/compute/feed/",
        "group": 2,
        "categories": ["updates"],
    },
    "Security Blog": {
        "url": "https://aws.amazon.com/blogs/security/feed/",
        "group": 2,
        "categories": ["security"],
    },
    "Database Blog": {
        "url": "https://aws.amazon.com/blogs/database/feed/",
        "group": 2,
        "categories": ["updates"],
    },
    "DevOps Blog": {
        "url": "https://aws.amazon.com/blogs/devops/feed/",
        "group": 2,
        "categories": ["updates"],
    },
    "Machine Learning Blog": {
        "url": "https://aws.amazon.com/blogs/machine-learning/feed/",
        "group": 2,
        "categories": ["ai-ml"],
    },
    "Containers Blog": {
        "url": "https://aws.amazon.com/blogs/containers/feed/",
        "group": 2,
        "categories": ["containers"],
    },
    "Serverless Blog": {
        "url": "https://aws.amazon.com/blogs/compute/category/serverless/feed/",
        "group": 2,
        "categories": ["serverless"],
    },
    # Group 3: Community & status
    "Open Source Blog": {
        "url": "https://aws.amazon.com/blogs/opensource/feed/",
        "group": 3,
        "categories": ["community"],
    },
    "Startup Blog": {
        "url": "https://aws.amazon.com/blogs/startups/feed/",
        "group": 3,
        "categories": ["community"],
    },
    "Service Health Dashboard": {
        "url": "https://status.aws.amazon.com/rss/all.rss",
        "group": 3,
        "categories": ["incidents"],
    },
}

# Category detection keywords
CATEGORY_KEYWORDS = {
    "new-services": ["announcing", "launches", "introduces", "now available", "preview"],
    "updates": ["now supports", "adds", "updates", "enhanced", "improved"],
    "security": ["security", "iam", "guardduty", "waf", "shield", "compliance", "encryption"],
    "ai-ml": [
        "bedrock", "sagemaker", "machine learning", "ml", "generative ai",
        "llm", "foundation model", "amazon q", "claude", "titan",
        "rag", "embedding", "vector", "agent", "guardrail",
        "trainium", "inferentia", "rekognition", "textract",
        "comprehend", "transcribe", "polly", "kendra", "lex",
    ],
    "containers": ["ecs", "eks", "fargate", "container", "kubernetes", "docker", "app runner"],
    "serverless": ["lambda", "step functions", "api gateway", "eventbridge", "serverless", "sam"],
    "japan": [],  # Detected by source feed only
    "incidents": [],  # Detected by source feed only
}

_SSL_CTX = None


def parse_rss_date(date_str: str) -> Optional[datetime]:
    formats = [
        "%a, %d %b %Y %H:%M:%S %z",
        "%a, %d %b %Y %H:%M:%S %Z",
        "%Y-%m-%dT%H:%M:%S%z",
        "%Y-%m-%dT%H:%M:%SZ",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    return None


def classify_article(title: str, description: str, source_categories: List[str]) -> str:
    """Determine the primary category for an article."""
    text = (title + " " + description).lower()

    # Source-based categories take priority
    for cat in source_categories:
        if cat in ("japan", "incidents", "community"):
            return cat

    # Keyword-based detection (priority order)
    priority = ["ai-ml", "security", "containers", "serverless", "new-services", "updates"]
    for cat in priority:
        if any(kw in text for kw in CATEGORY_KEYWORDS.get(cat, [])):
            return cat

    # Fallback to source category
    return source_categories[0] if source_categories else "updates"


def fetch_feed(name: str, config: Dict, days: int) -> List[Dict]:
    articles = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    try:
        req = Request(config["url"], headers={"User-Agent": "AWS-News-Collector/2.0"})
        with urlopen(req, timeout=15, context=_SSL_CTX) as response:
            tree = ET.parse(response)
            root = tree.getroot()

            ns = {"atom": "http://www.w3.org/2005/Atom"}
            items = root.findall(".//item")
            if not items:
                items = root.findall(".//atom:entry", ns)

            for item in items:
                title_el = item.find("title")
                if title_el is None:
                    title_el = item.find("atom:title", ns)
                link_el = item.find("link")
                if link_el is None:
                    link_el = item.find("atom:link", ns)
                date_el = item.find("pubDate")
                if date_el is None:
                    date_el = item.find("atom:published", ns)
                desc_el = item.find("description")
                if desc_el is None:
                    desc_el = item.find("atom:summary", ns)

                title = title_el.text if title_el is not None and title_el.text else ""
                link = ""
                if link_el is not None:
                    link = link_el.text or link_el.get("href", "")
                pub_date = parse_rss_date(date_el.text) if date_el is not None and date_el.text else None
                description = desc_el.text if desc_el is not None and desc_el.text else ""
                description = re.sub(r"<[^>]+>", "", description)[:300]

                # Normalize timezone awareness for comparison
                if pub_date:
                    if pub_date.tzinfo is None:
                        pub_date = pub_date.replace(tzinfo=timezone.utc)
                    if pub_date < cutoff:
                        continue

                category = classify_article(title, description, config.get("categories", []))

                articles.append({
                    "source": name,
                    "title": title.strip(),
                    "link": link.strip(),
                    "date": pub_date.isoformat() if pub_date else "",
                    "date_short": pub_date.strftime("%Y-%m-%d") if pub_date else "N/A",
                    "description": description.strip(),
                    "category": category,
                })

    except (URLError, ET.ParseError, Exception) as e:
        print(f"  [WARN] {name}: {e}", file=sys.stderr)

    return articles


def deduplicate(articles: List[Dict]) -> List[Dict]:
    seen_links = set()
    unique = []
    for a in articles:
        if a["link"] and a["link"] not in seen_links:
            seen_links.add(a["link"])
            unique.append(a)
    return unique


def apply_focus(articles: List[Dict], focus: str) -> List[Dict]:
    keywords = [kw.strip().lower() for kw in focus.split(",")]
    for a in articles:
        text = (a["title"] + " " + a["description"]).lower()
        a["highlighted"] = any(kw in text for kw in keywords)
    return articles


def to_markdown(articles: List[Dict], days: int, category_filter: Optional[str], focus: Optional[str]) -> str:
    now = datetime.now()
    start = now - timedelta(days=days)
    lines = [
        f"# AWS最新情報レポート",
        f"**期間**: {start.strftime('%Y-%m-%d')} 〜 {now.strftime('%Y-%m-%d')}（過去{days}日間）",
        f"**取得日時**: {now.strftime('%Y-%m-%d %H:%M')}",
        f"**総記事数**: {len(articles)}件",
    ]
    if focus:
        lines.append(f"**注目サービス**: {focus}（★マーク付き）")
    lines.append("")
    lines.append("---")
    lines.append("")

    category_names = {
        "new-services": "新サービス発表",
        "updates": "機能アップデート",
        "ai-ml": "AI/ML",
        "security": "セキュリティ",
        "containers": "コンテナ",
        "serverless": "サーバーレス",
        "japan": "日本関連",
        "incidents": "障害情報",
        "community": "コミュニティ",
    }

    category_order = ["new-services", "ai-ml", "security", "updates", "containers", "serverless", "japan", "incidents", "community"]

    for cat in category_order:
        if category_filter and category_filter != "all" and cat != category_filter:
            continue
        cat_articles = [a for a in articles if a["category"] == cat]
        if not cat_articles:
            continue

        cat_articles.sort(key=lambda a: a.get("date", ""), reverse=True)
        display = cat_articles[:15]

        lines.append(f"## {category_names.get(cat, cat)}")
        lines.append("")
        lines.append("| # | タイトル | 日付 | ソース |")
        lines.append("|---|---------|------|--------|")

        for i, a in enumerate(display, 1):
            mark = " ★" if a.get("highlighted") else ""
            title_text = a["title"][:80]
            lines.append(f"| {i} | [{title_text}]({a['link']}){mark} | {a['date_short']} | {a['source']} |")

        if len(cat_articles) > 15:
            lines.append(f"\n*他 {len(cat_articles) - 15} 件*")
        lines.append("")

    lines.append("---")
    lines.append("")
    lines.append("## 参考リンク集")
    lines.append("- [AWS News Blog](https://aws.amazon.com/blogs/aws/)")
    lines.append("- [AWS What's New](https://aws.amazon.com/new/)")
    lines.append("- [AWS Japan Blog](https://aws.amazon.com/jp/blogs/news/)")
    lines.append("- [Last Week in AWS](https://www.lastweekinaws.com/)")
    lines.append("- [AWS re:Post](https://repost.aws/)")
    lines.append("")

    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Fetch AWS news from RSS feeds")
    parser.add_argument("--days", type=int, default=7, help="Days to look back (default: 7)")
    parser.add_argument("--category", default="all",
                        choices=["all", "new-services", "updates", "security", "ai-ml",
                                 "containers", "serverless", "japan", "incidents", "community"],
                        help="Filter by category")
    parser.add_argument("--focus", type=str, default=None, help="Highlight articles matching service names (comma-separated)")
    parser.add_argument("--limit", type=int, default=100, help="Max articles (default: 100)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--markdown", action="store_true", help="Output as Markdown")
    parser.add_argument("--no-ssl-verify", action="store_true", help="Disable SSL verification")
    args = parser.parse_args()

    global _SSL_CTX
    if args.no_ssl_verify:
        _SSL_CTX = ssl._create_unverified_context()

    # Fetch all feeds concurrently
    all_articles = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(fetch_feed, name, config, args.days): name
            for name, config in RSS_FEEDS.items()
        }
        for future in concurrent.futures.as_completed(futures):
            name = futures[future]
            try:
                articles = future.result()
                all_articles.extend(articles)
                print(f"  [OK] {name}: {len(articles)} articles", file=sys.stderr)
            except Exception as e:
                print(f"  [ERR] {name}: {e}", file=sys.stderr)

    # Deduplicate
    all_articles = deduplicate(all_articles)

    # Filter by category
    if args.category != "all":
        all_articles = [a for a in all_articles if a["category"] == args.category]

    # Apply focus highlighting
    if args.focus:
        all_articles = apply_focus(all_articles, args.focus)

    # Sort by date (newest first)
    all_articles.sort(key=lambda a: a.get("date", ""), reverse=True)

    # Limit
    all_articles = all_articles[: args.limit]

    # Output
    if args.json:
        print(json.dumps(all_articles, ensure_ascii=False, indent=2))
    elif args.markdown:
        print(to_markdown(all_articles, args.days, args.category, args.focus))
    else:
        # Default: summary to stdout
        cats = {}
        for a in all_articles:
            cats.setdefault(a["category"], []).append(a)

        print(f"\nAWS News Summary (past {args.days} days) - {len(all_articles)} articles\n")
        for cat, items in sorted(cats.items()):
            print(f"  [{cat}] {len(items)} articles")
        print()

        for cat, items in sorted(cats.items()):
            print(f"=== {cat.upper()} ===")
            for a in items[:10]:
                mark = " ★" if a.get("highlighted") else ""
                print(f"  {a['date_short']}  {a['title'][:70]}{mark}")
                print(f"             {a['link']}")
            if len(items) > 10:
                print(f"  ... and {len(items) - 10} more")
            print()


if __name__ == "__main__":
    main()
