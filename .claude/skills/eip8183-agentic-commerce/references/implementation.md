# ERC-8183 リファレンス実装詳細

## コントラクト構成

```
contracts/
├── interfaces/
│   ├── IAgenticCommerce.sol    # メインインターフェース
│   └── IACPHook.sol            # Hook拡張インターフェース
├── AgenticCommerce.sol         # メイン実装（UUPSUpgradeable）
├── hooks/
│   ├── ReputationGateHook.sol  # ERC-8004連携Hook
│   ├── BiddingHook.sol         # 入札マーケットHook
│   └── ZKVerifierHook.sol      # ZK検証Hook
└── evaluators/
    ├── SelfEvaluator.sol       # Client自己評価
    └── MultiSigEvaluator.sol   # マルチシグ評価
```

## IAgenticCommerce インターフェース

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum JobStatus {
    Open,
    Funded,
    Submitted,
    Completed,
    Rejected,
    Expired
}

struct Job {
    uint256 id;
    address client;
    address provider;
    address evaluator;
    string  description;
    uint256 budget;
    uint256 expiredAt;
    JobStatus status;
    address hook;
}

interface IAgenticCommerce {
    // Events
    event JobCreated(uint256 indexed jobId, address client, address provider,
        address evaluator, uint256 expiredAt);
    event ProviderSet(uint256 indexed jobId, address provider);
    event BudgetSet(uint256 indexed jobId, uint256 amount);
    event JobFunded(uint256 indexed jobId, address client, uint256 amount);
    event JobSubmitted(uint256 indexed jobId, address provider, bytes32 deliverable);
    event JobCompleted(uint256 indexed jobId, address evaluator, bytes32 reason);
    event JobRejected(uint256 indexed jobId, address rejector, bytes32 reason);
    event JobExpired(uint256 indexed jobId);
    event PaymentReleased(uint256 indexed jobId, address provider, uint256 amount);
    event Refunded(uint256 indexed jobId, address client, uint256 amount);

    // Core functions
    function createJob(address provider, address evaluator, uint256 expiredAt,
        string calldata description, address hook) external returns (uint256 jobId);
    function setProvider(uint256 jobId, address provider, bytes calldata optParams) external;
    function setBudget(uint256 jobId, uint256 amount, bytes calldata optParams) external;
    function fund(uint256 jobId, uint256 expectedBudget, bytes calldata optParams) external;
    function submit(uint256 jobId, bytes32 deliverable, bytes calldata optParams) external;
    function complete(uint256 jobId, bytes32 reason, bytes calldata optParams) external;
    function reject(uint256 jobId, bytes32 reason, bytes calldata optParams) external;
    function claimRefund(uint256 jobId) external;

    // View functions
    function getJob(uint256 jobId) external view returns (Job memory);
    function jobCounter() external view returns (uint256);
}
```

## IACPHook インターフェース

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IACPHook {
    /// @notice Hookable関数の実行前に呼ばれる。revertでアクションをブロック可能。
    /// @param jobId ジョブID
    /// @param selector 実行される関数のセレクタ（bytes4）
    /// @param data 関数固有のエンコードデータ
    function beforeAction(uint256 jobId, bytes4 selector, bytes calldata data) external;

    /// @notice Hookable関数の実行後に呼ばれる。revertでトランザクション全体をロールバック。
    function afterAction(uint256 jobId, bytes4 selector, bytes calldata data) external;
}
```

## メイン実装

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IAgenticCommerce.sol";
import "./interfaces/IACPHook.sol";

contract AgenticCommerce is
    IAgenticCommerce,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuardTransient
{
    using SafeERC20 for IERC20;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    IERC20 public paymentToken;
    uint256 public override jobCounter;
    mapping(uint256 => Job) private _jobs;

    // Fee configuration (basis points, 10000 = 100%)
    uint256 public platformFeeBps;
    uint256 public evaluatorFeeBps;
    address public treasury;

    // Hook whitelist
    mapping(address => bool) public whitelistedHooks;

    // Errors
    error InvalidEvaluator();
    error InvalidProvider();
    error InvalidStatus(JobStatus expected, JobStatus actual);
    error Unauthorized();
    error BudgetMismatch(uint256 expected, uint256 actual);
    error JobNotExpired();
    error HookNotWhitelisted();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _paymentToken,
        address _admin,
        address _treasury,
        uint256 _platformFeeBps,
        uint256 _evaluatorFeeBps
    ) external initializer {
        __UUPSUpgradeable_init();
        __AccessControl_init();

        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
        platformFeeBps = _platformFeeBps;
        evaluatorFeeBps = _evaluatorFeeBps;

        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);

        // address(0) is always whitelisted (no-hook jobs)
        whitelistedHooks[address(0)] = true;
    }

    // ═══════════════════════════════════════════
    //  Core Functions
    // ═══════════════════════════════════════════

    function createJob(
        address provider,
        address evaluator,
        uint256 expiredAt,
        string calldata description,
        address hook
    ) external returns (uint256 jobId) {
        if (evaluator == address(0)) revert InvalidEvaluator();
        if (!whitelistedHooks[hook]) revert HookNotWhitelisted();

        jobId = jobCounter++;
        _jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            description: description,
            budget: 0,
            expiredAt: expiredAt,
            status: JobStatus.Open,
            hook: hook
        });

        emit JobCreated(jobId, msg.sender, provider, evaluator, expiredAt);
    }

    function setProvider(
        uint256 jobId,
        address provider,
        bytes calldata optParams
    ) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (msg.sender != job.client) revert Unauthorized();
        if (job.status != JobStatus.Open) revert InvalidStatus(JobStatus.Open, job.status);
        if (provider == address(0)) revert InvalidProvider();
        if (job.provider != address(0)) revert InvalidProvider(); // already set

        _executeHook(job, this.setProvider.selector,
            abi.encode(provider, optParams), true);

        job.provider = provider;

        _executeHook(job, this.setProvider.selector,
            abi.encode(provider, optParams), false);

        emit ProviderSet(jobId, provider);
    }

    function setBudget(
        uint256 jobId,
        uint256 amount,
        bytes calldata optParams
    ) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (msg.sender != job.client && msg.sender != job.provider)
            revert Unauthorized();
        if (job.status != JobStatus.Open) revert InvalidStatus(JobStatus.Open, job.status);

        _executeHook(job, this.setBudget.selector,
            abi.encode(amount, optParams), true);

        job.budget = amount;

        _executeHook(job, this.setBudget.selector,
            abi.encode(amount, optParams), false);

        emit BudgetSet(jobId, amount);
    }

    function fund(
        uint256 jobId,
        uint256 expectedBudget,
        bytes calldata optParams
    ) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (msg.sender != job.client) revert Unauthorized();
        if (job.status != JobStatus.Open) revert InvalidStatus(JobStatus.Open, job.status);
        if (job.provider == address(0)) revert InvalidProvider();
        if (job.budget != expectedBudget) revert BudgetMismatch(expectedBudget, job.budget);

        _executeHook(job, this.fund.selector, optParams, true);

        paymentToken.safeTransferFrom(msg.sender, address(this), job.budget);
        job.status = JobStatus.Funded;

        _executeHook(job, this.fund.selector, optParams, false);

        emit JobFunded(jobId, msg.sender, job.budget);
    }

    function submit(
        uint256 jobId,
        bytes32 deliverable,
        bytes calldata optParams
    ) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (msg.sender != job.provider) revert Unauthorized();
        if (job.status != JobStatus.Funded)
            revert InvalidStatus(JobStatus.Funded, job.status);

        _executeHook(job, this.submit.selector,
            abi.encode(deliverable, optParams), true);

        job.status = JobStatus.Submitted;

        _executeHook(job, this.submit.selector,
            abi.encode(deliverable, optParams), false);

        emit JobSubmitted(jobId, msg.sender, deliverable);
    }

    function complete(
        uint256 jobId,
        bytes32 reason,
        bytes calldata optParams
    ) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (msg.sender != job.evaluator) revert Unauthorized();
        if (job.status != JobStatus.Submitted)
            revert InvalidStatus(JobStatus.Submitted, job.status);

        _executeHook(job, this.complete.selector,
            abi.encode(reason, optParams), true);

        job.status = JobStatus.Completed;

        // Calculate fees
        uint256 platformFee = (job.budget * platformFeeBps) / 10000;
        uint256 evalFee = (job.budget * evaluatorFeeBps) / 10000;
        uint256 providerPayment = job.budget - platformFee - evalFee;

        // Transfer payments
        if (platformFee > 0) {
            paymentToken.safeTransfer(treasury, platformFee);
        }
        if (evalFee > 0) {
            paymentToken.safeTransfer(job.evaluator, evalFee);
        }
        paymentToken.safeTransfer(job.provider, providerPayment);

        _executeHook(job, this.complete.selector,
            abi.encode(reason, optParams), false);

        emit JobCompleted(jobId, msg.sender, reason);
        emit PaymentReleased(jobId, job.provider, providerPayment);
    }

    function reject(
        uint256 jobId,
        bytes32 reason,
        bytes calldata optParams
    ) external nonReentrant {
        Job storage job = _jobs[jobId];

        // Client can reject in Open state
        // Evaluator can reject in Funded or Submitted state
        if (job.status == JobStatus.Open) {
            if (msg.sender != job.client) revert Unauthorized();
        } else if (job.status == JobStatus.Funded || job.status == JobStatus.Submitted) {
            if (msg.sender != job.evaluator) revert Unauthorized();
        } else {
            revert InvalidStatus(JobStatus.Open, job.status);
        }

        _executeHook(job, this.reject.selector,
            abi.encode(reason, optParams), true);

        bool needsRefund = job.status == JobStatus.Funded
            || job.status == JobStatus.Submitted;
        job.status = JobStatus.Rejected;

        if (needsRefund) {
            paymentToken.safeTransfer(job.client, job.budget);
            emit Refunded(jobId, job.client, job.budget);
        }

        _executeHook(job, this.reject.selector,
            abi.encode(reason, optParams), false);

        emit JobRejected(jobId, msg.sender, reason);
    }

    /// @notice パーミッションレス。タイムアウト後に誰でも呼べる安全弁。
    /// @dev Hookは意図的に非対応（悪意あるHookによるロック防止）。
    function claimRefund(uint256 jobId) external nonReentrant {
        Job storage job = _jobs[jobId];
        if (job.status != JobStatus.Funded && job.status != JobStatus.Submitted)
            revert InvalidStatus(JobStatus.Funded, job.status);
        if (block.timestamp < job.expiredAt) revert JobNotExpired();

        job.status = JobStatus.Expired;
        paymentToken.safeTransfer(job.client, job.budget);

        emit JobExpired(jobId);
        emit Refunded(jobId, job.client, job.budget);
    }

    // ═══════════════════════════════════════════
    //  View Functions
    // ═══════════════════════════════════════════

    function getJob(uint256 jobId) external view returns (Job memory) {
        return _jobs[jobId];
    }

    // ═══════════════════════════════════════════
    //  Internal
    // ═══════════════════════════════════════════

    function _executeHook(
        Job storage job,
        bytes4 selector,
        bytes memory data,
        bool isBefore
    ) internal {
        if (job.hook == address(0)) return;

        if (isBefore) {
            IACPHook(job.hook).beforeAction(job.id, selector, data);
        } else {
            IACPHook(job.hook).afterAction(job.id, selector, data);
        }
    }

    // ═══════════════════════════════════════════
    //  Admin
    // ═══════════════════════════════════════════

    function setWhitelistedHook(address hook, bool status)
        external onlyRole(ADMIN_ROLE) {
        whitelistedHooks[hook] = status;
    }

    function setFees(uint256 _platformFeeBps, uint256 _evaluatorFeeBps)
        external onlyRole(ADMIN_ROLE) {
        require(_platformFeeBps + _evaluatorFeeBps <= 5000, "Max 50% fees");
        platformFeeBps = _platformFeeBps;
        evaluatorFeeBps = _evaluatorFeeBps;
    }

    function _authorizeUpgrade(address newImplementation)
        internal override onlyRole(ADMIN_ROLE) {}
}
```

## テストパターン

### Foundry（Solidity）テスト

```solidity
// test/AgenticCommerce.t.sol
import { Test } from "forge-std/Test.sol";
import { AgenticCommerce } from "../contracts/AgenticCommerce.sol";
import { ERC20Mock } from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract AgenticCommerceTest is Test {
    AgenticCommerce acp;
    ERC20Mock token;
    address client = makeAddr("client");
    address provider = makeAddr("provider");
    address evaluator = makeAddr("evaluator");

    function setUp() public {
        token = new ERC20Mock();
        // Deploy proxy + initialize
        acp = new AgenticCommerce();
        acp.initialize(
            address(token), address(this), address(this), 250, 100
        );
        // Fund client
        token.mint(client, 1000e18);
        vm.prank(client);
        token.approve(address(acp), type(uint256).max);
    }

    function test_FullLifecycle() public {
        // Create
        vm.prank(client);
        uint256 jobId = acp.createJob(
            provider, evaluator,
            block.timestamp + 1 days,
            "Analyze DeFi data", address(0)
        );

        // Set budget
        vm.prank(client);
        acp.setBudget(jobId, 100e18, "");

        // Fund
        vm.prank(client);
        acp.fund(jobId, 100e18, "");

        // Submit
        vm.prank(provider);
        acp.submit(jobId, keccak256("ipfs://deliverable"), "");

        // Complete
        vm.prank(evaluator);
        acp.complete(jobId, keccak256("approved"), "");

        // Verify payment (minus fees)
        assertGt(token.balanceOf(provider), 0);
    }

    function test_RejectRefund() public {
        vm.startPrank(client);
        uint256 jobId = acp.createJob(
            provider, evaluator,
            block.timestamp + 1 days, "Task", address(0)
        );
        acp.setBudget(jobId, 50e18, "");
        acp.fund(jobId, 50e18, "");
        vm.stopPrank();

        uint256 balBefore = token.balanceOf(client);
        vm.prank(evaluator);
        acp.reject(jobId, keccak256("quality issue"), "");
        assertEq(token.balanceOf(client), balBefore + 50e18);
    }

    function test_ClaimRefundAfterExpiry() public {
        vm.startPrank(client);
        uint256 jobId = acp.createJob(
            provider, evaluator,
            block.timestamp + 1 hours, "Task", address(0)
        );
        acp.setBudget(jobId, 50e18, "");
        acp.fund(jobId, 50e18, "");
        vm.stopPrank();

        // Warp past expiry
        vm.warp(block.timestamp + 2 hours);

        // Anyone can claim refund
        acp.claimRefund(jobId);
        assertEq(uint8(acp.getJob(jobId).status), uint8(JobStatus.Expired));
    }

    function testFuzz_BudgetMismatchReverts(uint256 wrongBudget) public {
        vm.assume(wrongBudget != 100e18);
        vm.startPrank(client);
        uint256 jobId = acp.createJob(
            provider, evaluator,
            block.timestamp + 1 days, "Task", address(0)
        );
        acp.setBudget(jobId, 100e18, "");
        vm.expectRevert();
        acp.fund(jobId, wrongBudget, "");
        vm.stopPrank();
    }
}
```

### Hardhat 3（TypeScript/Viem）テスト

```typescript
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("AgenticCommerce", async function () {
  const { viem, networkHelpers } = await network.connect();

  async function deployFixture() {
    const token = await viem.deployContract("ERC20Mock");
    const acp = await viem.deployContract("AgenticCommerce");
    // initialize...
    const [client, provider, evaluator] = await viem.getWalletClients();
    return { token, acp, client, provider, evaluator };
  }

  it("full lifecycle", async function () {
    const { acp, token, client, provider, evaluator } =
      await networkHelpers.loadFixture(deployFixture);

    // Create job
    const jobId = await acp.write.createJob([
      provider.account.address,
      evaluator.account.address,
      BigInt(Math.floor(Date.now() / 1000) + 86400),
      "Analyze DeFi data",
      "0x0000000000000000000000000000000000000000",
    ], { account: client.account });

    // ... fund, submit, complete ...
  });
});
```

## Hardhat Ignition デプロイモジュール

```typescript
// ignition/modules/AgenticCommerce.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("AgenticCommerceModule", (m) => {
  const admin = m.getAccount(0);
  const paymentToken = m.getParameter("paymentToken");
  const treasury = m.getParameter("treasury", admin);
  const platformFeeBps = m.getParameter("platformFeeBps", 250n); // 2.5%
  const evaluatorFeeBps = m.getParameter("evaluatorFeeBps", 100n); // 1%

  // Deploy implementation
  const impl = m.contract("AgenticCommerce");

  // Deploy proxy
  const initData = m.encodeFunctionCall(impl, "initialize", [
    paymentToken, admin, treasury, platformFeeBps, evaluatorFeeBps,
  ]);

  const proxy = m.contract("ERC1967Proxy", [impl, initData]);

  return { proxy, impl };
});
```
