# RubyKaigi CFP プロポーザル レビュー

## 総評

現状のプロポーザルは、RubyKaigiの採択基準を満たすには大幅な改善が必要です。RubyKaigiは世界的に著名なRubyカンファレンスであり、採択されるためには「なぜこの登壇者が話すべきか」「聴衆は何を持ち帰れるか」が明確に伝わる必要があります。現在の文章はその点が不十分です。

---

## 問題点の詳細

### 1. タイトルが汎用的すぎる

**現状：** 「RubyのGCについて」

このタイトルでは何千人もいる応募者の中で目立ちません。GCについて語れる人は世界中にいます。「なぜあなたが」「何が特別なのか」がまったく伝わりません。

**改善方向：** 具体的な発見・成果・視点を含めたタイトルにする。
例：
- "Demystifying Ruby's Garbage Collector: A Deep Dive into Generational GC and What It Means for Your App's Performance"
- "Why Your Ruby App Pauses: Understanding and Tuning the GC from the Inside Out"
- "From Mark-and-Sweep to Incremental GC: The Evolution of Ruby's Memory Management"

### 2. 概要に具体性がない

**現状の問題点：**
- 「GCは複雑です」→ 複雑であることは誰でも知っている
- 「解説します」→ 何を、どこまで、どんな切り口で解説するのか不明
- 「パフォーマンスチューニングに役立てることができると思います」→ 「思います」という曖昧な表現は自信のなさを示す
- 「様々な種類があります」→ 何が「様々」なのか具体的に述べていない
- 「今後はより良いGCを実装する予定です」→ これは誰の話か？Rubyコア開発者なのか？

### 3. 登壇者の専門性・実績が示されていない

RubyKaigiのレビュアーは「なぜこの人が話すべきか」を重視します。以下のような情報がまったくありません：
- GCに関してどんな深い経験・研究があるか
- Ruby本体のコードを読んだ・コントリビュートした経験
- 実際にGCチューニングで解決した問題事例
- 独自の知見や発見

### 4. 聴衆が何を得られるかが不明

「パフォーマンスチューニングに役立てることができると思います」は抽象的すぎます。具体的なtakeawayが書かれていません。

---

## 改善提案

### タイトルの改善例

```
"Taming Ruby's GC: Incremental, Generational, and What Comes Next"
```

または日本語ベースで応募する場合でも英語タイトルをサブタイトルに添える。

### 概要の書き直し例

```
Ruby's garbage collector has undergone dramatic changes — from the classic 
mark-and-sweep in early versions to the current incremental, generational GC 
introduced in Ruby 2.x. Yet many Ruby developers treat GC as a black box, 
leading to mysterious pauses and memory bloat in production.

In this talk, I'll open that black box. We'll walk through how Ruby's GC 
actually works at the C-level: the tri-color mark phase, the lazy sweep, 
the minor/major GC distinction, and the write barrier. I'll share real-world 
profiling data from [your actual experience] showing how GC tuning 
(RUBY_GC_HEAP_*, GC.compact) reduced P99 latency by X% in [specific context].

Attendees will leave with:
- A mental model of Ruby's memory layout (slots, pages, heap arenas)
- Practical GC tuning parameters and when to use them
- How to profile GC pressure with ObjectSpace and GC::Profiler
- What's coming in Ruby [version]: the Ractors/GC story and YJIT implications
```

---

## RubyKaigiで採択されるためのチェックリスト

以下の要素が含まれているか確認してください：

- [ ] **具体的な技術的深度** — 表面的な説明ではなく、実装レベルの知識を示す
- [ ] **実際のデータ・事例** — ベンチマーク、プロファイリング結果、実際の問題と解決策
- [ ] **登壇者の独自性** — なぜあなたが話すべきか（コントリビューション、研究、実務経験）
- [ ] **明確なtakeaway** — 聴衆が持ち帰れる具体的な知識・技術・ツール
- [ ] **Rubyコミュニティへの貢献意識** — このトークがRubyエコシステムをどう前進させるか
- [ ] **適切なスコープ** — 20-30分で話せる内容に絞り込まれているか

---

## 次のステップ

1. **あなた自身のGCに関する実体験・専門性を棚卸しする** — どんな問題を解決したか、何を発見したか
2. **タイトルを3案作り、最も具体的なものを選ぶ**
3. **概要に実際のデータや事例を1つ以上含める**
4. **「聴衆が得られること」を箇条書きで3点明記する**
5. **過去のRubyKaigi採択トークを参照し、文体・構成を参考にする**

---

現在のプロポーザルの骨格自体（GCという技術的に深いテーマ選定）は悪くありません。あなたがGCについて深い知識や経験を持っているなら、それを具体的に示すことで採択の可能性は大きく上がります。
