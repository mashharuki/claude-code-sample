/**
 * AgentKit x402 Tutorial Server
 *
 * 公式 SDK (@worldcoin/agentkit-core) を使った
 * x402 + AgentKit 保護サーバーのチュートリアル。
 *
 * 起動:
 *   bun run src/server.ts          # 通常起動
 *   bun --watch src/server.ts      # 開発用ホットリロード
 *
 * 環境変数 (.env に記述):
 *   AGENT_PRIVATE_KEY  ... デモ用エージェント秘密鍵（省略でランダム生成）
 *   PORT               ... ポート番号（デフォルト: 3001）
 *   PAY_TO_ADDRESS     ... 支払い受取ウォレットアドレス
 *   SKIP_AGENT_BOOK    ... "true" で AgentBook チェックをスキップ（開発用）
 *
 * チェーン:
 *   支払い・署名: World Chain mainnet (eip155:480)
 *   AgentBook:   World Chain mainnet 固定（SDK の唯一のデプロイ先）
 */

import {
	buildAgentkitSchema,
	createAgentBookVerifier,
	parseAgentkitHeader,
	validateAgentkitMessage,
	verifyAgentkitSignature,
	type AgentkitExtensionInfo,
} from "@worldcoin/agentkit-core";
import { ethers } from "ethers";
import express, { type Request, type Response } from "express";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildAgentkitHeader } from "./agentkit-client.ts";
import { AGENTKIT_STATEMENT, WORLD_CHAIN, WORLD_CHAIN_USDC } from "./constants.ts";
import type { DemoStep, VerifyResult } from "./types.ts";

// ──────────────────────────────────────────
// 設定
// ──────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3001);
const SKIP_AGENT_BOOK = process.env.SKIP_AGENT_BOOK === "true";

// デモ用エージェントウォレット（EOA）
const PRIVATE_KEY =
	process.env.AGENT_PRIVATE_KEY ?? ethers.Wallet.createRandom().privateKey;
const agentWallet = new ethers.Wallet(PRIVATE_KEY);

// AgentBook ベリファイア（World Chain mainnet の AgentBook コントラクトを参照）
const agentBook = createAgentBookVerifier();

// ──────────────────────────────────────────
// 402 レスポンス生成
// ──────────────────────────────────────────
function buildChallengeResponse(resourceUri: string) {
	// domain は hostname のみ（ポートなし）— validateAgentkitMessage の仕様に準拠
	const domain = new URL(resourceUri).hostname;

	const info: AgentkitExtensionInfo = {
		domain,
		uri: resourceUri,
		version: "1",
		nonce: crypto.randomBytes(16).toString("hex"),
		issuedAt: new Date().toISOString(),
		statement: AGENTKIT_STATEMENT,
		resources: [resourceUri],
	};

	// EVM チェーンでは eip191（EOA）と eip1271（SCW）の両方をサポート
	const supportedChains = [
		{ chainId: WORLD_CHAIN, type: "eip191" as const },
		{ chainId: WORLD_CHAIN, type: "eip1271" as const },
	];

	return {
		version: "2",
		error: "X-PAYMENT-REQUIRED",
		accepts: [
			{
				scheme: "exact",
				price: "$0.001",
				network: WORLD_CHAIN,
				payTo:
					process.env.PAY_TO_ADDRESS ??
					"0x0000000000000000000000000000000000000000",
			},
		],
		extensions: {
			agentkit: {
				info,
				supportedChains,
				schema: buildAgentkitSchema(),
				mode: { type: "free" } as const,
			},
		},
	};
}

// ──────────────────────────────────────────
// agentkit ヘッダー検証
// ──────────────────────────────────────────
async function verifyRequest(
	header: string,
	resourceUri: string,
): Promise<VerifyResult> {
	// Step 1: Base64 デコード + スキーマバリデーション
	let payload: ReturnType<typeof parseAgentkitHeader>;
	try {
		payload = parseAgentkitHeader(header);
	} catch (e) {
		return { valid: false, step: "parse", error: String(e) };
	}

	// Step 2: ドメイン・URI・タイムスタンプ・ノンス検証
	const validation = await validateAgentkitMessage(payload, resourceUri);
	if (!validation.valid) {
		return { valid: false, step: "validate", error: validation.error };
	}

	// Step 3: 署名検証（EOA / SCW 自動判定）
	const verification = await verifyAgentkitSignature(payload);
	if (!verification.valid || !verification.address) {
		return { valid: false, step: "signature", error: verification.error };
	}

	// Step 4: AgentBook ルックアップ（World Chain mainnet のコントラクトに問い合わせ）
	if (!SKIP_AGENT_BOOK) {
		const humanId = await agentBook.lookupHuman(
			verification.address,
			payload.chainId,
		);
		if (!humanId) {
			return {
				valid: false,
				step: "agentbook",
				error:
					"Agent not registered in AgentBook. Run: npx @worldcoin/agentkit-cli register <address>",
				address: verification.address,
			};
		}
		return { valid: true, address: verification.address, humanId };
	}

	return {
		valid: true,
		address: verification.address,
		humanId: "0x[dev-bypass]",
		devMode: true,
	};
}

// ──────────────────────────────────────────
// デモ用: サーバー内部でエージェントフローを実行
// ──────────────────────────────────────────
async function runAgentFlow(resourceUri: string) {
	const response402 = buildChallengeResponse(resourceUri);
	const { info, supportedChains } = response402.extensions.agentkit;

	const { headerValue, siweMessage, signature } = await buildAgentkitHeader(
		info,
		supportedChains,
		agentWallet,
	);

	const result = await verifyRequest(headerValue, resourceUri);
	return { response402, siweMessage, signature, headerValue, result };
}

// ──────────────────────────────────────────
// Express アプリ
// ──────────────────────────────────────────
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

/** GET /api/weather — x402 + AgentKit で保護されたリソース */
app.get("/api/weather", async (req: Request, res: Response) => {
	const agentkitHeader = req.headers["agentkit"] as string | undefined;
	const resourceUri = `http://localhost:${PORT}${req.path}`;

	if (agentkitHeader) {
		const result = await verifyRequest(agentkitHeader, resourceUri);
		if (result.valid) {
			res.json({
				success: true,
				data: { weather: "晴れ", temperature: "22°C", humidity: "45%", city: "東京" },
				agent: result.address,
				humanId: result.humanId,
				accessMode: "free (agentkit)",
				devMode: result.devMode ?? false,
			});
			return;
		}
		console.warn("[AgentKit] Verification failed:", result);
	}

	res.status(402).json(buildChallengeResponse(resourceUri));
});

/** GET /api/demo/step1 — 402 レスポンスの内容を返す */
app.get("/api/demo/step1", (_req: Request, res: Response) => {
	const resourceUri = `http://localhost:${PORT}/api/weather`;
	res.json({ step: 1, httpStatus: 402, response: buildChallengeResponse(resourceUri) });
});

/** GET /api/demo/step2 — 署名フローの詳細を返す */
app.get("/api/demo/step2", async (_req: Request, res: Response) => {
	const resourceUri = `http://localhost:${PORT}/api/weather`;
	const { response402, siweMessage, signature, result } =
		await runAgentFlow(resourceUri);
	const { info } = response402.extensions.agentkit;

	const steps: DemoStep[] = [
		{ label: "① 402 を受信", detail: `ノンス: ${info.nonce.slice(0, 10)}...` },
		{ label: "② parseAgentkitHeader でデコード", detail: "Base64 → JSON → スキーマ検証" },
		{ label: "③ validateAgentkitMessage", detail: `ドメイン: ${info.domain} / TTL: 5分` },
		{
			label: "④ verifyAgentkitSignature (ERC-1271 / EOA 自動判定)",
			detail: `${signature.slice(0, 18)}...`,
		},
		{
			label: "⑤ AgentBook.lookupHuman (World Chain mainnet)",
			detail: SKIP_AGENT_BOOK
				? "⚠️ SKIP_AGENT_BOOK=true (開発モード)"
				: result.humanId
					? `humanId: ${result.humanId}`
					: `❌ ${result.error}`,
		},
	];

	res.json({
		step: 2,
		agentWallet: agentWallet.address,
		siweMessage,
		signaturePreview: `${signature.slice(0, 22)}...`,
		agentBookSkipped: SKIP_AGENT_BOOK,
		result,
		steps,
	});
});

/** GET /api/demo/step3 — 認証済みリソースを返す */
app.get("/api/demo/step3", async (_req: Request, res: Response) => {
	const resourceUri = `http://localhost:${PORT}/api/weather`;
	const { result } = await runAgentFlow(resourceUri);

	if (result.valid) {
		res.json({
			step: 3,
			success: true,
			data: { weather: "晴れ", temperature: "22°C", humidity: "45%", city: "東京" },
			agent: result.address,
			humanId: result.humanId,
			accessMode: "free (agentkit)",
			devMode: result.devMode ?? false,
		});
	} else {
		res.status(result.step === "agentbook" ? 403 : 400).json({
			success: false,
			...result,
		});
	}
});

/** GET /api/agent-info — デモ用ウォレット・チェーン情報を返す */
app.get("/api/agent-info", (_req: Request, res: Response) => {
	res.json({
		address: agentWallet.address,
		skipAgentBook: SKIP_AGENT_BOOK,
		chain: WORLD_CHAIN,
		usdcAddress: WORLD_CHAIN_USDC,
	});
});

// ──────────────────────────────────────────
// Start
// ──────────────────────────────────────────
app.listen(PORT, () => {
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(" AgentKit x402 Tutorial Server");
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	console.log(` URL:              http://localhost:${PORT}`);
	console.log(` Chain:            World Chain (${WORLD_CHAIN})`);
	console.log(` Agent Wallet:     ${agentWallet.address}`);
	console.log(
		` AgentBook check:  ${SKIP_AGENT_BOOK ? "SKIPPED (dev mode)" : "ENABLED (World Chain mainnet)"}`,
	);
	console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
	if (SKIP_AGENT_BOOK) {
		console.log(" ⚠️  本番環境では SKIP_AGENT_BOOK=true を外してください");
		console.log("    登録: npx @worldcoin/agentkit-cli register <address>");
	}
});
