# ERC-8004 マルチチェーンデプロイ情報

## デプロイ済みネットワーク（35+チェーン）

CREATE2（SingletonFactory）により全チェーンで同一アドレスにデプロイ。

### メインネット

| チェーン | タイプ | 推奨用途 | 特徴 |
|---------|--------|---------|------|
| Ethereum | L1 | 高価値Agent、最高セキュリティ | 最大のセキュリティ保証 |
| Base | L2 (OP Stack) | 一般的なAgent登録 | Coinbase連携、低コスト |
| Arbitrum One | L2 (Optimistic) | 一般的なAgent登録 | 高スループット |
| Optimism | L2 (OP Stack) | OP Stack連携 | Superchain互換 |
| Polygon | L2 | 高頻度フィードバック | 超低コスト |
| BSC | L1 | アジア市場Agent | 高速・低コスト |
| Scroll | L2 (zkEVM) | ZK検証連携 | zkEVM互換 |
| Linea | L2 (zkEVM) | ConsenSys連携 | zkEVM |
| Mantle | L2 | BitDAO連携 | モジュラーDA |
| Metis | L2 | 分散型シーケンサー | コミュニティ運営 |
| Monad | L1 | 高スループットAgent | 並列EVM |
| Taiko | L2 (Based Rollup) | 最大分散性 | Based Rollup |
| Abstract | L2 | コンシューマーAgent | Account Abstraction |
| Celo | L1 | モバイルAgent | モバイルファースト |

### テストネット

| チェーン | ネットワーク | 用途 |
|---------|------------|------|
| Ethereum | Sepolia | 開発・テスト |
| Base | Sepolia | 開発・テスト |
| Arbitrum | Sepolia | 開発・テスト |
| Optimism | Sepolia | 開発・テスト |

## デプロイ手順

### 1. Hardhat設定

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    base: {
      url: process.env.BASE_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
    },
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY!],
    },
    // ... 他のチェーン
  },
};

export default config;
```

### 2. CREATE2デプロイスクリプト

```typescript
// scripts/deploy-singleton.ts
import { ethers } from "hardhat";

const SINGLETON_FACTORY = "0xce0042B868300000d44A59004Da54A005ffdcf9f";

async function deploySingleton(
  bytecode: string,
  salt: string
): Promise<string> {
  const [deployer] = await ethers.getSigners();
  const factory = new ethers.Contract(
    SINGLETON_FACTORY,
    ["function deploy(bytes memory _initCode, bytes32 _salt) public returns (address)"],
    deployer
  );

  const tx = await factory.deploy(bytecode, salt);
  const receipt = await tx.wait();

  // 予測アドレスの計算
  const predictedAddress = ethers.getCreate2Address(
    SINGLETON_FACTORY,
    salt,
    ethers.keccak256(bytecode)
  );

  console.log(`Deployed to: ${predictedAddress}`);
  return predictedAddress;
}
```

### 3. UUPS Proxy デプロイ

```typescript
// scripts/deploy-proxies.ts
import { ethers, upgrades } from "hardhat";

async function deployAll() {
  // Identity Registry
  const IdentityRegistry = await ethers.getContractFactory(
    "IdentityRegistryUpgradeable"
  );
  const identity = await upgrades.deployProxy(
    IdentityRegistry,
    [],
    { initializer: "initialize", kind: "uups" }
  );
  await identity.waitForDeployment();
  console.log("IdentityRegistry:", await identity.getAddress());

  // Reputation Registry
  const ReputationRegistry = await ethers.getContractFactory(
    "ReputationRegistryUpgradeable"
  );
  const reputation = await upgrades.deployProxy(
    ReputationRegistry,
    [await identity.getAddress()],
    { initializer: "initialize", kind: "uups" }
  );
  await reputation.waitForDeployment();
  console.log("ReputationRegistry:", await reputation.getAddress());

  // Validation Registry
  const ValidationRegistry = await ethers.getContractFactory(
    "ValidationRegistryUpgradeable"
  );
  const validation = await upgrades.deployProxy(
    ValidationRegistry,
    [await identity.getAddress()],
    { initializer: "initialize", kind: "uups" }
  );
  await validation.waitForDeployment();
  console.log("ValidationRegistry:", await validation.getAddress());
}

deployAll();
```

## コスト比較

| チェーン | Agent登録 | フィードバック | 検証リクエスト |
|---------|----------|--------------|-------------|
| Ethereum L1 | ~$15 | ~$12 | ~$10 |
| Base | ~$0.10 | ~$0.08 | ~$0.07 |
| Arbitrum | ~$0.08 | ~$0.06 | ~$0.05 |
| Polygon | ~$0.01 | ~$0.01 | ~$0.01 |

**推奨**: 開発・テストはSepoliaテストネット、プロダクションはBase/Arbitrum。
