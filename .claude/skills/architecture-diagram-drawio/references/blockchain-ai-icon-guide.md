# ブロックチェーン / AI アイコンガイド

ブロックチェーンとAIの領域は、AWS/GCP/Azureほど網羅的な公式アイコンセットがdraw.ioに
存在しない。そのため `scripts/dio.py` の `GENERIC` 辞書にある**意味のある色分けをした
汎用シェイプ**を基本とし、要点となる少数の要素だけ専用アイコンを使う方針にしている。
これは手を抜いているのではなく、「無理に不正確なロゴを使うより、明確にラベリングされた
汎用図形の方が誤解がない」という判断による(検索結果には非公式・低品質なアイコンも多く
混ざるため、質を見極めて採用している)。

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
