# Skillに関するメモ

## 作成方法メモ

### ①anthropic-agent-skills 「example-skills」をインストール

- Claude Codeを立ち上げて 「/plugin」コマンドを実行。
  - `/plugin marketplace add anthropics/skills`
- 「anthropic-agent-skills」 と入力
- 「example-skills」をインストール
  - `/plugin install example-skills@anthropic-agent-skills`
- Installedに example-skills が表示されれば準備完了

### ②「example-skills」でスキルを作成プロンプト


```markdown
以下のスキルをskill-creatorを使って作成してください。
- 御見積書を作成する
- テンプレートは以下
　- 001_御見積書/YYYYMMDD_御見積書_{案件名}.xlsx
- 与える変数は以下
　- 日付
　- クライアント名
　- 件名
　- 支払条件
　- 項目
　- 単価(原価)
　- 粗利率
　- 与えた粗利率から御見積書に記載する単価を計算する。原価は決して御見積書に記載しないこと。
```

### ③スキルを実行プロンプト

```markdown
以下の内容で見積書を作成して。
# クライアント名
AAA株式会社
# 件名
BBB開発案件
# 項目（複数）、原価、粗利率
PM：原価 250万円、1.5人月、粗利率30%
開発：原価 150万円、10人月、粗利率50%
UIUX：原価 150万円、3人月、粗利率50%
# 支払条件
月末締め、翌月末払い
# 備考
・開発期間：2025/8/6 〜 2025/11/30
・詳細は別紙をご参照ください。
・インボイス事業者登録番号：Txxxxxxxxxxxxx
```