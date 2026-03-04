#!/usr/bin/env python3
"""
AWS最新ニュースをRSSフィードから取得するスクリプト。
AI Engineering カテゴリに関連するニュースをフィルタリング・優先表示する。

Usage:
    python fetch_aws_news.py [--days 7] [--category ai] [--limit 20]
"""

import argparse
import ssl
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict
from urllib.request import urlopen, Request
from urllib.error import URLError
import json
import re
import sys

_SSL_CTX = None  # Set via --no-ssl-verify flag

# AI Engineering 関連キーワード
AI_KEYWORDS = [
    "bedrock", "sagemaker", "machine learning", "ml", "ai",
    "generative", "llm", "foundation model", "neural",
    "deep learning", "nlp", "natural language",
    "claude", "anthropic", "titan", "mistral", "llama", "cohere",
    "amazon q", "codewhisperer", "codeguru",
    "kendra", "lex", "comprehend", "rekognition", "textract",
    "transcribe", "polly", "translate", "personalize", "forecast",
    "trainium", "inferentia", "neuron",
    "rag", "embedding", "vector", "agent", "guardrail",
    "partyrock", "prompt", "fine-tun",
]

RSS_FEEDS = {
    "What's New with AWS": {
        "url": "https://aws.amazon.com/jp/about-aws/whats-new/recent/feed/",
        "priority": 1,
    },
    "AWS Blog": {
        "url": "https://aws.amazon.com/blogs/aws/feed/",
        "priority": 1,
    },
    "AWS Machine Learning Blog": {
        "url": "https://aws.amazon.com/jp/blogs/machine-learning/feed/",
        "priority": 0,  # Highest priority for AI Engineering
    },
    "AWS Japan Blog": {
        "url": "https://aws.amazon.com/jp/blogs/news/feed/",
        "priority": 1,
    },
    "週刊AWS": {
        "url": "https://aws.amazon.com/jp/blogs/news/tag/%E9%80%B1%E5%88%8Aaws/feed/",
        "priority": 1,
    },
    "AWS Developer Blog": {
        "url": "https://aws.amazon.com/jp/blogs/developer/feed/",
        "priority": 2,
    },
    "AWS Architecture Blog": {
        "url": "https://aws.amazon.com/jp/blogs/architecture/feed/",
        "priority": 2,
    },
    "AWS Compute Blog": {
        "url": "https://aws.amazon.com/jp/blogs/compute/feed/",
        "priority": 2,
    },
    "AWS DevOps Blog": {
        "url": "https://aws.amazon.com/jp/blogs/devops/feed/",
        "priority": 2,
    },
    "AWS Security Blog": {
        "url": "https://aws.amazon.com/jp/blogs/security/feed/",
        "priority": 3,
    },
    "AWS Database Blog": {
        "url": "https://aws.amazon.com/jp/blogs/database/feed/",
        "priority": 3,
    },
    "AWS Big Data Blog": {
        "url": "https://aws.amazon.com/jp/blogs/big-data/feed/",
        "priority": 2,
    },
    "AWS Open Source Blog": {
        "url": "https://aws.amazon.com/jp/blogs/opensource/feed/",
        "priority": 2,
    },
}


def is_ai_related(title: str, description: str = "") -> bool:
    """記事がAI/ML関連かどうかを判定"""
    text = (title + " " + description).lower()
    return any(kw in text for kw in AI_KEYWORDS)


def parse_rss_date(date_str: str) -> Optional[datetime]:
    """RSS日付文字列をdatetimeに変換"""
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


def fetch_feed(name: str, url: str, days: int) -> List[Dict]:
    """RSSフィードを取得して記事リストを返す"""
    articles = []
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    try:
        req = Request(url, headers={"User-Agent": "AWS-CB-NewsBot/1.0"})
        with urlopen(req, timeout=10, context=_SSL_CTX) as response:
            tree = ET.parse(response)
            root = tree.getroot()

            # Handle both RSS and Atom feeds
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            items = root.findall(".//item")
            if not items:
                items = root.findall(".//atom:entry", ns)

            for item in items:
                # Note: Element.__bool__ is False when element has no children,
                # so we must use `is None` checks instead of `or`.
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
                # Strip HTML tags from description
                description = re.sub(r"<[^>]+>", "", description)[:200]

                if pub_date and pub_date < cutoff:
                    continue

                ai_related = is_ai_related(title, description)

                articles.append({
                    "source": name,
                    "title": title.strip(),
                    "link": link.strip(),
                    "date": pub_date.isoformat() if pub_date else "",
                    "description": description.strip(),
                    "ai_related": ai_related,
                })

    except (URLError, ET.ParseError, Exception) as e:
        print(f"  [WARN] {name}: {e}", file=sys.stderr)

    return articles


def main():
    parser = argparse.ArgumentParser(description="Fetch AWS news from RSS feeds")
    parser.add_argument("--days", type=int, default=7, help="Number of days to look back (default: 7)")
    parser.add_argument("--category", choices=["ai", "all"], default="all", help="Filter by category")
    parser.add_argument("--limit", type=int, default=30, help="Max articles to show (default: 30)")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--no-ssl-verify", action="store_true", help="Disable SSL verification (for macOS cert issues)")
    args = parser.parse_args()

    global _SSL_CTX
    if args.no_ssl_verify:
        _SSL_CTX = ssl._create_unverified_context()

    all_articles = []

    for name, config in RSS_FEEDS.items():
        articles = fetch_feed(name, config["url"], args.days)
        for a in articles:
            a["priority"] = config["priority"]
        all_articles.extend(articles)

    # Filter by category if specified
    if args.category == "ai":
        all_articles = [a for a in all_articles if a["ai_related"]]

    # Sort: AI-related first, then by priority, then by date
    all_articles.sort(key=lambda a: (not a["ai_related"], a["priority"], a.get("date", "") == "", a.get("date", "")))
    all_articles.reverse()
    # Re-sort to keep AI first
    all_articles.sort(key=lambda a: (not a["ai_related"], a["priority"]))

    # Limit
    all_articles = all_articles[:args.limit]

    if args.json:
        print(json.dumps(all_articles, ensure_ascii=False, indent=2))
    else:
        ai_articles = [a for a in all_articles if a["ai_related"]]
        other_articles = [a for a in all_articles if not a["ai_related"]]

        if ai_articles:
            print("=" * 60)
            print("🤖 AI/ML 関連ニュース（AI Engineering カテゴリ向け）")
            print("=" * 60)
            for a in ai_articles:
                date_str = a["date"][:10] if a["date"] else "N/A"
                print(f"\n📌 [{a['source']}] {date_str}")
                print(f"   {a['title']}")
                print(f"   {a['link']}")
                if a["description"]:
                    print(f"   > {a['description'][:100]}...")

        if other_articles:
            print(f"\n{'=' * 60}")
            print("📰 その他の AWS ニュース")
            print("=" * 60)
            for a in other_articles:
                date_str = a["date"][:10] if a["date"] else "N/A"
                print(f"\n  [{a['source']}] {date_str}")
                print(f"   {a['title']}")
                print(f"   {a['link']}")

        print(f"\n--- {len(all_articles)} 件の記事を表示（過去{args.days}日間）---")


if __name__ == "__main__":
    main()
