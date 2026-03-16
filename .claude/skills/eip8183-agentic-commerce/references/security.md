# ERC-8183 セキュリティ考慮事項・監査チェックリスト

## コアセキュリティリスク

### 1. Evaluator信頼リスク（最重要）

単一のEvaluatorがcomplete/reject権限を独占する設計のため、
Evaluatorの共謀・悪意が最大のリスク。

**攻撃シナリオ:**
- Evaluator+Providerが共謀: 品質不足の成果物を承認、Client資金流出
- Evaluator+Clientが共謀: 正当な成果物を拒否、Provider報酬不払い
- Evaluator単独: 意図的なreject/completeの遅延（expiry待ち）

**軽減策:**
```solidity
// マルチモデルEvaluator: 3+のAIモデルで70%合意を要求
contract MultiModelEvaluator {
    uint256 public constant THRESHOLD = 70; // 70%
    mapping(uint256 => mapping(address => bool)) public votes;
    mapping(uint256 => uint256) public approvalCount;
    mapping(uint256 => uint256) public totalVotes;
    address[] public models;

    function vote(uint256 jobId, bool approve) external {
        require(isRegisteredModel(msg.sender), "Not a registered model");
        require(!votes[jobId][msg.sender], "Already voted");

        votes[jobId][msg.sender] = true;
        totalVotes[jobId]++;
        if (approve) approvalCount[jobId]++;

        // 全モデルが投票完了したら判定
        if (totalVotes[jobId] == models.length) {
            uint256 approvalRate = (approvalCount[jobId] * 100) / models.length;
            if (approvalRate >= THRESHOLD) {
                // complete jobを呼ぶ
            } else {
                // reject jobを呼ぶ
            }
        }
    }
}
```

**ステーキングベースの信頼:**
```solidity
// Evaluatorにステーキングを要求
contract StakedEvaluator {
    mapping(address => uint256) public stakes;
    uint256 public minStake;

    function stake() external payable {
        stakes[msg.sender] += msg.value;
    }

    // 不正評価時にスラッシュ
    function slash(address evaluator, uint256 amount) external onlyGovernance {
        require(stakes[evaluator] >= amount, "Insufficient stake");
        stakes[evaluator] -= amount;
    }
}
```

### 2. 紛争解決なし

reject/expire決定は最終的。アピールメカニズムが存在しない。

**軽減策（アプリケーション層）:**
- タイムロック付きreject（reject後N日間は異議申立て可能）
- マルチシグEvaluator（複数署名で判定）
- オフチェーン仲裁サービスとの統合

### 3. フロントラン攻撃

`fund()`呼び出し前にBudgetが変更される可能性。

**防止策（プロトコル組み込み済み）:**
```solidity
// expectedBudgetパラメータで保護
function fund(uint256 jobId, uint256 expectedBudget, bytes calldata optParams) external {
    if (job.budget != expectedBudget) revert BudgetMismatch(expectedBudget, job.budget);
    // ...
}
```

### 4. リエントランシー

ERC-20トークン転送時のリエントランシーリスク。

**防止策:**
```solidity
// ReentrancyGuardTransient使用（transient storage活用で低ガス）
contract AgenticCommerce is ReentrancyGuardTransient {
    function fund(...) external nonReentrant { ... }
    function complete(...) external nonReentrant { ... }
    function reject(...) external nonReentrant { ... }
    function claimRefund(...) external nonReentrant { ... }
}
```

### 5. Hook悪用

悪意あるHookコントラクトによるリスク。

**攻撃シナリオ:**
- `beforeAction`でrevertし続けてJob操作をブロック
- `afterAction`で大量ガスを消費してDoS
- Hookコントラクト内で外部コールし、状態を不正に操作

**防止策:**
```solidity
// 1. ホワイトリスト化
mapping(address => bool) public whitelistedHooks;

// 2. ガスリミット付きHookコール
function _executeHook(Job storage job, bytes4 selector, bytes memory data, bool isBefore) internal {
    if (job.hook == address(0)) return;

    // ガスリミットを設定
    uint256 gasLimit = 200_000; // 最大200kガス
    try IACPHook(job.hook).beforeAction{gas: gasLimit}(job.id, selector, data) {
        // 成功
    } catch {
        // Hook失敗時の処理（revertするかスキップするか設計判断）
        revert("Hook execution failed");
    }
}

// 3. claimRefundはHook不可（最重要セキュリティ設計）
function claimRefund(uint256 jobId) external nonReentrant {
    // Hookを一切呼ばない → 悪意あるHookでも返金をブロックできない
}
```

### 6. 成果物可用性リスク

成果物（deliverable）はオフチェーンに保存されるため、
Provider側のストレージがダウンするとEvaluatorがアクセスできない。

**軽減策:**
- IPFS/Arweaveなど永続ストレージを使用
- 成果物のピン留め証明をHookで検証
- SLA保証付きストレージプロバイダーの利用

### 7. タイムスタンプ依存

`expiredAt`はblock.timestampに依存。マイナーによる操作リスクは低いが存在。

**軽減策:**
- 十分な余裕を持ったexpiry設定（最低1時間以上）
- ブロック番号ベースの代替は非推奨（ブロック時間の変動）

## 監査チェックリスト

### 状態遷移

- [ ] Open → Funded: clientのみ、provider設定済み、budget一致
- [ ] Funded → Submitted: providerのみ
- [ ] Submitted → Completed: evaluatorのみ
- [ ] Open → Rejected: clientのみ
- [ ] Funded/Submitted → Rejected: evaluatorのみ
- [ ] Funded/Submitted → Expired: 期限切れ後、パーミッションレス
- [ ] 不正な遷移が全てrevertされること

### 資金管理

- [ ] fund(): SafeERC20.safeTransferFrom使用
- [ ] complete(): 手数料計算のオーバーフローなし
- [ ] complete(): Provider支払い = budget - platformFee - evaluatorFee
- [ ] reject(Funded/Submitted): 全額返金
- [ ] claimRefund(): 全額返金
- [ ] 手数料は返金時に適用されない
- [ ] コントラクトに残留資金がないこと

### アクセス制御

- [ ] createJob: 誰でも呼べる
- [ ] setProvider: clientのみ、Open状態のみ
- [ ] setBudget: client or provider、Open状態のみ
- [ ] fund: clientのみ、Open状態のみ
- [ ] submit: providerのみ、Funded状態のみ
- [ ] complete: evaluatorのみ、Submitted状態のみ
- [ ] reject(Open): clientのみ
- [ ] reject(Funded/Submitted): evaluatorのみ
- [ ] claimRefund: 誰でも（期限切れ後のみ）

### Hook

- [ ] claimRefundはHook不可
- [ ] Hookのガスリミットが設定されている
- [ ] ホワイトリスト機能が実装されている
- [ ] Hook失敗時の動作が明確

### その他

- [ ] リエントランシーガード（全外部コール関数）
- [ ] SafeERC20使用（全トークン操作）
- [ ] UUPSアップグレード権限はADMIN_ROLEのみ
- [ ] Evaluatorアドレスがaddress(0)でないことの検証
- [ ] jobCounterのオーバーフロー保護（uint256で実質不要）
- [ ] イベントが全アクションで正しく発火

## ガスコスト見積もり

| 操作 | 推定ガス | L1コスト(@30gwei) | L2コスト |
|------|---------|-------------------|---------|
| createJob | ~150k | ~$15 | ~$0.10 |
| setBudget | ~50k | ~$5 | ~$0.03 |
| fund | ~100k | ~$10 | ~$0.07 |
| submit | ~80k | ~$8 | ~$0.05 |
| complete | ~120k | ~$12 | ~$0.08 |
| reject | ~100k | ~$10 | ~$0.07 |
| claimRefund | ~80k | ~$8 | ~$0.05 |
| **合計（正常フロー）** | **~500k** | **~$50** | **~$0.33** |
