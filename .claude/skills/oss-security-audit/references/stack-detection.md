# スタック検出とツール対応表

`scripts/detect_stack.sh <target-dir>` を最初に実行し、結果（言語・パッケージマネージャ・
テストフレームワーク・CI設定の有無）を元に、以降の各フェーズで使うコマンドを選ぶ。
スクリプトが検出できなかった場合は、この表を見ながら手動でリポジトリを確認する
（`package.json` / `pyproject.toml` / `go.mod` / `Cargo.toml` / `pom.xml` 等の有無で判定）。

## 言語別ツール対応表

| 言語/エコシステム | 目印ファイル | テスト実行 | 依存脆弱性スキャン | SAST（静的解析） | シークレットスキャン |
|---|---|---|---|---|---|
| Node.js / TypeScript | `package.json` | `npm test` / `pnpm test` / `yarn test`（`package.json`の`scripts.test`を確認） | `npm audit --json` / `pnpm audit` | `npx eslint . --ext .js,.ts`（セキュリティ系プラグインがあれば併用）、`semgrep --config auto`（利用可能なら） | `gitleaks detect` / `trufflehog filesystem .`（無ければ`scripts/grep_secrets.sh`で代替） |
| Python | `pyproject.toml` / `requirements.txt` / `setup.py` | `pytest` | `pip-audit` / `safety check` | `bandit -r .`、`semgrep --config auto` | 同上 |
| Go | `go.mod` | `go test ./...` | `govulncheck ./...` | `go vet ./...`、`staticcheck ./...`（あれば） | 同上 |
| Rust | `Cargo.toml` | `cargo test` | `cargo audit` | `cargo clippy` | 同上 |
| Java/Kotlin | `pom.xml` / `build.gradle` | `mvn test` / `./gradlew test` | `mvn dependency-check:check`（あれば） | 静的解析ツールが無ければコードレビューで代替 | 同上 |
| Ruby | `Gemfile` | `bundle exec rspec` 等 | `bundle audit` | `brakeman`（Railsなら） | 同上 |

ツールがインストールされていない場合は、いきなり失敗させず:
1. `npx` / `pipx run` 等のオンデマンド実行を試す
2. それも失敗したら「未実行（環境にツールなし）」としてレポートに明記し、代替として
   手動のコードレビュー観点（`references/test-categories.md` の該当項目）でカバーする

## CI/CD検出

- `.github/workflows/*.yml` があれば GitHub Actions セキュリティチェック（`references/test-categories.md`
  の「GitHub/CI セキュリティ」節）を実施する。
- `CODEOWNERS`、branch protection の設定はリポジトリ内からは分からないことが多い —
  「GitHub API/Web UIでの確認が必要」としてレポートに記載し、無理に推測しない。

## ローカル起動方法の推定

HTTP/API系のテスト（認証・認可・入力検証・レート制限など）を行うには対象を実際に起動する必要がある。

1. `README.md` / `CONTRIBUTING.md` の起動手順を読む
2. `docker-compose.yml` があれば `docker compose up -d` で依存サービスごと起動できるか確認
3. `package.json` の `scripts.dev` / `scripts.start` 等を確認
4. どうしても起動できない場合は、動的テスト（HTTP系）をスキップし、レポートに
   「起動不可のため静的解析のみ実施」と明記した上で、コードレビューベースで
   認証・認可・入力検証ロジックを可能な範囲で評価する
