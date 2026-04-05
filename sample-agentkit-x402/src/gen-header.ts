/**
 * agentkit ヘッダー生成スクリプト
 *
 * REST Client で /api/weather を直接テストするための
 * agentkit ヘッダー値を生成して標準出力に出力する。
 *
 * 使い方:
 *   bun gen-header
 *
 * 出力された値を requests.http の @agentkitHeader に貼り付けてください。
 * ヘッダーの有効期限は 5 分です。
 */

import { ethers } from "ethers";
import crypto from "node:crypto";
import { buildAgentkitHeader } from "./agentkit-client.ts";
import { AGENTKIT_STATEMENT, WORLD_CHAIN } from "./constants.ts";
import type { AgentkitExtensionInfo } from "@worldcoin/agentkit-core";

// ──────────────────────────────────────────
// 設定（bun は .env を自動ロード）
// ──────────────────────────────────────────
const PORT = Number(process.env.PORT ?? 3001);
const PRIVATE_KEY =
	process.env.AGENT_PRIVATE_KEY ?? ethers.Wallet.createRandom().privateKey;
const wallet = new ethers.Wallet(PRIVATE_KEY);

const RESOURCE_URI = `http://localhost:${PORT}/api/weather`;

// ──────────────────────────────────────────
// チャレンジ情報を組み立て（サーバーが生成するものと同じ構造）
// ──────────────────────────────────────────
const info: AgentkitExtensionInfo = {
	domain: new URL(RESOURCE_URI).hostname,
	uri: RESOURCE_URI,
	version: "1",
	nonce: crypto.randomBytes(16).toString("hex"),
	issuedAt: new Date().toISOString(),
	statement: AGENTKIT_STATEMENT,
	resources: [RESOURCE_URI],
};

const supportedChains = [
	{ chainId: WORLD_CHAIN, type: "eip191" as const },
	{ chainId: WORLD_CHAIN, type: "eip1271" as const },
];

// ──────────────────────────────────────────
// ヘッダーを生成
// ──────────────────────────────────────────
const { headerValue, signature, chain } = await buildAgentkitHeader(
	info,
	supportedChains,
	wallet,
);

// ──────────────────────────────────────────
// 出力
// ──────────────────────────────────────────
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(" agentkit ヘッダー生成完了");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(`Wallet    : ${wallet.address}`);
console.log(`Nonce     : ${info.nonce}`);
console.log(`Issued At : ${info.issuedAt}`);
console.log(`Chain     : ${chain.chainId} (${chain.type})`);
console.log(`Signature : ${signature.slice(0, 20)}...`);
console.log("");
console.log("▼ requests.http の @agentkitHeader に貼り付けてください");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log(headerValue);
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("⚠️  有効期限: 5 分");
