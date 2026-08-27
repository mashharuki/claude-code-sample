# ブロックチェーン / AI アイコンガイド

ブロックチェーンとAIの領域は、AWS/GCP/Azureほど網羅的な公式アイコンセットがdraw.ioに
標準搭載されていない。そのため2種類のアイコン源を使い分けている:

1. **`scripts/dio.py` の `GENERIC` 辞書** — 意味のある色分けをした汎用シェイプ。
   ブランドが存在しない/特定しない概念(「Relayer」「Liquidation Bot」等)に使う。
2. **`scripts/web3icons.py`** — 実在するチェーン/トークン/ウォレットのブランドアイコン
   (下記)。「これは具体的にEthereumである」「これはUSDCである」等、実物を指す場合に使う。

無理に不正確なロゴを使うより、対応するアイコンがなければ明確にラベリングされた汎用図形の
方が誤解がない、という考え方は変わらない。search_shapesの結果には非公式・低品質なアイコンも
多く混ざるため、質を見極めて採用すること。

## ブランドアイコン(`scripts/web3icons.py`)

[web3icons](https://github.com/0xa3k5/web3icons)(MITライセンス、Copyright (c) 2024
0xa3k5)から、47個のアイコンを `assets/web3icons/` に取り込み済み(帰属表示は
`assets/web3icons/ATTRIBUTION.md` を参照)。data URI(SVGをURLパーセントエンコードした
埋め込み画像)としてスタイル文字列に直接埋め込むため、生成した.drawioファイルは
ネットワーク接続なしで開いても正しく表示される。

```python
import web3icons as w3

d.node("Ethereum", w3.network("ethereum"), x, y, 50, 50)
d.node("USDC", w3.token("USDC"), x, y, 60, 60)
d.node("MetaMask", w3.wallet("metamask"), x, y, 60, 60)
d.node("Uniswap", w3.exchange("uniswap"), x, y, 60, 60)  # 使用制限は下記参照
```

利用可能な一覧は `web3icons.AVAILABLE` を参照。収録範囲外のアイコンが必要な場合は、
`https://github.com/0xa3k5/web3icons/tree/main/raw-svgs/<category>/branded` から該当SVGを
`assets/web3icons/<category>/` に追加するだけで(コード変更不要)使えるようになる。

**画像をスタイル文字列に埋め込むときの注意(実際にハマった点)**: mxGraphのスタイル文字列は
`key=value;` のフラットなセミコロン区切りリストなので、値の中に生の `;` が入っていると
そこでパースが区切られてしまう。標準的な `data:image/svg+xml;base64,...` 形式の`;base64,`
部分がまさにこれで、**base64のdata URIをそのまま埋め込むと画像が無言で表示されない**
(実際に描画確認するまで気づかなかった)。`web3icons.py` は代わりにSVG本文全体を
`urllib.parse.quote()` でパーセントエンコードした `data:image/svg+xml,<encoded>` 形式を使い、
これで実機確認済み。自分で画像付きスタイルを組み立てる場合もこの形式に倣うこと。

### 使用上の判断基準(重要)

- **チェーン/トークン/ウォレットのロゴ**(`network()`/`token()`/`wallet()`)は
  「これは実際にEthereumである」「これは実際にUSDCである」という**指示的(denotative)な
  使い方**なので、汎用パターンのテンプレートに使って問題ない。実際、
  `cross-chain-bridge.drawio`(Ethereum⇔Base)、`dex-amm.drawio`(ETH/USDC等のペア)、
  `stablecoin.drawio`(DAI)、`defi-lending-protocol.drawio`(担保資産の例としてETH)、
  `dapp-fullstack.drawio`/`x402-agentic-payments.drawio`/`perpetuals-dex.drawio`
  (ウォレット=MetaMask)で採用済み。
- **取引所/プロトコルのロゴ**(`exchange()`、例: Uniswap, Binance)は**特定の実在企業**を
  指すため、`dex-amm.drawio` や `cex-architecture.drawio` のような「汎用パターン」の
  テンプレートには使わない — 使うと「これがUniswap/Binanceの実際の内部構成である」と
  誤解を与えかねない。ユーザーが明示的に「Uniswapの構成図が欲しい」等、特定のプロトコルに
  ついての図を求めたときにだけ使う。

## 検証済みの専用アイコン

- **Wallet**: `GENERIC["wallet"]` — IBM Blockchainシェイプセットの `wallet.svg`。
- **Smart Contract**: `GENERIC["smart_contract"]` — 同セットの `smart_contract.svg`。
- **AWS Managed Blockchain**: `AWS["managed_blockchain"]`(AWS上にノードを構築する場合)。
- **Bedrock / Bedrock AgentCore / SageMaker**: `AWS["bedrock"]` / `AWS["bedrock_agentcore"]` /
  `AWS["sagemaker"]`(AWS上でAIワークロードを構築する場合)。

## 汎用シェイプ(`GENERIC` 辞書)

| キー | 用途 | 見た目 |
|---|---|---|
| `box` | アプリケーション層、フロントエンド、汎用処理 | 青系の角丸四角 |
| `box_purple` | AI/ML関連の処理(Embedding、Prover等) | 紫系の角丸四角 |
| `box_orange` | ノード群・非中央集権的な参加者(Relayer、Validator、Sequencer) | オレンジ系の角丸四角 |
| `box_gray` | 横断的関心事(監視・監査・ポリシー・データソース) | グレー系の角丸四角 |
| `box_green` | 成功/確定状態、承認済みリソース | 緑系の角丸四角 |
| `db_cylinder` | データベース・ベクトルDB・状態ストア | 円柱(シリンダー) |
| `hexagon` | コンセンサス/検証ロジックなど特別な処理単位を強調したい場合 | 六角形 |
| `actor` | 人間のアクター(UMLアクター記法) | 棒人間 |
| `wallet` | 暗号資産ウォレット | IBM Blockchainアイコン |
| `smart_contract` | スマートコントラクト | IBM Blockchainアイコン |

## 追加でアイコンが必要な場合の検索クエリ例

`mcp__drawio__search_shapes` の結果は玉石混淆(個人制作のアイコンパックが混ざる)なので、
**タイトルに `(Ai Machine Learning)` `(Azure)` `(IBM)` のような信頼できる出典が付いているものを
優先**し、単発の謎アイコン(`icon-cache1/...` のような雑多なコレクション)は避ける。

- ブロックチェーンノード: `search_shapes(query="cisco network node")` や、単純に
  `GENERIC["box_orange"]` にラベルを付ける方が誤解がなく綺麗。
- GPU/計算資源: `search_shapes(query="gpu chip processor")` → Cisco ASIC Processor や
  Hero Icons の CPU Chip が候補。用途が明確ならラベル付き `box_gray` でも十分。
- ロボット/AIエージェント: `search_shapes(query="robot artificial intelligence")` →
  Material Symbols の Robot アイコンなどが候補。ただし多くの場合、AWS Bedrock AgentCore
  アイコン(`AWS["bedrock_agentcore"]`)や `GENERIC["box_purple"]` の方が図全体のトーンに
  馴染む。

## 設計上の指針

- ブロックチェーン図では「誰が何を検証・署名・確定させるか」を矢印ラベルで明示する
  (単なる「送信」ではなく「マルチシグ承認後にmint」のように)。信頼境界(オンチェーン/
  オフチェーン、単一障害点の有無)をコンテナの色や枠線で視覚的に分ける。
- AI図では「どこまでが決定的処理で、どこからが確率的(モデル推論)処理か」を区別できると
  読み手の理解が進む。本スキルの慣習では、モデル推論・生成を伴うノードは `AWS["bedrock"]`
  やteal系の `box_purple` 、決定的なオーケストレーション/ルーティングは `box_orange` で
  塗り分けている。
