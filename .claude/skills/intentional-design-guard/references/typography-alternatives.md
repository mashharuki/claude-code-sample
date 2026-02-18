# Typography Alternatives

Blacklist フォント（Inter, Roboto, Open Sans 等）の代替ペアリング集。
ムードから選択し、見出し/本文のコントラストを確保する。

---

## Confident / 信頼・権威

| 見出し | 本文 | 特徴 |
|--------|------|------|
| **Playfair Display** (700) | **IBM Plex Sans** (400) | セリフの格調 + モダン本文 |
| **DM Serif Display** (400) | **DM Sans** (400) | 統一感のある DM ファミリー対比 |
| **Fraunces** (900) | **Work Sans** (400) | ソフトセリフの個性 + クリーン本文 |

## Playful / 軽快・親しみ

| 見出し | 本文 | 特徴 |
|--------|------|------|
| **Space Grotesk** (700) | **Outfit** (400) | 幾何学的なモダン + 読みやすさ |
| **Sora** (700) | **Karla** (400) | 角丸ジオメトリック + ヒューマニスト |
| **Lexend** (800) | **Atkinson Hyperlegible** (400) | 可読性重視のユニークペア |

## Technical / 専門・精密

| 見出し | 本文 | 特徴 |
|--------|------|------|
| **JetBrains Mono** (700) | **Manrope** (400) | エンジニア向けの硬質感 |
| **Space Mono** (700) | **Space Grotesk** (400) | 同ファミリーのモノ/プロポ対比 |
| **Fira Code** (600) | **Fira Sans** (400) | コード文化の統一感 |

## Warm / 温かみ・人間味

| 見出し | 本文 | 特徴 |
|--------|------|------|
| **Lora** (700) | **Nunito Sans** (400) | ブラッシュセリフ + 丸みサンセリフ |
| **Merriweather** (900) | **Cabin** (400) | 堅実セリフ + ヒューマニスト |
| **Bitter** (700) | **Hind** (400) | スラブセリフの温かさ |

## Edgy / 先鋭・前衛

| 見出し | 本文 | 特徴 |
|--------|------|------|
| **Clash Display** (700) | **Satoshi** (400) | 幾何学的シャープネス |
| **Cabinet Grotesk** (800) | **General Sans** (400) | コンデンス気味の緊張感 |
| **Instrument Serif** (400) | **Instrument Sans** (400) | 同ファミリーの繊細な対比 |

## Japanese / 日本語対応ペアリング

| 見出し (日本語) | 本文 (日本語) | 欧文ペア | 特徴 |
|----------------|--------------|----------|------|
| **Noto Serif JP** (700) | **Noto Sans JP** (400) | Playfair Display / IBM Plex Sans | 明朝 × ゴシックの王道対比 |
| **Shippori Mincho** (700) | **M PLUS 1p** (400) | DM Serif Display / DM Sans | 筑紫系明朝 + モダンゴシック |
| **Zen Kaku Gothic New** (700) | **Zen Kaku Gothic New** (400) | Space Grotesk / Outfit | ウェイト差で対比するモダンゴシック |
| **BIZ UDPMincho** (700) | **BIZ UDPGothic** (400) | Merriweather / Cabin | UD書体の可読性 |
| **Klee One** (600) | **Zen Maru Gothic** (400) | Lora / Nunito Sans | 手書き感 + 丸ゴシックの温かさ |

---

## 使用時の注意

- Google Fonts で利用可能なものを優先
- `font-display: swap` を必ず指定
- 日本語フォントは `subset` 指定でロード量を制御
- 1ページにフォントファミリーは最大3つまで
