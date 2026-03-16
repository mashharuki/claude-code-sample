# IACPHook 拡張システム詳細

## 概要

Hookシステムにより、ERC-8183の各アクション前後にカスタムロジックを注入できる。
継承ではなくコンポジションによる拡張で、コアプロトコルを変更せずに
レピュテーションゲート、入札マーケット、ZK検証等を実現する。

## Hook対象関数

| 関数 | Hook可能 | dataエンコード |
|------|---------|---------------|
| `setProvider` | Yes | `abi.encode(address provider, bytes optParams)` |
| `setBudget` | Yes | `abi.encode(uint256 amount, bytes optParams)` |
| `fund` | Yes | `optParams`（生bytes） |
| `submit` | Yes | `abi.encode(bytes32 deliverable, bytes optParams)` |
| `complete` | Yes | `abi.encode(bytes32 reason, bytes optParams)` |
| `reject` | Yes | `abi.encode(bytes32 reason, bytes optParams)` |
| `claimRefund` | **No** | — |

`claimRefund`がHook不可である理由：悪意あるHookがbeforeActionでrevertすることで、
期限切れJobの返金を永久にブロックできてしまうため。
これはセキュリティ上の意図的な設計判断。

## Hook実装例

### 1. レピュテーションゲートHook

ERC-8004レピュテーションレジストリと連携し、一定スコア以上のProviderのみ
参加を許可する。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IACPHook.sol";

interface IReputationRegistry {
    function getScore(address agent) external view returns (uint256);
}

contract ReputationGateHook is IACPHook {
    IReputationRegistry public registry;
    uint256 public minScore;

    constructor(address _registry, uint256 _minScore) {
        registry = IReputationRegistry(_registry);
        minScore = _minScore;
    }

    function beforeAction(
        uint256 jobId,
        bytes4 selector,
        bytes calldata data
    ) external override {
        // setProvider時にProviderのスコアをチェック
        if (selector == bytes4(keccak256("setProvider(uint256,address,bytes)"))) {
            (address provider, ) = abi.decode(data, (address, bytes));
            require(
                registry.getScore(provider) >= minScore,
                "Provider reputation too low"
            );
        }

        // fund時にClientのスコアもチェック（オプション）
        if (selector == bytes4(keccak256("fund(uint256,uint256,bytes)"))) {
            // Client address is tx.origin or can be passed in optParams
        }
    }

    function afterAction(
        uint256, bytes4, bytes calldata
    ) external override {
        // No-op for this hook
    }
}
```

### 2. 入札マーケットHook

複数のProviderが入札でき、Clientが最適なProviderを選択できる。

```solidity
contract BiddingHook is IACPHook {
    struct Bid {
        address provider;
        uint256 amount;
        string proposal;
    }

    // jobId => bids
    mapping(uint256 => Bid[]) public bids;

    event BidPlaced(uint256 indexed jobId, address provider, uint256 amount);

    function placeBid(
        uint256 jobId,
        uint256 amount,
        string calldata proposal
    ) external {
        bids[jobId].push(Bid({
            provider: msg.sender,
            amount: amount,
            proposal: proposal
        }));
        emit BidPlaced(jobId, msg.sender, amount);
    }

    function getBids(uint256 jobId) external view returns (Bid[] memory) {
        return bids[jobId];
    }

    function beforeAction(
        uint256 jobId,
        bytes4 selector,
        bytes calldata data
    ) external override {
        // setProvider時に、選択されたProviderが入札者であることを確認
        if (selector == bytes4(keccak256("setProvider(uint256,address,bytes)"))) {
            (address provider, ) = abi.decode(data, (address, bytes));
            bool hasBid = false;
            Bid[] storage jobBids = bids[jobId];
            for (uint256 i = 0; i < jobBids.length; i++) {
                if (jobBids[i].provider == provider) {
                    hasBid = true;
                    break;
                }
            }
            require(hasBid, "Provider must have placed a bid");
        }
    }

    function afterAction(uint256, bytes4, bytes calldata) external override {}
}
```

### 3. レピュテーション更新Hook（afterAction）

Job完了/拒否時にERC-8004レジストリを自動更新する。

```solidity
contract ReputationUpdateHook is IACPHook {
    IReputationRegistry public registry;

    constructor(address _registry) {
        registry = IReputationRegistry(_registry);
    }

    function beforeAction(uint256, bytes4, bytes calldata) external override {}

    function afterAction(
        uint256 jobId,
        bytes4 selector,
        bytes calldata data
    ) external override {
        if (selector == bytes4(keccak256("complete(uint256,bytes32,bytes)"))) {
            (bytes32 reason, ) = abi.decode(data, (bytes32, bytes));
            // Providerのスコアを上昇
            // registry.addPositiveAttestation(provider, reason);
        }

        if (selector == bytes4(keccak256("reject(uint256,bytes32,bytes)"))) {
            (bytes32 reason, ) = abi.decode(data, (bytes32, bytes));
            // Providerのスコアを下降
            // registry.addNegativeAttestation(provider, reason);
        }
    }
}
```

### 4. アクセス制御Hook（NFTゲート）

特定のNFTを保持するAgentのみ参加可能にする。

```solidity
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract NFTGateHook is IACPHook {
    IERC721 public membershipNFT;

    constructor(address _nft) {
        membershipNFT = IERC721(_nft);
    }

    function beforeAction(
        uint256,
        bytes4 selector,
        bytes calldata data
    ) external override {
        if (selector == bytes4(keccak256("fund(uint256,uint256,bytes)"))) {
            // fund時のtx.originがNFTを保持していることを確認
            require(
                membershipNFT.balanceOf(tx.origin) > 0,
                "Must hold membership NFT"
            );
        }
    }

    function afterAction(uint256, bytes4, bytes calldata) external override {}
}
```

## Hook実装のベストプラクティス

1. **ガスリミットを意識** — beforeAction/afterActionは呼び出し元トランザクションのガスを消費する。
   重い処理はオフチェーンで行い、オンチェーンは検証のみにする。
2. **revertは慎重に** — beforeActionでrevertするとアクション全体がブロックされる。
   afterActionでrevertするとトランザクション全体がロールバックされる。
3. **ホワイトリスト化** — 悪意あるHookを防ぐため、デプロイヤーがHookをホワイトリストに登録する。
4. **テスト徹底** — Hookのバグはコアプロトコルの動作を壊す可能性がある。
5. **ガスバジェット** — 実装ではHookコールにガスリミットを設定することを推奨。
