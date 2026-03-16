# Hardhat Ignition デプロイ詳細ガイド

## 概要

Hardhat Ignitionは宣言的なスマートコントラクトデプロイシステム。
モジュールでデプロイ手順を定義し、Ignitionが依存関係の解決、並列実行、
エラーリカバリ、状態管理を自動で行う。

## モジュールの基本

```typescript
// ignition/modules/MyModule.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyModule", (m) => {
  // コントラクトデプロイ
  const myContract = m.contract("MyContract");

  // コンストラクタ引数あり
  const token = m.contract("Token", ["MyToken", "MTK", 1000n]);

  // デプロイ後のコール
  m.call(token, "mint", [m.getAccount(0), 500n]);

  // 戻り値でエクスポート
  return { myContract, token };
});
```

## モジュールAPI

### m.contract() — コントラクトデプロイ
```typescript
// 基本
const contract = m.contract("ContractName");

// コンストラクタ引数
const contract = m.contract("ContractName", [arg1, arg2]);

// オプション
const contract = m.contract("ContractName", [arg1], {
  id: "unique-id",           // モジュール内のユニークID
  value: 1000000000000000000n, // ETH送付
  from: m.getAccount(1),     // デプロイヤー
  after: [otherContract],    // 依存関係
  libraries: { Lib: lib },   // ライブラリリンク
});
```

### m.contractAt() — 既存コントラクトへの接続
```typescript
const existing = m.contractAt("MyContract", "0x1234...");
const proxied = m.contractAt("MyContract", proxy); // プロキシ経由
```

### m.call() — コントラクト関数コール
```typescript
m.call(contract, "methodName", [arg1, arg2]);

m.call(contract, "methodName", [arg1], {
  id: "unique-call-id",
  value: 1000n,
  from: m.getAccount(0),
  after: [otherAction],
});
```

### m.staticCall() — view関数コール
```typescript
const result = m.staticCall(contract, "getValue");
```

### m.readEventArgument() — イベント引数の読み取り
```typescript
const address = m.readEventArgument(
  deployTx,       // コントラクトまたはコール結果
  "EventName",    // イベント名
  "argName",      // 引数名
);
```

### m.getAccount() — アカウント取得
```typescript
const deployer = m.getAccount(0);
const secondAccount = m.getAccount(1);
```

### m.getParameter() — パラメータ化
```typescript
const initialSupply = m.getParameter("initialSupply", 1000n);
const contract = m.contract("Token", [initialSupply]);
```

### m.useModule() — モジュール間依存
```typescript
import BaseModule from "./BaseModule.js";

export default buildModule("ExtendedModule", (m) => {
  const { token } = m.useModule(BaseModule);
  const staking = m.contract("Staking", [token]);
  return { staking };
});
```

### m.encodeFunctionCall() — 関数コールのエンコード
```typescript
const encoded = m.encodeFunctionCall(contract, "initialize", [arg1]);
```

## プロキシ/アップグレーダブルパターン

### TransparentUpgradeableProxy
```typescript
const proxyModule = buildModule("ProxyModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);

  // 実装コントラクト
  const impl = m.contract("MyContract");

  // プロキシデプロイ
  const proxy = m.contract("TransparentUpgradeableProxy", [
    impl,
    proxyAdminOwner,
    "0x", // initializer data（空 = initialize不要）
  ]);

  // ProxyAdminアドレスを取得
  const proxyAdminAddress = m.readEventArgument(
    proxy, "AdminChanged", "newAdmin",
  );
  const proxyAdmin = m.contractAt("ProxyAdmin", proxyAdminAddress);

  return { proxyAdmin, proxy };
});

// プロキシ経由でアクセス
const demoModule = buildModule("DemoModule", (m) => {
  const { proxy, proxyAdmin } = m.useModule(proxyModule);
  const demo = m.contractAt("MyContract", proxy);
  return { demo, proxy, proxyAdmin };
});
```

### アップグレード
```typescript
const upgradeModule = buildModule("UpgradeModule", (m) => {
  const proxyAdminOwner = m.getAccount(0);
  const { proxyAdmin, proxy } = m.useModule(proxyModule);

  // 新しい実装
  const implV2 = m.contract("MyContractV2");

  // initializerのエンコード
  const encoded = m.encodeFunctionCall(implV2, "initializeV2", [arg1]);

  // アップグレード実行
  m.call(proxyAdmin, "upgradeAndCall", [proxy, implV2, encoded], {
    from: proxyAdminOwner,
  });

  return { proxyAdmin, proxy };
});
```

## ライブラリのリンク

```typescript
const lib = m.library("MathLib");
const contract = m.contract("MyContract", [], {
  libraries: { MathLib: lib },
});
```

## デプロイコマンド

```bash
# ローカル（一時的なシミュレーション）
npx hardhat ignition deploy ignition/modules/MyModule.ts

# 永続的ローカルノード
npx hardhat node  # Terminal 1
npx hardhat ignition deploy ignition/modules/MyModule.ts --network localhost  # Terminal 2

# テストネット
npx hardhat ignition deploy ignition/modules/MyModule.ts --network sepolia

# パラメータ付き
npx hardhat ignition deploy ignition/modules/MyModule.ts \
  --network sepolia \
  --parameters '{"MyModule": {"initialSupply": 1000000}}'

# デプロイ状態のリセット
npx hardhat ignition deploy ignition/modules/MyModule.ts --reset
```

## テストでのIgnition使用

```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import hre from "hardhat";
import MyModule from "../ignition/modules/MyModule.js";

describe("MyModule", async function () {
  const { ignition, viem } = await hre.network.connect();

  it("deploys correctly", async function () {
    const { myContract } = await ignition.deploy(MyModule);
    assert.equal(await myContract.read.owner(), /* expected */);
  });

  it("with parameters", async function () {
    const { token } = await ignition.deploy(MyModule, {
      parameters: {
        MyModule: { initialSupply: 5000n },
      },
    });
  });
});
```

## デプロイ状態管理

Ignitionはデプロイ状態を `ignition/deployments/` に保存。
同じモジュールを再デプロイすると、既に完了したステップはスキップされる。

```
ignition/
├── modules/          # デプロイモジュール定義
└── deployments/      # デプロイ状態（自動管理）
    └── chain-11155111/  # チェーンID別
        └── MyModule/
```

## コントラクト検証

デプロイ後にEtherscanで検証：
```bash
npx hardhat verify --network sepolia <contract-address> [constructor-args...]
```

hardhat-verifyプラグインを使用：
```typescript
import hardhatVerify from "@nomicfoundation/hardhat-verify";

export default defineConfig({
  plugins: [hardhatToolboxViem], // toolboxに含まれている
  // または個別に
  // plugins: [hardhatVerify],
});
```
