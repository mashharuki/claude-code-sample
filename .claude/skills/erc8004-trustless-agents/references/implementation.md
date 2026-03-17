# ERC-8004 リファレンス実装詳細

## コントラクト構成

```
contracts/
├── IdentityRegistryUpgradeable.sol    # ERC-721 Agent ID + メタデータ
├── ReputationRegistryUpgradeable.sol  # フィードバック管理
├── ValidationRegistryUpgradeable.sol  # 検証リクエスト/レスポンス
├── ERC1967Proxy.sol                   # UUPSプロキシ
├── MinimalUUPS.sol                    # デプロイヘルパー
└── SingletonFactory.sol               # CREATE2デプロイ
```

## IdentityRegistryUpgradeable 完全実装

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";

contract IdentityRegistryUpgradeable is
    ERC721URIStorageUpgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    EIP712Upgradeable
{
    struct MetadataEntry {
        string metadataKey;
        bytes metadataValue;
    }

    /// @custom:storage-location erc7201:erc8004.identity.registry
    struct IdentityRegistryStorage {
        uint256 _lastId;
        mapping(uint256 => mapping(string => bytes)) _metadata;
    }

    bytes32 private constant IDENTITY_REGISTRY_STORAGE_LOCATION =
        0xa040f782729de4970518741823ec1276cbcd41a0c7493f62d173341566a04e00;

    function _getIdentityRegistryStorage()
        private pure returns (IdentityRegistryStorage storage $)
    {
        assembly { $.slot := IDENTITY_REGISTRY_STORAGE_LOCATION }
    }

    event Registered(uint256 indexed agentId, string agentURI, address indexed owner);
    event MetadataSet(uint256 indexed agentId, string indexed indexedMetadataKey,
        string metadataKey, bytes metadataValue);
    event URIUpdated(uint256 indexed agentId, string newURI, address indexed updatedBy);

    bytes32 private constant AGENT_WALLET_SET_TYPEHASH =
        keccak256("AgentWalletSet(uint256 agentId,address newWallet,address owner,uint256 deadline)");
    bytes4 private constant ERC1271_MAGICVALUE = 0x1626ba7e;
    uint256 private constant MAX_DEADLINE_DELAY = 5 minutes;
    bytes32 private constant RESERVED_AGENT_WALLET_KEY_HASH = keccak256("agentWallet");

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize() public reinitializer(2) onlyOwner {
        __ERC721_init("AgentIdentity", "AGENT");
        __ERC721URIStorage_init();
        __EIP712_init("ERC8004IdentityRegistry", "1");
    }

    // ═══════════════════════════════════════════
    //  Registration（3つのオーバーロード）
    // ═══════════════════════════════════════════

    function register() external returns (uint256 agentId) {
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        agentId = $._lastId++;
        $._metadata[agentId]["agentWallet"] = abi.encodePacked(msg.sender);
        _safeMint(msg.sender, agentId);
        emit Registered(agentId, "", msg.sender);
        emit MetadataSet(agentId, "agentWallet", "agentWallet",
            abi.encodePacked(msg.sender));
    }

    function register(string memory agentURI) external returns (uint256 agentId) {
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        agentId = $._lastId++;
        $._metadata[agentId]["agentWallet"] = abi.encodePacked(msg.sender);
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);
        emit Registered(agentId, agentURI, msg.sender);
        emit MetadataSet(agentId, "agentWallet", "agentWallet",
            abi.encodePacked(msg.sender));
    }

    function register(string memory agentURI, MetadataEntry[] memory metadata)
        external returns (uint256 agentId)
    {
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        agentId = $._lastId++;
        $._metadata[agentId]["agentWallet"] = abi.encodePacked(msg.sender);
        _safeMint(msg.sender, agentId);
        _setTokenURI(agentId, agentURI);
        emit Registered(agentId, agentURI, msg.sender);
        emit MetadataSet(agentId, "agentWallet", "agentWallet",
            abi.encodePacked(msg.sender));

        for (uint256 i; i < metadata.length; i++) {
            require(keccak256(bytes(metadata[i].metadataKey))
                != RESERVED_AGENT_WALLET_KEY_HASH, "reserved key");
            $._metadata[agentId][metadata[i].metadataKey] = metadata[i].metadataValue;
            emit MetadataSet(agentId, metadata[i].metadataKey,
                metadata[i].metadataKey, metadata[i].metadataValue);
        }
    }

    // ═══════════════════════════════════════════
    //  Metadata管理
    // ═══════════════════════════════════════════

    function getMetadata(uint256 agentId, string memory metadataKey)
        external view returns (bytes memory)
    {
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        return $._metadata[agentId][metadataKey];
    }

    function setMetadata(uint256 agentId, string memory metadataKey,
        bytes memory metadataValue) external
    {
        address agentOwner = _ownerOf(agentId);
        require(
            msg.sender == agentOwner ||
            isApprovedForAll(agentOwner, msg.sender) ||
            msg.sender == getApproved(agentId),
            "Not authorized"
        );
        require(keccak256(bytes(metadataKey))
            != RESERVED_AGENT_WALLET_KEY_HASH, "reserved key");
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        $._metadata[agentId][metadataKey] = metadataValue;
        emit MetadataSet(agentId, metadataKey, metadataKey, metadataValue);
    }

    function setAgentURI(uint256 agentId, string calldata newURI) external {
        address owner = ownerOf(agentId);
        require(
            msg.sender == owner ||
            isApprovedForAll(owner, msg.sender) ||
            msg.sender == getApproved(agentId),
            "Not authorized"
        );
        _setTokenURI(agentId, newURI);
        emit URIUpdated(agentId, newURI, msg.sender);
    }

    // ═══════════════════════════════════════════
    //  Agent Wallet管理（EIP-712署名検証）
    // ═══════════════════════════════════════════

    function getAgentWallet(uint256 agentId) external view returns (address) {
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        bytes memory walletData = $._metadata[agentId]["agentWallet"];
        return address(bytes20(walletData));
    }

    function setAgentWallet(
        uint256 agentId,
        address newWallet,
        uint256 deadline,
        bytes calldata signature
    ) external {
        address owner = ownerOf(agentId);
        require(
            msg.sender == owner ||
            isApprovedForAll(owner, msg.sender) ||
            msg.sender == getApproved(agentId),
            "Not authorized"
        );
        require(newWallet != address(0), "bad wallet");
        require(block.timestamp <= deadline, "expired");
        require(deadline <= block.timestamp + MAX_DEADLINE_DELAY, "deadline too far");

        bytes32 structHash = keccak256(abi.encode(
            AGENT_WALLET_SET_TYPEHASH, agentId, newWallet, owner, deadline
        ));
        bytes32 digest = _hashTypedDataV4(structHash);

        // ECDSA first（EOAs + EIP-7702）
        (address recovered, ECDSA.RecoverError err, ) =
            ECDSA.tryRecover(digest, signature);
        if (err != ECDSA.RecoverError.NoError || recovered != newWallet) {
            // ERC-1271 fallback（スマートコントラクトウォレット）
            (bool ok, bytes memory res) = newWallet.staticcall(
                abi.encodeCall(IERC1271.isValidSignature, (digest, signature))
            );
            require(ok && res.length >= 32
                && abi.decode(res, (bytes4)) == ERC1271_MAGICVALUE,
                "invalid wallet sig");
        }

        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        $._metadata[agentId]["agentWallet"] = abi.encodePacked(newWallet);
        emit MetadataSet(agentId, "agentWallet", "agentWallet",
            abi.encodePacked(newWallet));
    }

    function unsetAgentWallet(uint256 agentId) external {
        address owner = ownerOf(agentId);
        require(
            msg.sender == owner ||
            isApprovedForAll(owner, msg.sender) ||
            msg.sender == getApproved(agentId),
            "Not authorized"
        );
        IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
        $._metadata[agentId]["agentWallet"] = "";
        emit MetadataSet(agentId, "agentWallet", "agentWallet", "");
    }

    // ═══════════════════════════════════════════
    //  Internal / Upgrade
    // ═══════════════════════════════════════════

    /// @dev NFT転送時にagentWalletを自動クリア（CEIパターン）
    function _update(address to, uint256 tokenId, address auth)
        internal override returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            IdentityRegistryStorage storage $ = _getIdentityRegistryStorage();
            $._metadata[tokenId]["agentWallet"] = "";
            emit MetadataSet(tokenId, "agentWallet", "agentWallet", "");
        }
        return super._update(to, tokenId, auth);
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

## ReputationRegistryUpgradeable 完全実装

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IIdentityRegistry {
    function isAuthorizedOrOwner(address spender, uint256 agentId)
        external view returns (bool);
}

contract ReputationRegistryUpgradeable is OwnableUpgradeable, UUPSUpgradeable {
    int128 private constant MAX_ABS_VALUE = 1e38;

    event NewFeedback(
        uint256 indexed agentId, address indexed clientAddress,
        uint64 feedbackIndex, int128 value, uint8 valueDecimals,
        string indexed indexedTag1, string tag1, string tag2,
        string endpoint, string feedbackURI, bytes32 feedbackHash
    );
    event FeedbackRevoked(
        uint256 indexed agentId, address indexed clientAddress,
        uint64 indexed feedbackIndex
    );
    event ResponseAppended(
        uint256 indexed agentId, address indexed clientAddress,
        uint64 feedbackIndex, address indexed responder,
        string responseURI, bytes32 responseHash
    );

    struct Feedback {
        int128 value;
        uint8 valueDecimals;
        bool isRevoked;
        string tag1;
        string tag2;
    }

    address private _identityRegistry;

    /// @custom:storage-location erc7201:erc8004.reputation.registry
    struct ReputationRegistryStorage {
        mapping(uint256 => mapping(address => mapping(uint64 => Feedback))) _feedback;
        mapping(uint256 => mapping(address => uint64)) _lastIndex;
        mapping(uint256 => mapping(address => mapping(uint64 =>
            mapping(address => uint64)))) _responseCount;
        mapping(uint256 => mapping(address => mapping(uint64 =>
            address[]))) _responders;
        mapping(uint256 => mapping(address => mapping(uint64 =>
            mapping(address => bool)))) _responderExists;
        mapping(uint256 => address[]) _clients;
        mapping(uint256 => mapping(address => bool)) _clientExists;
    }

    bytes32 private constant REPUTATION_REGISTRY_STORAGE_LOCATION =
        0xa03d7693f2b3746b2d03f163c788147b71aa82854399a21fdf4de143ba778300;

    function _getReputationRegistryStorage()
        private pure returns (ReputationRegistryStorage storage $)
    {
        assembly { $.slot := REPUTATION_REGISTRY_STORAGE_LOCATION }
    }

    constructor() { _disableInitializers(); }

    function initialize(address identityRegistry_)
        public reinitializer(2) onlyOwner
    {
        require(identityRegistry_ != address(0), "bad identity");
        _identityRegistry = identityRegistry_;
    }

    function giveFeedback(
        uint256 agentId,
        int128 value,
        uint8 valueDecimals,
        string calldata tag1,
        string calldata tag2,
        string calldata endpoint,
        string calldata feedbackURI,
        bytes32 feedbackHash
    ) external {
        require(valueDecimals <= 18, "too many decimals");
        require(value >= -MAX_ABS_VALUE && value <= MAX_ABS_VALUE, "value too large");
        // セキュリティ: 自己フィードバック防止
        require(!IIdentityRegistry(_identityRegistry)
            .isAuthorizedOrOwner(msg.sender, agentId),
            "Self-feedback not allowed");

        ReputationRegistryStorage storage $ = _getReputationRegistryStorage();
        uint64 currentIndex = ++$._lastIndex[agentId][msg.sender];

        $._feedback[agentId][msg.sender][currentIndex] = Feedback({
            value: value,
            valueDecimals: valueDecimals,
            tag1: tag1,
            tag2: tag2,
            isRevoked: false
        });

        if (!$._clientExists[agentId][msg.sender]) {
            $._clients[agentId].push(msg.sender);
            $._clientExists[agentId][msg.sender] = true;
        }

        emit NewFeedback(agentId, msg.sender, currentIndex, value,
            valueDecimals, tag1, tag1, tag2, endpoint, feedbackURI, feedbackHash);
    }

    function revokeFeedback(uint256 agentId, uint64 feedbackIndex) external {
        require(feedbackIndex > 0, "index must be > 0");
        ReputationRegistryStorage storage $ = _getReputationRegistryStorage();
        require(feedbackIndex <= $._lastIndex[agentId][msg.sender],
            "index out of bounds");
        require(!$._feedback[agentId][msg.sender][feedbackIndex].isRevoked,
            "Already revoked");
        $._feedback[agentId][msg.sender][feedbackIndex].isRevoked = true;
        emit FeedbackRevoked(agentId, msg.sender, feedbackIndex);
    }

    function appendResponse(
        uint256 agentId,
        address clientAddress,
        uint64 feedbackIndex,
        string calldata responseURI,
        bytes32 responseHash
    ) external {
        require(feedbackIndex > 0, "index must be > 0");
        require(bytes(responseURI).length > 0, "Empty URI");
        ReputationRegistryStorage storage $ = _getReputationRegistryStorage();
        require(feedbackIndex <= $._lastIndex[agentId][clientAddress],
            "index out of bounds");

        if (!$._responderExists[agentId][clientAddress][feedbackIndex][msg.sender]) {
            $._responders[agentId][clientAddress][feedbackIndex].push(msg.sender);
            $._responderExists[agentId][clientAddress][feedbackIndex][msg.sender] = true;
        }
        $._responseCount[agentId][clientAddress][feedbackIndex][msg.sender]++;

        emit ResponseAppended(agentId, clientAddress, feedbackIndex,
            msg.sender, responseURI, responseHash);
    }

    // ═══════════════════════════════════════════
    //  Read Functions
    // ═══════════════════════════════════════════

    function getLastIndex(uint256 agentId, address clientAddress)
        external view returns (uint64)
    {
        return _getReputationRegistryStorage()._lastIndex[agentId][clientAddress];
    }

    function readFeedback(uint256 agentId, address clientAddress,
        uint64 feedbackIndex)
        external view returns (
            int128 value, uint8 valueDecimals,
            string memory tag1, string memory tag2, bool isRevoked
        )
    {
        ReputationRegistryStorage storage $ = _getReputationRegistryStorage();
        require(feedbackIndex > 0, "index must be > 0");
        require(feedbackIndex <= $._lastIndex[agentId][clientAddress],
            "index out of bounds");
        Feedback storage f = $._feedback[agentId][clientAddress][feedbackIndex];
        return (f.value, f.valueDecimals, f.tag1, f.tag2, f.isRevoked);
    }

    function getClients(uint256 agentId) external view returns (address[] memory) {
        return _getReputationRegistryStorage()._clients[agentId];
    }

    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint64 count, int128 summaryValue,
        uint8 summaryValueDecimals)
    {
        ReputationRegistryStorage storage $ = _getReputationRegistryStorage();
        require(clientAddresses.length > 0, "clientAddresses required");

        bytes32 emptyHash = keccak256(bytes(""));
        bytes32 tag1Hash = keccak256(bytes(tag1));
        bytes32 tag2Hash = keccak256(bytes(tag2));
        int256 sum;
        uint64[19] memory decimalCounts;

        for (uint256 i; i < clientAddresses.length; i++) {
            uint64 lastIdx = $._lastIndex[agentId][clientAddresses[i]];
            for (uint64 j = 1; j <= lastIdx; j++) {
                Feedback storage fb = $._feedback[agentId][clientAddresses[i]][j];
                if (fb.isRevoked) continue;
                if (emptyHash != tag1Hash
                    && tag1Hash != keccak256(bytes(fb.tag1))) continue;
                if (emptyHash != tag2Hash
                    && tag2Hash != keccak256(bytes(fb.tag2))) continue;

                int256 factor = int256(10 ** uint256(18 - fb.valueDecimals));
                sum += fb.value * factor;
                decimalCounts[fb.valueDecimals]++;
                count++;
            }
        }

        if (count == 0) return (0, 0, 0);

        // Mode（最頻出のvalueDecimals）を使用
        uint8 modeDecimals;
        uint64 maxCount;
        for (uint8 d; d <= 18; d++) {
            if (decimalCounts[d] > maxCount) {
                maxCount = decimalCounts[d];
                modeDecimals = d;
            }
        }

        int256 avgWad = sum / int256(uint256(count));
        summaryValue = int128(avgWad / int256(10 ** uint256(18 - modeDecimals)));
        summaryValueDecimals = modeDecimals;
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

## ValidationRegistryUpgradeable 完全実装

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

interface IIdentityRegistry {
    function ownerOf(uint256 tokenId) external view returns (address);
    function getApproved(uint256 tokenId) external view returns (address);
    function isApprovedForAll(address owner, address operator)
        external view returns (bool);
}

contract ValidationRegistryUpgradeable is OwnableUpgradeable, UUPSUpgradeable {
    event ValidationRequest(
        address indexed validatorAddress, uint256 indexed agentId,
        string requestURI, bytes32 indexed requestHash
    );
    event ValidationResponse(
        address indexed validatorAddress, uint256 indexed agentId,
        bytes32 indexed requestHash, uint8 response,
        string responseURI, bytes32 responseHash, string tag
    );

    struct ValidationStatus {
        address validatorAddress;
        uint256 agentId;
        uint8 response;       // 0..100
        bytes32 responseHash;
        string tag;
        uint256 lastUpdate;
        bool hasResponse;
    }

    address private _identityRegistry;

    /// @custom:storage-location erc7201:erc8004.validation.registry
    struct ValidationRegistryStorage {
        mapping(bytes32 => ValidationStatus) validations;
        mapping(uint256 => bytes32[]) _agentValidations;
        mapping(address => bytes32[]) _validatorRequests;
    }

    bytes32 private constant VALIDATION_REGISTRY_STORAGE_LOCATION =
        0x21543a2dd0df813994fbf82c69c61d1aafcdce183d68d2ef40068bdce1481100;

    function _getValidationRegistryStorage()
        private pure returns (ValidationRegistryStorage storage $)
    {
        assembly { $.slot := VALIDATION_REGISTRY_STORAGE_LOCATION }
    }

    constructor() { _disableInitializers(); }

    function initialize(address identityRegistry_)
        public reinitializer(2) onlyOwner
    {
        require(identityRegistry_ != address(0), "bad identity");
        _identityRegistry = identityRegistry_;
    }

    function validationRequest(
        address validatorAddress,
        uint256 agentId,
        string calldata requestURI,
        bytes32 requestHash
    ) external {
        ValidationRegistryStorage storage $ = _getValidationRegistryStorage();
        require(validatorAddress != address(0), "bad validator");
        require($.validations[requestHash].validatorAddress == address(0), "exists");

        IIdentityRegistry registry = IIdentityRegistry(_identityRegistry);
        address owner = registry.ownerOf(agentId);
        require(
            msg.sender == owner ||
            registry.isApprovedForAll(owner, msg.sender) ||
            registry.getApproved(agentId) == msg.sender,
            "Not authorized"
        );

        $.validations[requestHash] = ValidationStatus({
            validatorAddress: validatorAddress,
            agentId: agentId,
            response: 0,
            responseHash: bytes32(0),
            tag: "",
            lastUpdate: block.timestamp,
            hasResponse: false
        });

        $._agentValidations[agentId].push(requestHash);
        $._validatorRequests[validatorAddress].push(requestHash);

        emit ValidationRequest(validatorAddress, agentId, requestURI, requestHash);
    }

    function validationResponse(
        bytes32 requestHash,
        uint8 response,
        string calldata responseURI,
        bytes32 responseHash,
        string calldata tag
    ) external {
        ValidationRegistryStorage storage $ = _getValidationRegistryStorage();
        ValidationStatus storage s = $.validations[requestHash];
        require(s.validatorAddress != address(0), "unknown");
        require(msg.sender == s.validatorAddress, "not validator");
        require(response <= 100, "resp>100");

        s.response = response;
        s.responseHash = responseHash;
        s.tag = tag;
        s.lastUpdate = block.timestamp;
        s.hasResponse = true;

        emit ValidationResponse(s.validatorAddress, s.agentId,
            requestHash, response, responseURI, responseHash, tag);
    }

    function getValidationStatus(bytes32 requestHash)
        external view returns (
            address validatorAddress, uint256 agentId,
            uint8 response, bytes32 responseHash,
            string memory tag, uint256 lastUpdate
        )
    {
        ValidationRegistryStorage storage $ = _getValidationRegistryStorage();
        ValidationStatus memory s = $.validations[requestHash];
        require(s.validatorAddress != address(0), "unknown");
        return (s.validatorAddress, s.agentId, s.response,
            s.responseHash, s.tag, s.lastUpdate);
    }

    function getSummary(
        uint256 agentId,
        address[] calldata validatorAddresses,
        string calldata tag
    ) external view returns (uint64 count, uint8 avgResponse) {
        ValidationRegistryStorage storage $ = _getValidationRegistryStorage();
        uint256 totalResponse;
        bytes32[] storage requestHashes = $._agentValidations[agentId];

        for (uint256 i; i < requestHashes.length; i++) {
            ValidationStatus storage s = $.validations[requestHashes[i]];

            bool matchValidator = (validatorAddresses.length == 0);
            if (!matchValidator) {
                for (uint256 j; j < validatorAddresses.length; j++) {
                    if (s.validatorAddress == validatorAddresses[j]) {
                        matchValidator = true;
                        break;
                    }
                }
            }

            bool matchTag = (bytes(tag).length == 0)
                || (keccak256(bytes(s.tag)) == keccak256(bytes(tag)));

            if (matchValidator && matchTag && s.hasResponse) {
                totalResponse += s.response;
                count++;
            }
        }

        avgResponse = count > 0 ? uint8(totalResponse / count) : 0;
    }

    function getAgentValidations(uint256 agentId)
        external view returns (bytes32[] memory)
    {
        return _getValidationRegistryStorage()._agentValidations[agentId];
    }

    function getValidatorRequests(address validatorAddress)
        external view returns (bytes32[] memory)
    {
        return _getValidationRegistryStorage()._validatorRequests[validatorAddress];
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

## テストパターン

### Hardhat（TypeScript）テスト

```typescript
import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("ERC-8004 Identity Registry", function () {
  async function deployFixture() {
    const [owner, agent1, agent2, operator] = await ethers.getSigners();

    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistryUpgradeable"
    );
    const identity = await upgrades.deployProxy(IdentityRegistry, [], {
      initializer: "initialize",
    });

    return { identity, owner, agent1, agent2, operator };
  }

  describe("Registration", function () {
    it("should register agent with no URI", async function () {
      const { identity, agent1 } = await loadFixture(deployFixture);
      const tx = await identity.connect(agent1)["register()"]();
      const receipt = await tx.wait();

      expect(await identity.ownerOf(0)).to.equal(agent1.address);
      expect(await identity.getAgentWallet(0)).to.equal(agent1.address);
    });

    it("should register agent with URI", async function () {
      const { identity, agent1 } = await loadFixture(deployFixture);
      const uri = "ipfs://QmAgent1Registration";
      await identity.connect(agent1)["register(string)"](uri);

      expect(await identity.tokenURI(0)).to.equal(uri);
    });

    it("should register agent with URI and metadata", async function () {
      const { identity, agent1 } = await loadFixture(deployFixture);
      const metadata = [
        {
          metadataKey: "capabilities",
          metadataValue: ethers.toUtf8Bytes("data-analysis,code-gen"),
        },
      ];
      await identity
        .connect(agent1)
        ["register(string,(string,bytes)[])"](
          "ipfs://QmAgent1",
          metadata
        );

      const capabilities = await identity.getMetadata(0, "capabilities");
      expect(ethers.toUtf8String(capabilities)).to.equal(
        "data-analysis,code-gen"
      );
    });

    it("should prevent reserved key in metadata", async function () {
      const { identity, agent1 } = await loadFixture(deployFixture);
      const metadata = [
        {
          metadataKey: "agentWallet",
          metadataValue: ethers.toUtf8Bytes("hack"),
        },
      ];
      await expect(
        identity
          .connect(agent1)
          ["register(string,(string,bytes)[])"](
            "ipfs://QmAgent1",
            metadata
          )
      ).to.be.revertedWith("reserved key");
    });
  });

  describe("Agent Wallet", function () {
    it("should clear agentWallet on transfer", async function () {
      const { identity, agent1, agent2 } = await loadFixture(deployFixture);
      await identity.connect(agent1)["register()"]();

      expect(await identity.getAgentWallet(0)).to.equal(agent1.address);

      await identity
        .connect(agent1)
        .transferFrom(agent1.address, agent2.address, 0);

      expect(await identity.getAgentWallet(0)).to.equal(ethers.ZeroAddress);
    });
  });
});

describe("ERC-8004 Reputation Registry", function () {
  async function deployFixture() {
    const [owner, agent1, client1, client2] = await ethers.getSigners();

    const IdentityRegistry = await ethers.getContractFactory(
      "IdentityRegistryUpgradeable"
    );
    const identity = await upgrades.deployProxy(IdentityRegistry, [], {
      initializer: "initialize",
    });

    const ReputationRegistry = await ethers.getContractFactory(
      "ReputationRegistryUpgradeable"
    );
    const reputation = await upgrades.deployProxy(
      ReputationRegistry,
      [await identity.getAddress()],
      { initializer: "initialize" }
    );

    // Register agent
    await identity.connect(agent1)["register()"]();

    return { identity, reputation, owner, agent1, client1, client2 };
  }

  it("should accept feedback from non-owner", async function () {
    const { reputation, client1 } = await loadFixture(deployFixture);
    await reputation.connect(client1).giveFeedback(
      0,       // agentId
      87,      // value
      0,       // valueDecimals
      "starred",
      "quality",
      "https://agent.example.com/api",
      "ipfs://feedback1",
      ethers.keccak256(ethers.toUtf8Bytes("feedback-data"))
    );

    const fb = await reputation.readFeedback(0, client1.address, 1);
    expect(fb.value).to.equal(87);
    expect(fb.tag1).to.equal("starred");
  });

  it("should prevent self-feedback", async function () {
    const { reputation, agent1 } = await loadFixture(deployFixture);
    await expect(
      reputation.connect(agent1).giveFeedback(
        0, 100, 0, "starred", "", "", "", ethers.ZeroHash
      )
    ).to.be.revertedWith("Self-feedback not allowed");
  });

  it("should calculate summary correctly", async function () {
    const { reputation, client1, client2 } = await loadFixture(deployFixture);

    await reputation.connect(client1).giveFeedback(
      0, 80, 0, "starred", "", "", "", ethers.ZeroHash
    );
    await reputation.connect(client2).giveFeedback(
      0, 90, 0, "starred", "", "", "", ethers.ZeroHash
    );

    const summary = await reputation.getSummary(
      0,
      [client1.address, client2.address],
      "starred",
      ""
    );
    expect(summary.count).to.equal(2);
    expect(summary.summaryValue).to.equal(85); // (80+90)/2
  });
});
```

### Foundry（Solidity）テスト

```solidity
// test/IdentityRegistry.t.sol
import { Test } from "forge-std/Test.sol";
import { IdentityRegistryUpgradeable } from
    "../contracts/IdentityRegistryUpgradeable.sol";
import { ERC1967Proxy } from
    "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract IdentityRegistryTest is Test {
    IdentityRegistryUpgradeable identity;
    address agent1 = makeAddr("agent1");
    address agent2 = makeAddr("agent2");

    function setUp() public {
        IdentityRegistryUpgradeable impl = new IdentityRegistryUpgradeable();
        bytes memory initData = abi.encodeCall(impl.initialize, ());
        ERC1967Proxy proxy = new ERC1967Proxy(address(impl), initData);
        identity = IdentityRegistryUpgradeable(address(proxy));
    }

    function test_Register() public {
        vm.prank(agent1);
        uint256 agentId = identity.register();
        assertEq(agentId, 0);
        assertEq(identity.ownerOf(0), agent1);
        assertEq(identity.getAgentWallet(0), agent1);
    }

    function test_RegisterWithURI() public {
        vm.prank(agent1);
        uint256 agentId = identity.register("ipfs://QmAgent1");
        assertEq(identity.tokenURI(agentId), "ipfs://QmAgent1");
    }

    function test_TransferClearsWallet() public {
        vm.prank(agent1);
        identity.register();
        assertEq(identity.getAgentWallet(0), agent1);

        vm.prank(agent1);
        identity.transferFrom(agent1, agent2, 0);
        assertEq(identity.getAgentWallet(0), address(0));
    }

    function test_ReservedKeyReverts() public {
        vm.prank(agent1);
        vm.expectRevert("reserved key");
        identity.setMetadata(0, "agentWallet", abi.encodePacked(agent2));
    }
}
```

## Hardhat Ignition デプロイモジュール

```typescript
// ignition/modules/ERC8004.ts
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC8004Module", (m) => {
  // Deploy IdentityRegistry
  const identityImpl = m.contract("IdentityRegistryUpgradeable");
  const identityInitData = m.encodeFunctionCall(
    identityImpl,
    "initialize",
    []
  );
  const identityProxy = m.contract("ERC1967Proxy", [
    identityImpl,
    identityInitData,
  ], { id: "IdentityProxy" });

  // Deploy ReputationRegistry
  const reputationImpl = m.contract("ReputationRegistryUpgradeable");
  const reputationInitData = m.encodeFunctionCall(
    reputationImpl,
    "initialize",
    [identityProxy]
  );
  const reputationProxy = m.contract("ERC1967Proxy", [
    reputationImpl,
    reputationInitData,
  ], { id: "ReputationProxy" });

  // Deploy ValidationRegistry
  const validationImpl = m.contract("ValidationRegistryUpgradeable");
  const validationInitData = m.encodeFunctionCall(
    validationImpl,
    "initialize",
    [identityProxy]
  );
  const validationProxy = m.contract("ERC1967Proxy", [
    validationImpl,
    validationInitData,
  ], { id: "ValidationProxy" });

  return {
    identityProxy,
    reputationProxy,
    validationProxy,
    identityImpl,
    reputationImpl,
    validationImpl,
  };
});
```
