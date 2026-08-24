#!/usr/bin/env bash
# シークレットスキャン。gitleaks/trufflehogがあれば使い、無ければgrepベースの簡易パターンで代替する。
# Usage: leak_scan.sh <target-dir>
set -uo pipefail

TARGET="${1:-.}"

if command -v gitleaks >/dev/null 2>&1; then
  echo "=== gitleaks ==="
  gitleaks detect --source "$TARGET" --no-git -v || true
  exit 0
fi

if command -v trufflehog >/dev/null 2>&1; then
  echo "=== trufflehog ==="
  trufflehog filesystem "$TARGET" --only-verified || trufflehog filesystem "$TARGET"
  exit 0
fi

echo "=== fallback grep-based leak scan (no gitleaks/trufflehog available) ==="
echo "NOTE: this is a coarse heuristic scan, not a substitute for a real credential scanner."

cd "$TARGET"

# パターン: よくある漏洩しがちな値の形（実在するトークン形式を検知するための正規表現であり、
# 実際のトークン値ではない）
PATTERNS=(
  'AKIA[0-9A-Z]{16}'                                 # AWS access key id format
  '-----BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY-----' # private key headers
  'xox[baprs]-[0-9A-Za-z-]{10,48}'                   # Slack token format
  'ghp_[0-9A-Za-z]{36}'                              # GitHub PAT format
  '(?i)(api[_-]?key|password|token)["'\'']?\s*[:=]\s*["'\''][^"'\'' ]{8,}["'\'']'
)

for p in "${PATTERNS[@]}"; do
  echo "--- pattern: $p ---"
  grep -rInE "$p" \
    --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=build \
    . 2>/dev/null || true
done

echo "---"
echo "Also check: .env* files that are NOT gitignored, and 'git log -p' for values removed but still present in history."
