/**
 * AgentKit x402 Agent Script
 *
 * 公式 @worldcoin/agentkit-core の formatSIWEMessage を使って
 * 402 Payment Required → AgentKit 認証 → 無料アクセス の流れを実演。
 *
 * 実行方法:
 *   bun run src/agent.ts
 *
 * 対応チェーン: World Chain mainnet (eip155:480)
 *
 * 本番利用前に必要な登録:
 *   npx @worldcoin/agentkit-cli register <your-wallet-address>
 */

import {
	formatSIWEMessage,
	type AgentkitExtensionInfo,
	type SupportedChain,
} from "@worldcoin/agentkit-core";
import { ethers } from "ethers";

// ──────────────────────────────────────────
// 設定（bun は .env を自動ロード）
// ──────────────────────────────────────────
const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:3001";
// デモ用エージェントウォレット（EOA）
const PRIVATE_KEY =
	process.env.AGENT_PRIVATE_KEY ?? ethers.Wallet.createRandom().privateKey;
// Wallet インスタンスは署名に使用するためここで作成しておく
const wallet = new ethers.Wallet(PRIVATE_KEY);

// ──────────────────────────────────────────
// 型定義
// ──────────────────────────────────────────
interface AgentKitExtension {
	info: AgentkitExtensionInfo;
	supportedChains: SupportedChain[];
	mode?: { type: string; uses?: number; percent?: number };
	schema?: unknown;
}

interface PaymentRequiredBody {
	version: string;
	error: string;
	accepts: unknown[];
	extensions?: {
		agentkit?: AgentKitExtension;
	};
}

// ──────────────────────────────────────────
// AgentKit 認証フロー付きフェッチ
// ──────────────────────────────────────────

/**
 * x402 + AgentKit 保護されたリソースを取得する。
 * 402 を受け取ったとき agentkit 拡張があれば認証フローを実行し、
 * 支払いなしで再リクエストする。
 */
async function fetchWithAgentKit(url: string): Promise<unknown> {
	log("info", `GET ${url}`);

	// ── Step 1: 通常リクエスト ──
	const res1 = await fetch(url);

	if (res1.status !== 402) {
		log("success", `${res1.status} OK — AgentKit 不要`);
		return res1.json();
	}

	const body = (await res1.json()) as PaymentRequiredBody;
	log("warn", "402 Payment Required を受信");

	// ── Step 2: agentkit 拡張を確認 ──
	const agentkit = body.extensions?.agentkit;
	if (!agentkit) {
		throw new Error(
			"agentkit 拡張が 402 レスポンスにありません。通常の x402 支払いフローが必要です。",
		);
	}
	log("info", `agentkit 拡張を検出 (mode: ${JSON.stringify(agentkit.mode)})`);

	const { info, supportedChains } = agentkit;

	// ── Step 3: 自分のウォレットタイプに合うチェーンを選択（EOA → eip191）──
	const chain = supportedChains.find((c) => c.type === "eip191");
	if (!chain) throw new Error("eip191 をサポートするチェーンが見つかりません");
	log("info", `チェーン選択: ${chain.chainId} (type: ${chain.type})`);

	// ── Step 4: 公式 formatSIWEMessage で SIWE メッセージを構築 ──
	// CompleteAgentkitInfo には chainId・type が必要
	const siweMessage = formatSIWEMessage(
		{ ...info, chainId: chain.chainId, type: chain.type },
		wallet.address,
	);
	log("info", "--- SIWE メッセージ ---");
	console.log(siweMessage);
	console.log("----------------------");

	// ── Step 5: EIP-191 署名 ──
	const signature = await wallet.signMessage(siweMessage);
	log("info", `署名完了: ${signature.slice(0, 20)}...`);

	// ── Step 6: agentkit ヘッダーを組み立て（Base64 JSON）──
	const headerPayload = {
		...info,
		address: wallet.address,
		chainId: chain.chainId,
		type: "eip191",
		signature,
	};
	const headerValue = Buffer.from(JSON.stringify(headerPayload)).toString(
		"base64",
	);

	// ── Step 7: agentkit ヘッダー付きで再リクエスト ──
	log("info", "agentkit ヘッダーを付与して再リクエスト...");
	const res2 = await fetch(url, { headers: { agentkit: headerValue } });

	if (!res2.ok) {
		const errBody = await res2.json().catch(() => ({}));
		throw new Error(`認証失敗 (${res2.status}): ${JSON.stringify(errBody)}`);
	}

	log("success", `${res2.status} OK — AgentKit 認証成功！`);
	return res2.json();
}

// ──────────────────────────────────────────
// ユーティリティ
// ──────────────────────────────────────────
type LogLevel = "info" | "warn" | "success" | "error";

function log(level: LogLevel, msg: string): void {
	const icon: Record<LogLevel, string> = {
		info: "[INFO]",
		warn: "[WARN]",
		success: "[OK]  ",
		error: "[ERR] ",
	};
	console.log(`${icon[level]} ${msg}`);
}

// ──────────────────────────────────────────
// メイン
// ──────────────────────────────────────────
async function main(): Promise<void> {
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(" AgentKit x402 Agent Demo");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(` Agent Wallet: ${wallet.address}`);
	console.log("");

	const data = await fetchWithAgentKit(`${SERVER_URL}/api/weather`);

	console.log("");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(" レスポンスデータ");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(JSON.stringify(data, null, 2));
}

main().catch((e: Error) => {
	log("error", e.message);
	process.exit(1);
});
