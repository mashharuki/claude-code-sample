# Hardhat 3 Solidityテスト詳細ガイド

## テスト認識ルール

以下のいずれかに該当するファイルがテストとして認識される：
- `contracts/` 内の `.t.sol` ファイル
- `test/` 内の `.sol` ファイル

テストコントラクト内で `test` プレフィックスを持つ関数がテストケースとして実行される。

## テストのライフサイクル

1. テストコントラクトがデプロイされる
2. `setUp()` が実行される（定義されている場合）
3. 各 `test*` 関数が独立して実行される
4. リバートしなければパス、リバートすれば失敗

## forge-std の導入

```bash
npm add --save-dev 'github:foundry-rs/forge-std#v1.9.7'
```

```solidity
import { Test } from "forge-std/Test.sol";

contract MyTest is Test {
    // Test を継承することで assertEq, vm.* 等が使える
}
```

## テストパターン

### ユニットテスト
```solidity
contract TokenTest is Test {
    Token token;
    address alice = address(0x1);
    address bob = address(0x2);

    function setUp() public {
        token = new Token("Test", "TST", 1000);
        token.transfer(alice, 100);
    }

    function test_Transfer() public {
        vm.prank(alice);
        token.transfer(bob, 50);
        assertEq(token.balanceOf(bob), 50);
        assertEq(token.balanceOf(alice), 50);
    }

    function test_TransferInsufficientBalance_Reverts() public {
        vm.prank(alice);
        vm.expectRevert("Insufficient balance");
        token.transfer(bob, 200);
    }
}
```

### ファズテスト
パラメータを持つtest関数は自動的にファズテストになる。
ランダムな値で複数回（デフォルト256回）実行される。

```solidity
function testFuzz_Transfer(uint256 amount) public {
    // 前提条件を設定（条件を満たさない入力をスキップ）
    vm.assume(amount > 0 && amount <= 100);

    vm.prank(alice);
    token.transfer(bob, amount);
    assertEq(token.balanceOf(bob), amount);
}
```

設定：
```typescript
// hardhat.config.ts
test: {
  solidity: {
    fuzz: {
      runs: 256,           // テストケース数
      maxTestRejects: 65536,
      seed: "0xdeadbeef",  // 再現性のためのシード
      dictionaryWeight: 40,
    },
  },
}
```

### インバリアントテスト
ステートフルなプロパティベーステスト。コントラクトの不変条件を検証する。

```solidity
contract TokenInvariantTest is Test {
    Token token;

    function setUp() public {
        token = new Token("Test", "TST", 1000);
    }

    // invariant_ プレフィックスでインバリアントテストとして認識
    function invariant_TotalSupplyNeverChanges() public view {
        assertEq(token.totalSupply(), 1000);
    }
}
```

設定：
```typescript
test: {
  solidity: {
    invariant: {
      runs: 256,
      depth: 500,           // 1回のrunあたりのコール数
      failOnRevert: false,
      shrinkRunLimit: 5000,
    },
  },
}
```

## 主要アサーション（forge-std）

```solidity
// 等値
assertEq(a, b);
assertEq(a, b, "error message");

// 不等
assertNotEq(a, b);

// 比較
assertGt(a, b);   // a > b
assertGe(a, b);   // a >= b
assertLt(a, b);   // a < b
assertLe(a, b);   // a <= b

// 近似
assertApproxEqAbs(a, b, maxDelta);
assertApproxEqRel(a, b, maxPercentDelta);

// 真偽
assertTrue(condition);
assertFalse(condition);
```

## 主要チートコード

### 送信者・残高操作
```solidity
// 次のコールのmsg.senderを変更
vm.prank(address);

// 複数コールのmsg.senderを変更
vm.startPrank(address);
// ... 複数のコール ...
vm.stopPrank();

// ETH残高を設定
vm.deal(address, amount);

// ERC20残高を設定（ストレージ直接操作）
deal(address(token), alice, 1000e18);
```

### 時間・ブロック操作
```solidity
// ブロックタイムスタンプを設定
vm.warp(1700000000);

// ブロック番号を設定
vm.roll(19000000);

// 時間を進める（現在+秒数）
skip(3600); // 1時間進める

// 時間を戻す
rewind(3600);
```

### リバート・イベント期待
```solidity
// 次のコールがリバートすることを期待
vm.expectRevert();
vm.expectRevert("error message");
vm.expectRevert(abi.encodeWithSelector(CustomError.selector, arg1));

// イベント発火を期待
vm.expectEmit();
emit Transfer(from, to, amount); // 期待するイベント
token.transfer(to, amount);      // 実際のコール

// 特定のトピックだけチェック
vm.expectEmit(true, true, false, true);
```

### ストレージ操作
```solidity
// ストレージスロットの読み書き
bytes32 value = vm.load(address, slot);
vm.store(address, slot, newValue);

// コントラクトバイトコードを設定
vm.etch(address, bytecode);

// ノンスを操作
vm.setNonce(address, nonce);
```

### フォーク
```solidity
// メインネットフォークを作成
uint256 forkId = vm.createFork("mainnet");
vm.selectFork(forkId);

// 特定ブロックでフォーク
uint256 forkId = vm.createSelectFork("mainnet", 19000000);

// フォークのブロックを進める
vm.rollFork(19000001);
```

### スナップショット
```solidity
// 状態を保存
uint256 snapshotId = vm.snapshot();

// ... 状態変更 ...

// 状態を復元
vm.revertTo(snapshotId);
```

### モック
```solidity
// コール結果をモック
vm.mockCall(
    address(token),
    abi.encodeWithSelector(token.balanceOf.selector, alice),
    abi.encode(1000e18)
);

// モックをクリア
vm.clearMockedCalls();
```

### ガス計測
```solidity
vm.pauseGasMetering();
// ... ガス計測に含めたくない操作 ...
vm.resumeGasMetering();
```

### ラベル（デバッグ用）
```solidity
vm.label(alice, "Alice");
vm.label(bob, "Bob");
vm.label(address(token), "Token");
```

## マルチチェーンテスト

```bash
# デフォルト（Ethereum L1）
npx hardhat test solidity

# OP Mainnet
npx hardhat test solidity --chain-type op
```

## テスト実行オプション

```bash
npx hardhat test solidity                    # 全Solidityテスト
npx hardhat test solidity --chain-type op    # OPチェーンで実行
npx hardhat test contracts/MyTest.t.sol      # 特定ファイル
npx hardhat test --coverage                  # カバレッジ測定
```

## ファイルシステムパーミッション

Solidityテストからファイルシステムにアクセスする場合、明示的にパーミッションを設定：

```typescript
test: {
  solidity: {
    fsPermissions: {
      readFile: ["./data", "./config"],
      writeFile: ["./output"],
      readWriteFile: ["./state"],
      readDirectory: ["./fixtures"],
    },
  },
}
```

## FFI（Foreign Function Interface）

外部コマンドを実行するチートコード。セキュリティリスクがあるため明示的に有効化が必要：

```typescript
test: { solidity: { ffi: true } }
```

```solidity
string[] memory cmd = new string[](3);
cmd[0] = "echo";
cmd[1] = "-n";
cmd[2] = "hello";
bytes memory result = vm.ffi(cmd);
```
