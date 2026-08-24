#!/usr/bin/env bash
# 対象リポジトリの言語/スタックを検出し、以降のフェーズで使う情報を出力する。
# Usage: detect_stack.sh <target-dir>
set -euo pipefail

TARGET="${1:-.}"
cd "$TARGET"

echo "=== stack detection: $TARGET ==="

detect_node() {
  [ -f package.json ] || return 1
  echo "language: Node.js/TypeScript"
  if [ -f pnpm-lock.yaml ]; then echo "package_manager: pnpm"
  elif [ -f yarn.lock ]; then echo "package_manager: yarn"
  else echo "package_manager: npm"
  fi
  if command -v node >/dev/null 2>&1; then
    TEST_SCRIPT=$(node -e "try{const p=require('./package.json');console.log((p.scripts&&p.scripts.test)||'')}catch(e){}" 2>/dev/null || true)
    echo "test_script: ${TEST_SCRIPT:-<none found in package.json scripts.test>}"
  fi
  return 0
}

detect_python() {
  { [ -f pyproject.toml ] || [ -f requirements.txt ] || [ -f setup.py ]; } || return 1
  echo "language: Python"
  [ -f pytest.ini ] || [ -f pyproject.toml ] && echo "test_framework_hint: pytest (verify)"
  return 0
}

detect_go() {
  [ -f go.mod ] || return 1
  echo "language: Go"
  echo "test_command: go test ./..."
  return 0
}

detect_rust() {
  [ -f Cargo.toml ] || return 1
  echo "language: Rust"
  echo "test_command: cargo test"
  return 0
}

detect_java() {
  { [ -f pom.xml ] || [ -f build.gradle ] || [ -f build.gradle.kts ]; } || return 1
  echo "language: Java/Kotlin"
  [ -f pom.xml ] && echo "test_command: mvn test"
  { [ -f build.gradle ] || [ -f build.gradle.kts ]; } && echo "test_command: ./gradlew test"
  return 0
}

FOUND=0
detect_node   && FOUND=1
detect_python && FOUND=1
detect_go     && FOUND=1
detect_rust   && FOUND=1
detect_java   && FOUND=1

if [ "$FOUND" -eq 0 ]; then
  echo "language: unknown (no recognized manifest file found - inspect manually)"
fi

echo "---"
if [ -d .github/workflows ]; then
  echo "ci: GitHub Actions detected"
  ls .github/workflows
else
  echo "ci: no .github/workflows found"
fi

echo "---"
[ -f docker-compose.yml ] || [ -f docker-compose.yaml ] || [ -f compose.yaml ] && echo "docker_compose: present (may help start dependencies)"
[ -f Dockerfile ] && echo "dockerfile: present"

echo "---"
echo "readme_hint:"
for f in README.md README.rst Readme.md; do
  [ -f "$f" ] && echo "  $f present - check for run/start instructions"
done
