# Hardhat 2 → Hardhat 3 完全移行ガイド

## 前提条件

- Node.js v22.10.0以上（必須）

## 移行手順

### ステップ1: クリーンアップ
```bash
npx hardhat clean
```

### ステップ2: Hardhat 2パッケージの全削除
```bash
# 以下のパッケージをすべてアンインストール
npm uninstall hardhat
npm uninstall $(npm ls --depth=0 --json | node -e "
  const deps = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).dependencies;
  console.log(Object.keys(deps).filter(k =>
    k.startsWith('@nomicfoundation/') ||
    k.startsWith('@nomiclabs/') ||
    k.startsWith('hardhat-') ||
    k === 'solidity-coverage' ||
    k === 'hardhat-gas-reporter'
  ).join(' '));
")
```

確認:
```bash
npm why hardhat
# 結果が空になるまで繰り返す
```

### ステップ3: ESM化
```bash
# package.jsonにtype: moduleを追加
npm pkg set type=module

# 既存の設定ファイルをバックアップ
mv hardhat.config.js hardhat.config.old.js
# または
mv hardhat.config.ts hardhat.config.old.ts
```

### ステップ4: tsconfig.json更新
```json
{
  "compilerOptions": {
    "module": "node16",
    "moduleResolution": "node16",
    "target": "es2022",
    "esModuleInterop": true,
    "strict": true
  }
}
```

### ステップ5: Hardhat 3インストール
```bash
npm add --save-dev hardhat
```

### ステップ6: 新しい設定ファイル作成

最小構成:
```typescript
// hardhat.config.ts
import { defineConfig } from "hardhat/config";

export default defineConfig({});
```

既存設定の移行:
```typescript
import { defineConfig, configVariable } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
// または Mocha + Ethers を使い続ける場合
// import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: {
    // v2のsolidity設定はほぼそのまま使える
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    sepolia: {
      type: "http",                              // ← 新規: type指定が必要
      chainType: "l1",                           // ← 新規: チェーンタイプ
      url: configVariable("SEPOLIA_RPC_URL"),    // ← configVariableを使用
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
});
```

### ステップ7: テストの移行

#### Ethers.js → Viemへの移行（推奨）

**Before (Hardhat 2 + Ethers):**
```typescript
import { ethers } from "hardhat";
import { expect } from "chai";

describe("Counter", function () {
  it("should increment", async function () {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.inc();
    expect(await counter.x()).to.equal(1);
  });
});
```

**After (Hardhat 3 + Viem):**
```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("Counter", async function () {
  const { viem } = await network.connect();

  it("should increment", async function () {
    const counter = await viem.deployContract("Counter");
    await counter.write.inc();
    assert.equal(await counter.read.x(), 1n);
  });
});
```

#### 主な違い
| Hardhat 2 (Ethers) | Hardhat 3 (Viem) |
|---------------------|-------------------|
| `ethers.getContractFactory()` | `viem.deployContract()` |
| `contract.methodName()` | `contract.read.methodName()` / `contract.write.methodName()` |
| `ethers.getSigners()` | `viem.getWalletClients()` |
| `expect().to.equal()` (Chai) | `assert.equal()` (node:assert) |
| 数値は `BigNumber` | 数値は `bigint` (例: `1n`) |
| `await contract.deployed()` | 不要（deployContractが完了を待つ） |
| `hre.ethers` | `const { viem } = await network.connect()` |

#### Mocha + Ethersを使い続ける場合
```bash
npm add --save-dev @nomicfoundation/hardhat-toolbox-mocha-ethers
```

テストの書き方はv2に近いが、ネットワーク接続は明示的に行う必要がある。

### ステップ8: タスクの移行

**Before (Hardhat 2):**
```javascript
task("accounts", "Prints accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
```

**After (Hardhat 3):**
```typescript
import { task } from "hardhat/config";

const printAccounts = task("accounts", "Print accounts")
  .setInlineAction(async (taskArgs, hre) => {
    const { provider } = await hre.network.connect();
    const accounts = await provider.request({
      method: "eth_accounts",
    });
    for (const account of accounts) {
      console.log(account);
    }
  })
  .build();

export default defineConfig({
  tasks: [printAccounts],
  // ...
});
```

### ステップ9: スクリプトの移行

**Before:**
```javascript
const { ethers } = require("hardhat");
```

**After:**
```typescript
import { network } from "hardhat";
const { viem } = await network.connect();
```

## 主な破壊的変更まとめ

| 項目 | Hardhat 2 | Hardhat 3 |
|------|-----------|-----------|
| モジュールシステム | CommonJS | ESM |
| 設定方式 | 副作用ベース | 宣言的 (`defineConfig`) |
| プラグイン登録 | `import "plugin"` | `plugins: [plugin]` |
| コンパイル | `npx hardhat compile` | `npx hardhat build` |
| 初期化 | `npx hardhat init` | `npx hardhat --init` |
| ネットワーク | シングルトン | 明示的接続 (`network.connect()`) |
| 拡張 | `extendConfig`/`extendEnvironment` | フックシステム |
| テストランナー | Mocha（組み込み） | プラグインで選択 |
| 接続ライブラリ | Ethers.js | Viem推奨（Ethersも可） |
| 型 | TypeChain | 型付きアーティファクト（自動） |
| Node.js | v18+ | v22+ |

## 段階的移行のコツ

1. まず設定ファイルだけ移行し、`npx hardhat build`が通ることを確認
2. テストを1ファイルずつ移行: `npx hardhat test test/specific-test.ts`
3. 全テストが通ったらタスクとスクリプトを移行
4. 最後にCI/CDパイプラインを更新

## 移行ブロッカー

特定のプラグインやAPIがv3に対応していない場合は、
[GitHub Issues](https://github.com/NomicFoundation/hardhat/issues) で報告する。
