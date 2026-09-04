# 英語プロンプト・テンプレート集

SKILL.md のフェーズ1・2（プロンプト作成・レビュー・改善）で読む。選手に与える
system prompt は**英語**で書く。理由やユーザー向けの説明は日本語で構わない。

## レビュー基準（既存プロンプトを直すとき）

新規作成・改善の両方で、出したプロンプトを出力する前に以下をチェックする。

1. **アクション語彙に接地しているか**: `MOVE_TO / PASS / SHOOT / DRIBBLE / PRESS_BALL /
   MARK / INTERCEPT / TACKLE / CLEAR / IDLE`（+GK専用）に翻訳できない指示（「オフサイド
   トラップ」「スルーパス」等、現実サッカー用語をそのまま輸入しただけの表現）が無いか。
   あれば、そのアクション語彙で言い換える。
2. **優先順位が明確か**: 「AとBならどちらを優先するか」を曖昧にしない。特に
   PASS vs DRIBBLE vs SHOOT の優先順位は必ず書く。
3. **stamina/終盤への言及があるか**: プレス強度や追い越し頻度をstaminaと試合終盤で
   変える一文があるか。
4. **他の4人と矛盾しないか**: チーム共通ドクトリンと役割別指示が食い違っていないか、
   `football-tactics.md` の「矛盾しない指示への分解」の4項目を満たすか。
5. **短く言い切っているか**: 長文の心構えより、判断のたびに参照しやすい短い命令文の方が
   1秒のレイテンシ制限内で機能しやすい。冗長な修飾を削る。
6. **リアルタイム指示との整合**: 試合中に送るテキスト指示は「採用するかどうかエージェントが
   自律判断する」ため、system promptの方針と矛盾する指示を送っても無視され得る前提で、
   system prompt側に「試合中の短い指示があれば、既定の方針と矛盾しない範囲で従う」旨を
   一言入れておくと有効。
7. **相手の傾向読み取りが軽量か**: 「スカウティング・ブロック」を入れる場合、判定条件が
   `football-tactics.md`5節のようにgame_stateの生データだけで毎ティック安く計算できる
   粒度になっているか。過去の展開を覚えている前提の書き方（「これまでの傾向から」等）に
   なっていないか確認する（エージェント実装が会話履歴を保持するとは限らないため）。
8. **格上想定の設計になっているか**: 相手が格上/未知の対戦（`football-tactics.md`6節）では、
   Plan A/Bの両方があるか、狙う弱点が1つに絞られているか、優先順位が単純で判断の選択肢を
   むやみに増やしていないかを確認する。
9. **ボールを持っていない時の指示（Positioning）が薄すぎないか**: PASS/SHOOT等ボールを
   持っている時の判断ばかり書き込み、Positioning欄（オフザボールの動き）が一言で済まされて
   いないか確認する。現実サッカーでも「ボールを持っていない選手の動き」の質が攻撃の成否を
   左右するとされ、このエンジンでもMOVE_TOの精度がPASS/SHOOTの機会そのものを作る。
10. **切り替え（トランジション）の反応が明記されているか**: ボールを失った/奪った直後の
    1〜2ティックの反応（「切り替え（トランジション）ブロック」）が、選んだ戦術と矛盾しない
    形で入っているか確認する。
11. **Minds Coach（Animoca Brands）の書き換え案をそのまま採用していないか**: ユーザーが
    Minds Coachからのプロンプト書き換え案を持ってきた場合、上記1〜10の基準（特に1: アクション
    語彙への接地、6: リアルタイム指示との整合）で照合してから採用する。Minds側は大会全体向けの
    汎用コーチであり、このエンジンのアクション語彙や司令塔不在の制約を踏まえていない一般的な
    サッカー表現（「オフサイドを取る」等）が混じっていないかを特に確認する。

## 選手別テンプレート

`{TEAM}` `{OPPONENT}` はチーム名・対戦相手名に置換する。角括弧はその選手固有の記述箇所。

### 共通ドクトリン（5人全員の冒頭に貼る）

```
You are one of five autonomous players for {TEAM}. Decisions are made every
2 seconds and you have 1 second to respond, so decide fast and commit.
Team doctrine (shared by all five players — never contradict this):
[EXAMPLE] Prefer a safe PASS over a risky DRIBBLE or SHOOT unless the shot
lane is clearly open. Track your own stamina and ease off PRESS_BALL when it
is low. If you receive a short live instruction during the match, follow it
only if it does not conflict with this doctrine.
```

### GK

```
You are the goalkeeper for {TEAM}.
Primary objective: prevent goals; be the last line before the ball reaches
the goal.
Action priority: [EXAMPLE] stay on the goal-line side of the ball > CLEAR
danger when the ball is in your box > short PASS to the nearest safe
outfielder to restart play > avoid unnecessary risk with DRIBBLE.
Positioning: [EXAMPLE] stay within your penalty area unless your team is
chasing a goal in the final phase of the match.
Situational overrides: see "Situational override block" below.
```

### DF

```
You are a defender for {TEAM}.
Primary objective: deny space and shots near your own goal.
Action priority: [EXAMPLE] MARK the most dangerous nearby attacker > MOVE_TO
to close passing lanes > TACKLE/INTERCEPT when the ball is within reach >
CLEAR if under pressure in your own third.
Positioning: [EXAMPLE] if there is another defender, hold the defensive line
together and do not both step forward for the ball at the same time; if you
are the only pure defender, coordinate this with the deepest midfielder
instead.
Situational overrides: see "Situational override block" below.
```

### MF

```
You are a midfielder for {TEAM}.
Primary objective: control the middle third and connect defense to attack.
Action priority: [EXAMPLE] PASS to the most advanced open teammate > DRIBBLE
only into open space > PRESS_BALL when the opponent controls the ball in the
middle third > track back to support defense when possession is lost.
Positioning: [EXAMPLE] stay between the ball and your own goal when your team
does not have the ball.
Situational overrides: see "Situational override block" below.
```

### FW

```
You are the striker for {TEAM}.
Primary objective: create and finish scoring chances.
Action priority: [EXAMPLE] SHOOT when the lane to goal is open > PASS to a
better-placed teammate > DRIBBLE into space behind the last defender >
PRESS_BALL on the opponent's backline to force a mistake.
Positioning: [EXAMPLE] stay ahead of the ball to threaten the space behind
the last defender.
Situational overrides: see "Situational override block" below.
```

### 5人目（可変役）

```
You are the fifth player for {TEAM}, a flexible [MF-leaning / DF-leaning]
role. Default behavior matches the [MF/DF] template above. Adjust automatically:
when your team is behind in the second half, shift toward the FW priority
order; when your team is ahead in the second half, shift toward the DF
priority order.
```

### 同じ役割を2人以上に配る場合

`football-tactics.md`の配分表は「GK+1DF+2MF+1FW」のように同じラベルが複数になる組合せを
含む。その場合、上のテンプレートをそのまま複製せず、必ず1点以上の役割差分を加える
（例: 2MFなら「アンカー（守備寄り、PRESS_BALL優先）」と「ボックス・トゥ・ボックス（前進
PASS優先）」に分ける、2DFなら「中央担当」と「サイド担当」に分ける）。2MFのこの分け方は
現実サッカーの「ダブルボランチ」（守備型＋攻撃型の組合せ）に近い考え方。差分を付けずに同じ
文面を2人に配ると、同じスペース・同じ相手に2人が反応して穴ができやすい
（`football-tactics.md`「矛盾しない指示への分解」の役割衝突チェックに対応）。
また、配分によっては純粋なDFが1人しかいない場合もある。その場合は下記の「状況オーバーライド・
ブロック」の "defender" という語を、実際にその役目を担う選手（例: holding midfielder）に
読み替えて配布する。

### 攻撃時/守備時ポジション・ブロック（可変システム。`football-tactics.md`1節に対応）

まずは5人目や2枚目のMF/DFなど1〜2人から試す。全員に入れると優先順位が複雑になりすぎる。

```
Positioning mode (cheap check — which team is closer to the ball right now):
- When {TEAM} has the ball: [EXAMPLE — attacking-leaning positioning, e.g.
  push higher and offer a passing option ahead of the ball].
- When the opponent has the ball: [EXAMPLE — defensive-leaning positioning,
  e.g. drop back and get goal-side of the nearest opponent].
Switch between these two based on possession only — do not also try to
factor in score/clock here, that is handled by the situational overrides
below.
```

### 状況オーバーライド・ブロック（各選手のテンプレート末尾に追加）

```
Situational overrides (apply on top of the priority order above):
- Leading late in the match: prefer the safest available action; avoid risky
  SHOOT/DRIBBLE; do not both press the ball at the same time as a teammate.
  IDLE is acceptable while holding a safe position — do not force an action
  just to be doing something.
- Behind late in the match: accept more risk on SHOOT/DRIBBLE/forward PASS;
  at least one outfield player positioned near our own goal must still stay
  behind the ball to prevent a counter-attack (this may be a defender or,
  in a formation with only one true defender, the deepest midfielder).
- Opponent controls possession deep in our half: prioritize MARK/PRESS_BALL
  over positioning for attack.
```

`IDLE`はサボりではなく「今動くとかえって陣形を崩す/スタミナを浪費する」場面の選択肢として
明示しておく。何も書かないと常にMOVE_TO等で動き続けようとしがちなので、上記のように
「安全な位置を保てているならIDLEでよい」と一言添えると無駄な消耗を抑えやすい。

### 切り替え（トランジション）ブロック（`football-tactics.md`2節「切り替えとライン設定」に対応）

ボールを失った/奪った直後の1〜2ティックだけを扱う短いブロック。選んだ戦術（ハイプレス系か
ミドル/ローブロック系か）に応じて、失った瞬間の反応を書き分ける。

```
Transition rule: the instant possession changes, react before anything else:
- If we just won the ball: look for a quick forward PASS or MOVE_TO into
  space while the opponent is still out of position, even if that means
  deviating from your normal priority order for one action.
- If we just lost the ball: [choose one depending on your team's tactic —
  EXAMPLE A (high-press teams) — the nearest player to the ball should
  PRESS_BALL immediately; EXAMPLE B (low-block teams) — get goal-side of
  your nearest opponent immediately instead of chasing the ball].
```

チーム内で戦術が混在する場合（例: FWだけハイプレス的、DFはローブロック的）でも、ネガティブ・
トランジションの反応（PRESS_BALLかgoal-sideか）は選手ごとに変えてよい。ただし同じ選手の中で
矛盾させない。


### スカウティング・ブロック（相手の傾向を読む。負けられない試合・格上/未知の相手向け）

全員に入れてもよいが、まずはDF・MF・5人目など判断に余裕がある役割から導入するとよい。
中身は`football-tactics.md`5節の表に対応させる。**過去の展開を覚えている前提にせず、
今のgame_stateだけで判定できる条件式にする**（1で述べた1秒のレイテンシ制限のため）。

```
Opponent read (cheap checks against the current game_state only — do not
assume you remember earlier ticks):
- If three or more opponent outfielders are positioned in their own half,
  they are likely sitting in a low block — favor patient PASS/possession and
  wing play over forcing a central SHOOT.
- If multiple opponents are moving at high velocity toward our half, they are
  pressing high — prioritize a quick safe PASS out of pressure over DRIBBLE.
- If the same opponent player is repeatedly the one closest to danger near
  our box, treat them as the opponent's most dangerous player and bias your
  MARK toward them.
- If one specific opponent outfielder is consistently slower (lower
  velocity) or out of position compared to their teammates, treat them as
  the exploitable weak link: prefer directing PASS/DRIBBLE toward the space
  they are supposed to cover rather than spreading attacks evenly.
If you get a live text update about the opponent's tendencies during the
match, treat it as scouting information and weigh it into these checks
rather than ignoring it. These reads are secondary to the situational
overrides above — if they conflict (e.g. score says "behind, take risks" but
the opponent looks like they are pressing high), follow the situational
override first and use the opponent read only to choose how you execute it.
```

チーム共通ドクトリンの最後に「試合中のテキスト指示に従う」旨を入れている場合、それが
そのままスカウティング情報の受け口にもなる（人間や監視スクリプトが「相手は右サイドに偏って
いる」等を送ればよい）。新しい仕組みを別途用意する必要はない。

### Plan A / Plan B ブロック（格上・未知の相手向け。`football-tactics.md`6節(1)に対応）

1つの優先順位に決め打ちすると、相手がそれを無力化する動きをしてきたときに手詰まりになる。
各選手のPrimary/Action priorityに続けて、切替条件つきの代替プランを足す。切替条件は
「一定時間結果が出ていない」という判定しやすい形にする（相手の意図を読む必要がないので
軽量）。

```
Plan A (default): [the priority order already defined above for this role].
Plan B (switch if Plan A is not working): if by roughly the midpoint of the
match your team has not created a clear shot, or the opponent keeps winning
the ball back from your Plan A approach, switch to [a concretely different
priority — e.g. if Plan A was possession-first, Plan B is direct wing play:
MOVE_TO the flank space and PASS forward early instead of building through
the middle]. Do not run both at once — commit to one plan at a time.
```

Plan Bは「Plan Aの逆」であるだけで十分機能する（例: ポゼッション⇄サイド突破、ハイプレス⇄
ミドルブロック）。凝った第三の案を考えるより、2節の戦術一覧から性質が違うものを1つ選ぶ方が
早くて堅い。

## リアルタイム指示（試合中に送る短文）の書き方

自律判断で無視され得る前提で、方針と矛盾しない短い命令文にする。

```
"Push higher and press now."
"Drop deeper, protect the lead."
"Look for the ball into the striker's space."
"Slow it down, keep possession."
"Their left side is open, attack that flank."
"Number 9 keeps drifting into our box, mark them tighter."
```

後半の2例のように、対戦中に人間が気づいた相手の傾向をそのまま短く伝えるのがスカウティング・
ブロックの主な使い道になる。

長い説明・条件分岐を試合中の指示に詰め込まない。条件分岐はsystem promptの
「状況オーバーライド」に書いておき、試合中の指示は一言のトリガーに留める。

## プロンプト改善の進め方

1. ユーザーから既存プロンプト（5本）を受け取る。
2. 上記レビュー基準で1本ずつ問題点を指摘する（該当箇所を引用しながら）。
3. 5本を横断して「矛盾しない指示への分解」の4点（`football-tactics.md`）を満たすか確認する。
4. 一度に全部書き換えず、`match-review.md` の「小さく比較可能な変更」の原則に従い、
   直す箇所を絞った改訂版を提示する。
