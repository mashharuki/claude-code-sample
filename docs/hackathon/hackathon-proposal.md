---
marp: true
theme: excel
paginate: true
size: 16:9
html: true
style: |
  /* @theme excel
     Excel Theme for Marp — Clean, professional presentation design
     Supports Japanese and English content
  */

  /* =========================================
     Base
     ========================================= */
  section {
    --accent:      #0ea5e9;
    --accent-warm: #f97316;
    --dark:        #0f172a;
    --dark-2:      #1e293b;
    --muted:       #64748b;
    --border:      #e2e8f0;
    --bg-subtle:   #f8fafc;

    width: 1280px;
    height: 720px;
    box-sizing: border-box;
    font-family: 'Hiragino Sans', 'BIZ UDGothic', 'Yu Gothic Medium',
                 'Noto Sans JP', 'Segoe UI', -apple-system, sans-serif;
    background: #ffffff;
    color: #1e293b;
    padding: 48px 72px 58px;
    font-size: 24px;
    line-height: 1.65;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  section::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--accent), var(--accent-warm));
  }

  section::after {
    font-size: 0.5em;
    color: var(--muted);
    bottom: 20px;
    right: 40px;
    letter-spacing: 0.04em;
  }

  /* =========================================
     Typography
     ========================================= */
  h1 {
    font-size: 2.0em;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 14px;
    line-height: 1.2;
    letter-spacing: -0.02em;
  }

  h2 {
    font-size: 1.45em;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 18px;
    padding-bottom: 10px;
    border-bottom: 3px solid var(--accent);
    line-height: 1.3;
  }

  h3 {
    font-size: 1.05em;
    font-weight: 600;
    color: var(--accent);
    margin: 14px 0 8px;
  }

  p { margin: 8px 0; }

  ul, ol { margin: 8px 0; padding-left: 1.4em; }
  li { margin: 5px 0; }
  ul > li::marker { color: var(--accent); font-size: 1.1em; }
  ol > li::marker { color: var(--accent); font-weight: 700; }

  strong { color: var(--accent); font-weight: 700; }
  em     { color: var(--accent-warm); font-style: normal; font-weight: 600; }

  /* =========================================
     Code
     ========================================= */
  code {
    font-family: 'JetBrains Mono', 'Fira Code', 'Source Code Pro', monospace;
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 1px 6px;
    font-size: 0.82em;
    color: #be123c;
  }

  pre {
    background: #0f172a;
    border-radius: 10px;
    padding: 18px 22px;
    margin: 10px 0;
    flex-shrink: 0;
  }

  pre code {
    background: none;
    border: none;
    color: #e2e8f0;
    padding: 0;
    font-size: 0.75em;
    line-height: 1.6;
  }

  /* =========================================
     Table
     ========================================= */
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 10px 0;
    font-size: 0.88em;
  }

  th {
    background: var(--accent);
    color: white;
    padding: 8px 14px;
    text-align: left;
    font-weight: 600;
  }

  td {
    padding: 7px 14px;
    border-bottom: 1px solid var(--border);
  }

  tr:nth-child(even) td { background: var(--bg-subtle); }

  /* =========================================
     Blockquote
     ========================================= */
  blockquote {
    border-left: 4px solid var(--accent);
    background: var(--bg-subtle);
    margin: 10px 0;
    padding: 10px 18px;
    border-radius: 0 6px 6px 0;
    color: var(--muted);
    font-size: 0.95em;
  }

  hr {
    border: none;
    border-top: 2px solid var(--border);
    margin: 16px 0;
  }

  /* =========================================
     Slide Class Variants
     ========================================= */

  section.title {
    background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 55%, #0f2944 100%);
    color: white;
    justify-content: flex-end;
    padding-bottom: 64px;
  }

  section.title::before { height: 6px; }

  section.title h1 {
    color: white;
    font-size: 2.4em;
    letter-spacing: -0.03em;
    max-width: 86%;
    border-bottom: none;
    margin-bottom: 0;
  }

  section.title h2 {
    color: rgba(255,255,255,0.65);
    font-size: 1.0em;
    font-weight: 400;
    border-bottom: none;
    margin-top: 12px;
  }

  section.title p {
    color: rgba(255,255,255,0.5);
    font-size: 0.8em;
    margin-top: 28px;
  }

  section.section {
    background: var(--accent);
    color: white;
    justify-content: center;
  }

  section.section::before {
    background: rgba(255,255,255,0.25);
  }

  section.section h2 {
    color: white;
    font-size: 2.0em;
    border-bottom: 2px solid rgba(255,255,255,0.4);
    padding-bottom: 12px;
  }

  section.section p {
    color: rgba(255,255,255,0.8);
    font-size: 0.9em;
  }

  section.lead {
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  section.lead h1 {
    font-size: 2.5em;
    border-bottom: none;
  }

  section.lead h2 {
    border-bottom: none;
    color: var(--muted);
    font-weight: 400;
  }

  section.dark {
    background: #0f172a;
    color: #e2e8f0;
  }

  section.dark h1 { color: white; }

  section.dark h2 {
    color: white;
    border-color: var(--accent);
  }

  section.ending {
    background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 100%);
    color: white;
    justify-content: center;
    align-items: center;
    text-align: center;
  }

  section.ending::before { height: 6px; }

  section.ending h1 {
    color: white;
    font-size: 2.8em;
    border-bottom: none;
    margin-bottom: 12px;
  }

  section.ending h2 {
    color: rgba(255,255,255,0.65);
    border-bottom: none;
    font-weight: 400;
    font-size: 1.0em;
  }

  section.ending p {
    color: rgba(255,255,255,0.5);
    font-size: 0.82em;
    margin-top: 20px;
  }

  /* =========================================
     Layout Components
     ========================================= */

  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 36px;
    align-items: start;
  }

  .columns.col-3    { grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
  .columns.col-6-4  { grid-template-columns: 3fr 2fr; }
  .columns.col-4-6  { grid-template-columns: 2fr 3fr; }
  .columns.middle   { align-items: center; }

  .card {
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 14px 18px;
    margin: 6px 0;
  }

  .card.accent  { border-left: 4px solid var(--accent);      background: rgba(14,165,233,0.05); }
  .card.warn    { border-left: 4px solid var(--accent-warm); background: rgba(249,115,22,0.05); }
  .card.success { border-left: 4px solid #22c55e;            background: rgba(34,197,94,0.04); }
  .card.danger  { border-left: 4px solid #ef4444;            background: rgba(239,68,68,0.04); }

  .highlight {
    background: linear-gradient(135deg, rgba(14,165,233,0.09), rgba(249,115,22,0.09));
    border: 1px solid rgba(14,165,233,0.25);
    border-radius: 10px;
    padding: 14px 22px;
    font-size: 1.05em;
    font-weight: 600;
    text-align: center;
    margin: 10px 0;
  }

  .number {
    font-size: 2.8em;
    font-weight: 800;
    color: var(--accent);
    line-height: 1.0;
    display: block;
    letter-spacing: -0.03em;
  }

  .number.warm { color: var(--accent-warm); }

  .tag {
    display: inline-block;
    background: var(--accent);
    color: white;
    font-size: 0.6em;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 999px;
    vertical-align: middle;
    letter-spacing: 0.03em;
    margin: 0 3px;
  }

  .tag.warm    { background: var(--accent-warm); }
  .tag.success { background: #22c55e; }
  .tag.danger  { background: #ef4444; }
  .tag.outline { background: none; border: 1.5px solid var(--accent); color: var(--accent); }

  .icons {
    display: flex;
    gap: 20px;
    justify-content: center;
    align-items: flex-start;
    margin: 16px 0;
  }

  .icon-item { text-align: center; flex: 1; }
  .icon-item .icon  { font-size: 2.2em; display: block; margin-bottom: 6px; }
  .icon-item .label { font-size: 0.75em; font-weight: 600; color: var(--muted); }

  .progress {
    height: 8px;
    background: var(--border);
    border-radius: 4px;
    overflow: hidden;
    margin: 6px 0 12px;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-warm));
    border-radius: 4px;
  }

  .steps { counter-reset: step; }
  .step {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin: 10px 0;
  }
  .step::before {
    counter-increment: step;
    content: counter(step);
    background: var(--accent);
    color: white;
    font-weight: 700;
    font-size: 0.85em;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 2px;
  }
---

<!-- _class: title -->
<!-- _paginate: false -->

# AI SOLO HACKATHON 2026

---

<!-- _class: lead -->
<!-- _paginate: false -->

# 一人でも、ちゃんと戦える時代になった。

## 設計も実装もプレゼンも、全部ひとりでやりきる。<br>それが AI SOLO HACKATHON です。

<div class="highlight">
🎯 OpenAI 様へ：<strong>AIを最も深く使いこなす日本の開発者たちと直接つながれる貴重な機会です</strong>
</div>

---

## ハッカソンの形が変わっている

<div class="columns">
<div>

### 従来のハッカソン

- **チーム前提**の参加形式が主流
- 役割分担が必要（開発・デザイン・PM）
- 個人参加は不利とされてきた
- 開発者以外はハードルが高い

</div>
<div>

### AI時代のハッカソン

- **ソロ参加が増加中**（AIがチームを補完）
- Claude Code・Copilotで**開発を爆速化** <br/>ソロでフルスタック実装
- デザインも Claude Design等 で一人でできる
- **エンジニア以外も**プロダクトを作れる時代へ

</div>
</div>

<div class="highlight">
⚡ AIは個人の武器になった。チームがなくても、いいものは作れる。
</div>

---

## AIがあれば、一人でここまでできる

<div class="icons">
<div class="icon-item">
<span class="icon">🧠</span>
<span class="label">設計・アーキテクチャ</span>
</div>
<div class="icon-item">
<span class="icon">💻</span>
<span class="label">フロントエンド開発</span>
</div>
<div class="icon-item">
<span class="icon">⚙️</span>
<span class="label">バックエンド開発</span>
</div>
<div class="icon-item">
<span class="icon">🎨</span>
<span class="label">UI/UXデザイン</span>
</div>
<div class="icon-item">
<span class="icon">📊</span>
<span class="label">プレゼン資料作成</span>
</div>
</div>

> 5人チームが必要だった仕事が、今は一人でできるようになっています。

- **Claude Code** や **Codex**でコード全体を設計・実装
- **GitHub Copilot** でリアルタイムペアプログラミング
- AIの使い方より、*何を作るかの判断力*が問われます

---

<!-- _class: section -->

## 01　イベントコンセプト

AIを駆使した次世代ソロハッカソン

---

## イベントコンセプト：指揮官として戦え

<div class="columns col-6-4 middle">
<div>

### コアコンセプト

- **架空のお題**（架空企業の経営課題）に対して<br/>プロダクトで解答する
- 参加条件は**完全ソロ**——チーム不可
- AIをいかに使いこなすかが勝負の分かれ目
- *開発者でも非開発者でも*参加可能

> AWS GameDay × AWSアーキテクチャ道場に<br/>インスパイアされたゲーミフィケーション形式

</div>
<div>

<div class="card accent">

### 🎖️ AI指揮官の心得

AIを使うのは当然。<br>**何を作るか**、**どう設計するか**、**誰に届けるか**——<br>それを決める判断力が鍵になる。

</div>

<div class="card warn" style="margin-top:16px">

### 🎯 評価の本質

完成したプロダクトだけでなく、<br>**設計の思想と判断力**を評価する

</div>

</div>
</div>

---

## 2026年テーマ：**「AIを武器に、一人で世界を動かせ。」**

<div class="highlight">
⚡ <strong>強い人が、ワクワクして集まってくるようなハッカソンにします！</strong>
</div>

<div class="columns">
<div>

### このテーマが伝えること

- AIは補助ツールではなく、**あなたの武器**
- **真の個人の地力**が問われる

</div>
<div>

<div class="card accent">

### 🔥 強者が集まる理由

「AIを武器に」
  - **使いこなす自信がある人**が反応する 

「一人で」
  -  **自分の実力を証明したい人**が来る  

「世界を動かせ」
  - **本気で変えようとしている人**が来る

</div>

</div>
</div>

---

<!-- _class: section -->

## 02　開催概要・フロー

2フェーズで最高の戦いを

---

## 2026年8月、ソロ限定の2フェーズで開催します

<div class="columns">
<div>

| 項目 | 内容 |
|---|---|
| **開催時期** | 2026年8月（予定） |
| **参加形式** | 完全ソロ（チーム不可） |
| **参加費** | 無料 |
| **フェーズ** | オンライン → オフライン 2段階 |
| **会場** | 東京都内（調整中） |
| **目標参加者** | 100〜200名(2次に進出は30名ほど) |

</div>
<div>

### 告知・開催スケジュール

<div class="card accent"><strong>2026年7月</strong><br/> — AI駆動開発カンファレンスで公式告知</div>
<div class="card warn"><strong>2026年8月上旬</strong><br/> — エントリー受付・Phase 1 開始</div>
<div class="card success"><strong>2026年8月末</strong><br/> — Phase 2 オフライン 1day ファイナル</div>

</div>
</div>

---

## 2週間のオンライン開発期間——アイデアをプロダクトにする

<div class="columns col-6-4">
<div>

<div class="steps">
<div class="step"><strong>お題公開</strong> — お題発表。参加者は同じ条件で挑む</div>
<div class="step"><strong>プロダクト開発</strong> — 約2週間でMVPを作り込む</div>
<div class="step"><strong>成果物提出</strong> — 動画 + ドキュメント + リポジトリを提出</div>
<div class="step"><strong>一次審査</strong> — 審査員がオンラインで審査（約1週間）</div>
<div class="step"><strong>Phase 2 進出者発表</strong> — 2次進出者をオフラインに招待</div>
</div>

</div>
<div>

<div class="card accent">

### 📋 提出物

- **デモ動画**（3〜5分）
- **ドキュメント**
- **GitHub リポジトリ**
- **スライド**（任意）

</div>

</div>
</div>

---

## 上位30名による1dayファイナル——当日発表の追加課題でさらに戦う

<div class="columns">
<div>

### ファイナリスト（〜30名）対象

<div class="steps">
<div class="step"><strong>追加お題</strong> — 当日追加のお題を発表</div>
<div class="step"><strong>開発</strong> — 数時間でプロダクトを磨く・拡張する</div>
<div class="step"><strong>ピッチ</strong> — 審査員に最終成果をプレゼン</div>
<div class="step"><strong>表彰</strong> — その場で結果発表。最優秀者に特別賞</div>
</div>

</div>
<div>

### 一般公開タイム（オープン）

<div class="card success">

**🎪 デモ・発表タイム**
一般参加者も観覧OK。<br>スポンサーセッションや懇親会の時間を設けることで、コミュニティ全体を巻き込む。

</div>

</div>
</div>

---

## 全国から100〜200名が集まります

<div class="columns col-3">
<div style="text-align:center">
<span class="number">100〜</span>

Phase 1 エントリー目標
</div>
<div style="text-align:center">
<span class="number warm">〜30</span>

Phase 2 ファイナリスト
</div>
<div style="text-align:center">
<span class="number">100+</span>

オフライン観覧者（デモタイム）
</div>
</div>

<div class="columns" style="margin-top:8px">
<div>

### 参加者のペルソナ

- 個人開発者・エンジニア
- 生成AIを使いこなすビジネス職の方
- AI駆動開発コミュニティのメンバー

</div>
<div>

### なぜこのコミュニティか

- AIで開発を加速させることをテーマにした**21,163名超**のコミュニティ
- Claude Code・Cursor・Copilotを実際に使いながら開発している人たちが集まる
- 毎月イベントを開催しており、AIで手を動かす人たちの場になっている
- 採用・情報発信の両面でスポンサーに合う層が集まっています

</div>
</div>

---

## **業界著名人が審査員**——彼らを唸らせた者が本物の実力者だ

<div class="highlight">
🔥 「この人に認められたい」と思える人たちに、お題を出してもらいます。
</div>

<div class="columns">
<div>

### テック・個人開発者領域

- **ぬこぬこさん** / **ryoppippiさん** 
- **ナル先生** / **みのるんさん**
- **catnoseさん** / **kuuさん** 
- **吉田慎吾さん** 

</div>
<div>

### 企業・スタートアップ領域

- **LayerX** — フィンテック × AI のパイオニア
- **燈株式会社** — 会場スポンサー様候補（調整中）
- **サイバーエージェント / DeNA / メルカリ** 
  — メガベンチャーの強強エンジニア
- <span class="tag outline">調整中</span> 各社に個別オファー予定

</div>
</div>

> ※ 上記はお声がけ予定のリストです。確定次第正式発表いたします。

---

## 評価基準：設計力と実装力の両方を問う

<div class="columns">
<div>

### 評価の2本柱

<div class="card accent">

#### 🏗️ 設計・アーキテクチャ（40%）

- **課題への本質的なアプローチ**が評価される
- AWS アーキテクチャ道場のように、<br/>設計書・技術選定の理由も審査対象
- 「なぜその設計にしたか」が問われる

</div>

<div class="card success" style="margin-top:12px">

#### 🚀 MVP完成度（40%）

- プロダクトが**実際に課題を解決しているか**
- デモ品質・UX・安定性も評価ポイント

</div>

</div>
<div>

### その他評価軸（20%）

<div class="card warn">

#### 🎤 プレゼン・伝達力（Phase 2）

- 限られた時間で価値を伝えられるか
- AI時代だからこそ問われる「伝える力」

</div>

<div class="highlight" style="margin-top:16px">
💡 AIの活用度は評価しない——<br><strong>何を作り、どう考えたか</strong>が全て
</div>

</div>
</div>

---

<!-- _class: lead -->

# 賞品について

## 一案ですが以下のような内容であれば強者が多く集うと考えています。

<br/>
<div style="margin-top:24px">
<div style="text-align:center">
<span class="number">🏆</span>

**最優秀賞**<br><small>OpenAI Dev Day（SF）<br>招待 + 渡航費サポート</small>
</div>
</div>

---

<!-- _class: section -->

## 03　OpenAI 様へのご提案

日本最大のAI開発者コミュニティと、一緒に歴史を作りませんか

---

## スポンサーで得られること

<div class="columns">
<div class="card accent">

### 🎯 欲しい人材に、直接会える

AIで実際に手を動かしている開発者が集まります。ファイナリストは特に優秀な人が多く、懇親会でカジュアルに話せます。採用担当者を何名でもお連れいただけます。

</div>
<div class="card success">

### 📰 自然に広がるPRの機会

最優秀者がスポンサー提供の賞でカンファレンスへ参加できれば、それがSNSやコミュニティで自然に広がっていきます。

</div>
</div>

---

## OpenAI 様へのご提案

<div class="columns">
<div class="card success">

### ✅ 運営側で準備するもの

- **会場**（東京都内・確保済み）
- 運営・告知・審査員手配
- SNS / Zenn / note での発信・拡散

</div>
<div class="card accent">

### 🎁 OpenAI様にお願いしたいこと

- **最優秀賞の景品**  
  <small>例：OpenAI Dev Day（SF）招待 + 渡航費</small>
- **懇親会のご協賛**  
  <small>ファイナリスト〜30名 <br/> オフライン観覧者 〜100名</small>

</div>
</div>

<div class="card warn" style="margin-top:14px">

### 💡 OpenAI 様にとっての価値

日本最大の AI 駆動開発コミュニティ **21,163名超** への直接接点。<br/>Codex等を実際に使い込んでいる開発者たちと懇親会でカジュアルに話せる貴重な機会です。

</div>

---

## OpenAI様から見た投資対効果

| 提供内容 | 得られるもの |
|---|---|
| 最優秀賞（Dev Day招待等） | 最優秀者のSNS発信・受賞記事が自然に拡散 |
| 懇親会スポンサー | ファイナリスト〜30名と直接交流・採用接点 |
| ブランド冠スポンサー | 「OpenAI公認ハッカソン」として全告知に掲出 |

<div class="highlight">
🌏 最優秀者がOpenAI提供の賞でSFへ<br/>その熱が日本の開発者コミュニティ全体に広がっていきます
</div>

---

## 告知・露出の広がりイメージ

| 接点 | 規模・内容 |
|---|---|
| AI駆動開発コミュニティ | 3,000名以上へ告知、21,000名超のフォロワーにリーチ |
| Phase 1 参加者 | 100〜200名（AIで実装できる開発者層） |
| Phase 2 オフライン観覧 | 100名以上が来場、懇親会で直接交流 |
| X（Twitter）/ Zenn / note | 参加者・審査員が自発的に発信、振り返り記事が生まれる |
| AI駆動開発カンファレンス | 2026年7月開催の大型イベントで公式告知 |

<div class="highlight">
🌏 最優秀者がスポンサー提供の賞で海外カンファレンスへ<br/>その様子がそのまま広がっていきます
</div>

---

## タイムスケジュール感

**スポンサー募集・準備フェーズ（現在〜2026年6月）**
<div class="progress"><div class="progress-bar" style="width:15%"></div></div>

**告知・エントリー受付（2026年7月〜8月上旬）**
<div class="progress"><div class="progress-bar" style="width:0%"></div></div>

**Phase 1 オンライン開催（2026年8月中旬）**
<div class="progress"><div class="progress-bar" style="width:0%"></div></div>

**Phase 2 オフライン 1day ファイナル（2026年8月末〜9月初旬）**
<div class="progress"><div class="progress-bar" style="width:0%"></div></div>

<div class="columns" style="margin-top:8px">
<div>

### 重要マイルストーン

- **2026年7月** 
  — AI駆動開発カンファレンスで公式告知

</div>
<div>

<div class="card warn">

⚠️ **スポンサー決定のお願い**

7月の大型カンファレンスで告知のため、**2026年6月末までにスポンサーシップを<br/>ご確定**いただけると大変助かります。

</div>

</div>
</div>

---

<!-- _class: ending -->
<!-- _paginate: false -->

# 一緒に歴史を作りませんか。

## 日本初のAIソロハッカソン、一緒に作りましょう！

