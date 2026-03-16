# Hardhat 3 TypeScriptテスト詳細ガイド（Viem + node:test）

## 推奨スタック

- **ライブラリ**: Viem（型安全なEthereum操作）
- **テストランナー**: node:test（Node.js組み込み、依存なし）
- **アサーション**: node:assert/strict + hardhat-viem-assertions

## セットアップ

### パッケージインストール
```bash
npm add --save-dev \
  @nomicfoundation/hardhat-viem \
  @nomicfoundation/hardhat-viem-assertions \
  @nomicfoundation/hardhat-node-test-runner \
  @nomicfoundation/hardhat-network-helpers \
  viem
```

### 設定
```typescript
import { defineConfig } from "hardhat/config";
import hardhatViem from "@nomicfoundation/hardhat-viem";
import hardhatViemAssertions from "@nomicfoundation/hardhat-viem-assertions";
import hardhatNodeTestRunner from "@nomicfoundation/hardhat-node-test-runner";
import hardhatNetworkHelpers from "@nomicfoundation/hardhat-network-helpers";

export default defineConfig({
  plugins: [
    hardhatViem,
    hardhatViemAssertions,
    hardhatNodeTestRunner,
    hardhatNetworkHelpers,
  ],
  solidity: "0.8.28",
});
```

または一括で：
```typescript
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";

export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: "0.8.28",
});
```

## 基本テスト構造

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("MyContract", async function () {
  // テストスイートごとにネットワーク接続
  const { viem, networkHelpers } = await network.connect();

  it("should do something", async function () {
    const contract = await viem.deployContract("MyContract");
    // テスト内容
  });
});
```

### 重要: `network.connect()` の動作
- 毎回新しいブロックチェーン状態が生成される
- テスト終了時に状態は破棄される
- `describe` ブロックのトップレベルで1回接続し、テストで共有するのが一般的

## コントラクトデプロイ

```typescript
// 引数なし
const counter = await viem.deployContract("Counter");

// コンストラクタ引数あり
const token = await viem.deployContract("Token", ["MyToken", "MTK", 1000n]);

// デプロイオプション
const contract = await viem.deployContract("MyContract", [arg1], {
  value: 1000000000000000000n, // 1 ETH
});
```

## コントラクト操作

### 読み取り（view/pure関数）
```typescript
const value = await counter.read.x();
const balance = await token.read.balanceOf([alice]);
```

### 書き込み（状態変更関数）
```typescript
await counter.write.inc();
await token.write.transfer([bob, 100n]);

// 特定アカウントから実行
const [, otherAccount] = await viem.getWalletClients();
await counter.write.inc({ account: otherAccount.account });
```

### 型安全
Hardhat 3は型付きアーティファクトを自動生成する。
コントラクト変更後は `npx hardhat build` で型を更新。
VS Codeで型エラーが表示される場合は「TypeScript: Reload Project」を実行。

## アカウント操作

```typescript
// テストアカウント取得
const [owner, alice, bob] = await viem.getWalletClients();

// パブリッククライアント
const publicClient = await viem.getPublicClient();

// アカウントアドレス
const ownerAddress = owner.account.address;
```

## フィクスチャ（テスト高速化）

```typescript
async function deployTokenFixture() {
  const token = await viem.deployContract("Token", ["Test", "TST", 1000n]);
  const [owner, alice, bob] = await viem.getWalletClients();

  // 初期状態を設定
  await token.write.transfer([alice.account.address, 100n]);

  return { token, owner, alice, bob };
}

describe("Token", async function () {
  const { viem, networkHelpers } = await network.connect();

  it("transfer works", async function () {
    const { token, alice, bob } = await networkHelpers.loadFixture(deployTokenFixture);

    await token.write.transfer([bob.account.address, 50n], {
      account: alice.account,
    });

    assert.equal(await token.read.balanceOf([bob.account.address]), 50n);
  });

  it("another test with fresh state", async function () {
    const { token } = await networkHelpers.loadFixture(deployTokenFixture);
    // フィクスチャのスナップショットから復元された新鮮な状態
  });
});
```

`loadFixture` は最初の呼び出し時にフィクスチャを実行してスナップショットを取得し、
以降の呼び出しではスナップショットからリセットするため、再デプロイより高速。

## イベントテスト

### emitWithArgs
```typescript
await viem.assertions.emitWithArgs(
  counter.write.inc(),            // トランザクション
  counter,                        // コントラクト
  "Increment",                    // イベント名
  [1n],                           // 期待する引数
);
```

### イベント取得（手動）
```typescript
const publicClient = await viem.getPublicClient();
const events = await publicClient.getContractEvents({
  address: counter.address,
  abi: counter.abi,
  eventName: "Increment",
  fromBlock: deploymentBlockNumber,
  strict: true,
});

let total = 0n;
for (const event of events) {
  total += event.args.by;
}
assert.equal(total, await counter.read.x());
```

## リバートテスト

### revertWith
```typescript
await viem.assertions.revertWith(
  token.write.transfer([bob, 200n], { account: alice }),
  "Insufficient balance",
);
```

### アカウント偽装との組み合わせ
```typescript
const nonOwner = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
await networkHelpers.impersonateAccount(nonOwner);
await networkHelpers.setBalance(nonOwner, 10n ** 18n);

await viem.assertions.revertWith(
  contract.write.adminOnly({ account: nonOwner }),
  "Not authorized",
);
```

## Network Helpers

```typescript
const { networkHelpers } = await network.connect();

// アカウント偽装
await networkHelpers.impersonateAccount(address);
await networkHelpers.stopImpersonatingAccount(address);

// 残高設定
await networkHelpers.setBalance(address, amount);

// 時間操作
await networkHelpers.time.increase(3600); // 1時間進める
await networkHelpers.time.increaseTo(timestamp);
await networkHelpers.time.setNextBlockTimestamp(timestamp);

// ブロック操作
await networkHelpers.mine();          // 1ブロックマイニング
await networkHelpers.mine(10);        // 10ブロックマイニング

// フィクスチャ
await networkHelpers.loadFixture(fn);

// スナップショット
const snapshot = await networkHelpers.takeSnapshot();
await snapshot.restore();

// ストレージ操作
await networkHelpers.setStorageAt(address, slot, value);
```

## マルチチェーンテスト

```typescript
// テスト内でチェーンタイプを指定
const { viem } = await network.connect({ chainType: "op" });

// コマンドラインで指定
// npx hardhat test nodejs --chain-type op
```

## Viem ユーティリティとの併用

```typescript
import { parseEther, formatEther, keccak256, encodeFunctionData } from "viem";

const amount = parseEther("1.5");
const hash = keccak256("0x1234");
```

## テスト実行

```bash
npx hardhat test              # 全テスト
npx hardhat test nodejs       # TypeScriptテストのみ
npx hardhat test test/Token.ts # 特定ファイル
npx hardhat test --coverage   # カバレッジ付き
```

## Ethers.js + Mochaパターン（代替）

新規プロジェクトではViem + node:testを推奨するが、Ethers.js + Mochaも使用可能：

```bash
npm add --save-dev @nomicfoundation/hardhat-toolbox-mocha-ethers
```

```typescript
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],
});
```
