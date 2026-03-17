# ERC-8004 セキュリティ考慮事項・監査チェックリスト

## コアセキュリティリスク

### 1. Sybil攻撃（偽Agent評判水増し）

攻撃者が大量のウォレットを生成し、自身のAgentに高スコアフィードバックを送信。

**攻撃シナリオ:**
- 攻撃者が100個のウォレットを作成 → 全て自分のAgentに★5フィードバック
- Identity Registryで複数の偽Agentを登録し、互いにフィードバック（リング攻撃）
- OperatorではないがAgent所有者と共謀する第三者

**軽減策:**
```solidity
// 1. 自己フィードバック防止（プロトコル組み込み済み）
require(!IIdentityRegistry(_identityRegistry)
    .isAuthorizedOrOwner(msg.sender, agentId),
    "Self-feedback not allowed");

// 2. レビュアー評判フィルタリング（アプリケーション層）
// - フィードバック投稿者のトランザクション履歴を分析
// - World ID / Proof of Humanityと統合
// - フィードバック投稿に小額のステーキング要求
```

**Subgraphレベルの対策:**
```graphql
# フィードバック投稿者の信頼度で重み付け
query AgentReputation($agentId: BigInt!) {
  feedbacks(
    where: { agentId: $agentId, isRevoked: false }
    orderBy: blockTimestamp
    orderDirection: desc
  ) {
    value
    clientAddress
    # クライアントの過去のフィードバック数・取引数で重み付け
  }
}
```

### 2. Agent Wallet不正設定

`setAgentWallet`を悪用してAgent NFTの信頼を別ウォレットに移転。

**防止策（プロトコル組み込み済み）:**
```solidity
// EIP-712署名検証 + 厳格なdeadline制限
require(block.timestamp <= deadline, "expired");
require(deadline <= block.timestamp + MAX_DEADLINE_DELAY, "deadline too far");
// MAX_DEADLINE_DELAY = 5 minutes

// ECDSA + ERC-1271デュアル検証
(address recovered, ECDSA.RecoverError err, ) =
    ECDSA.tryRecover(digest, signature);
if (err != ECDSA.RecoverError.NoError || recovered != newWallet) {
    // ERC-1271フォールバック
}
```

### 3. NFT転送時のWallet残存リスク

Agent NFTが転送されたのにagentWalletが前の所有者のままだと、
前の所有者がAgentとして振る舞える。

**防止策（プロトコル組み込み済み）:**
```solidity
// _updateオーバーライドでCEIパターン準拠
function _update(address to, uint256 tokenId, address auth)
    internal override returns (address)
{
    address from = _ownerOf(tokenId);
    // 転送時（ミント・バーンではない）にクリア
    if (from != address(0) && to != address(0)) {
        $._metadata[tokenId]["agentWallet"] = "";
        emit MetadataSet(tokenId, "agentWallet", "agentWallet", "");
    }
    return super._update(to, tokenId, auth); // 外部コールは最後
}
```

### 4. メタデータ改ざん

権限のない第三者がAgent のメタデータを変更しようとする。

**防止策（プロトコル組み込み済み）:**
```solidity
// 所有者 or 承認済みオペレーター or 個別承認のみ
require(
    msg.sender == agentOwner ||
    isApprovedForAll(agentOwner, msg.sender) ||
    msg.sender == getApproved(agentId),
    "Not authorized"
);
// "agentWallet"キーは直接設定不可
require(keccak256(bytes(metadataKey))
    != RESERVED_AGENT_WALLET_KEY_HASH, "reserved key");
```

### 5. requestHash衝突（Validation Registry）

同一のrequestHashで検証リクエストが上書きされるリスク。

**防止策（プロトコル組み込み済み）:**
```solidity
// 既存requestHashの上書きを防止
require($.validations[requestHash].validatorAddress == address(0), "exists");
```

### 6. フィードバック値の操作

極端なvalue（int128の最大値）でサマリー計算を歪める。

**防止策（プロトコル組み込み済み）:**
```solidity
int128 private constant MAX_ABS_VALUE = 1e38;
require(value >= -MAX_ABS_VALUE && value <= MAX_ABS_VALUE, "value too large");
require(valueDecimals <= 18, "too many decimals");
```

### 7. ガスDoS攻撃

`getSummary`の計算で大量のフィードバックを処理させ、ガスを枯渇させる。

**軽減策:**
- `clientAddresses`パラメータを必須にし、全クライアントの自動スキャンを防止
- オフチェーンインデクサー（Subgraph）で集約計算を代替
- ビュー関数のためオンチェーンコストは直接ないが、RPCノードの負荷に注意

## 監査チェックリスト

### Identity Registry

- [ ] register(): 増分ID割り当てが正しいこと
- [ ] register(): agentWalletがmsg.senderに自動設定されること
- [ ] register(metadata): "agentWallet"キーが拒否されること
- [ ] setMetadata(): 所有者/オペレーター/承認者のみ
- [ ] setMetadata(): "agentWallet"キーが拒否されること
- [ ] setAgentURI(): 所有者/オペレーター/承認者のみ
- [ ] setAgentWallet(): EIP-712署名が正しく検証されること
- [ ] setAgentWallet(): deadline制限（MAX 5分）が機能すること
- [ ] setAgentWallet(): ECDSA失敗時にERC-1271フォールバック
- [ ] setAgentWallet(): address(0)が拒否されること
- [ ] unsetAgentWallet(): 所有者/オペレーター/承認者のみ
- [ ] _update(): 転送時にagentWalletがクリアされること
- [ ] _update(): ミント時にクリアされないこと
- [ ] イベントが全操作で正しく発火すること

### Reputation Registry

- [ ] giveFeedback(): 自己フィードバックが防止されること
- [ ] giveFeedback(): valueDecimalsが0〜18の範囲
- [ ] giveFeedback(): valueが±1e38の範囲
- [ ] giveFeedback(): フィードバックインデックスが1-indexed
- [ ] giveFeedback(): 新規クライアントが_clientsに追加されること
- [ ] revokeFeedback(): フィードバック投稿者のみ
- [ ] revokeFeedback(): 二重取消が防止されること
- [ ] appendResponse(): インデックス範囲チェック
- [ ] appendResponse(): 空URIが拒否されること
- [ ] getSummary(): WAD正規化が正しいこと
- [ ] getSummary(): 取消済みフィードバックが除外されること
- [ ] getSummary(): タグフィルタリングが正しいこと
- [ ] getSummary(): 空のclientAddressesが拒否されること

### Validation Registry

- [ ] validationRequest(): 所有者/オペレーター/承認者のみ
- [ ] validationRequest(): address(0)バリデーターが拒否されること
- [ ] validationRequest(): 既存requestHashが拒否されること
- [ ] validationResponse(): 指定Validatorのみ
- [ ] validationResponse(): responseが0〜100の範囲
- [ ] validationResponse(): 同一requestHashに複数回レスポンス可能
- [ ] getSummary(): バリデーターフィルタリングが正しいこと
- [ ] getSummary(): タグフィルタリングが正しいこと
- [ ] getSummary(): hasResponseがfalseのものが除外されること

### 共通

- [ ] UUPSアップグレード権限がonlyOwnerのみ
- [ ] ERC-7201ストレージスロットの計算が正しいこと
- [ ] reinitializer(2)でバージョン管理が正しいこと
- [ ] constructorで_disableInitializers()が呼ばれること
- [ ] 全イベントが正しいパラメータで発火すること

## 依存関係セキュリティ

| 依存関係 | バージョン | リスク |
|---------|----------|--------|
| OpenZeppelin Contracts Upgradeable | ^5.0 | 低（監査済み） |
| EIP-712 | Standard | 低（確立済み） |
| ECDSA | Standard | 低（確立済み） |
| ERC-1271 | Standard | 中（実装依存） |

## ガスコスト見積もり

| 操作 | 推定ガス | L1コスト(@30gwei) | L2コスト |
|------|---------|-------------------|---------|
| register() | ~150k | ~$15 | ~$0.10 |
| register(URI) | ~180k | ~$18 | ~$0.12 |
| register(URI, metadata) | ~200k+ | ~$20+ | ~$0.15+ |
| setMetadata | ~50k | ~$5 | ~$0.03 |
| setAgentWallet | ~80k | ~$8 | ~$0.05 |
| giveFeedback | ~120k | ~$12 | ~$0.08 |
| revokeFeedback | ~40k | ~$4 | ~$0.03 |
| validationRequest | ~100k | ~$10 | ~$0.07 |
| validationResponse | ~60k | ~$6 | ~$0.04 |
