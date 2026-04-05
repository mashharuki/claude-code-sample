/**
 * agentkit ヘッダー生成スクリプト
 *
 * REST Client で /api/weather を直接テストするための
 * agentkit ヘッダー値を生成して標準出力に出力する。
 *
 * 使い方:
 *   bun run src/gen-header.ts
 *
 * 出力された AGENTKIT_HEADER の値を requests.http の
 * @agentkitHeader に貼り付けてください。
 * ヘッダーの有効期限は 5 分です。
 */

import {
	formatSIWEMessage,
	type AgentkitExtensionInfo,
} from "@worldcoin/agentkit-core";
import { ethers } from "ethers";
import crypto from "node:crypto";

// ──────────────────────────────────────────
// 設定（bun は .env を自動ロード）
// ──────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);
const PRIVATE_KEY =
	process.env.AGENT_PRIVATE_KEY ?? ethers.Wallet.createRandom().privateKey;
const wallet = new ethers.Wallet(PRIVATE_KEY);

const WORLD_CHAIN = "eip155:480" as const;
const RESOURCE_URI = `http://localhost:${PORT}/api/weather`;

// ──────────────────────────────────────────
// チャレンジを自己生成して署名
// ──────────────────────────────────────────
const domain = new URL(RESOURCE_URI).hostname;
const nonce = crypto.randomBytes(16).toString("hex");
const issuedAt = new Date().toISOString();

const info: AgentkitExtensionInfo = {
	domain,
	uri: RESOURCE_URI,
	version: "1",
	nonce,
	issuedAt,
	statement: "Verify your agent is backed by a real human",
	resources: [RESOURCE_URI],
};

const siweMessage = formatSIWEMessage(
	{ ...info, chainId: WORLD_CHAIN, type: "eip191" },
	wallet.address,
);

const signature = await wallet.signMessage(siweMessage);

const headerPayload = {
	...info,
	address: wallet.address,
	chainId: WORLD_CHAIN,
	type: "eip191",
	signature,
};

const headerValue = Buffer.from(JSON.stringify(headerPayload)).toString(
	"base64",
);

// ──────────────────────────────────────────
// 出力
// ──────────────────────────────────────────
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(" agentkit ヘッダー生成完了");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Wallet : ${wallet.address}`);
console.log(`Nonce  : ${nonce}`);
console.log(`Issued : ${issuedAt}`);
console.log(`Chain  : ${WORLD_CHAIN}`);
console.log("");
console.log("▼ requests.http の @agentkitHeader に貼り付けてください");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(headerValue);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚠️  有効期限: 5 分");
