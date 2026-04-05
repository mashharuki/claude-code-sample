/**
 * AgentKit クライアント側ヘルパー
 *
 * 402 レスポンスの agentkit 拡張から署名済みヘッダーを組み立てる共通ロジック。
 * server.ts の runAgentFlow・agent.ts・gen-header.ts で共有する。
 *
 * フロー:
 *   1. supportedChains から eip191 チェーンを選択
 *   2. formatSIWEMessage で SIWE メッセージを構築（公式 SDK）
 *   3. EOA ウォレットで EIP-191 署名
 *   4. JSON を Base64 エンコードして agentkit ヘッダー値を生成
 */

import {
	formatSIWEMessage,
	type AgentkitExtensionInfo,
	type SupportedChain,
} from "@worldcoin/agentkit-core";
import type { ethers } from "ethers";

export interface AgentkitHeaderResult {
	/** HTTP ヘッダー agentkit の値（Base64 エンコード済み JSON） */
	headerValue: string;
	/** 署名対象の SIWE メッセージ文字列 */
	siweMessage: string;
	/** EIP-191 署名（hex 文字列） */
	signature: string;
	/** 選択されたチェーン情報 */
	chain: SupportedChain;
}

/**
 * agentkit ヘッダー値を生成する。
 *
 * @param info     - 402 レスポンスから取得したチャレンジ情報
 * @param supportedChains - 402 レスポンスのサポートチェーン一覧
 * @param wallet   - 署名に使う EOA ウォレット
 */
export async function buildAgentkitHeader(
	info: AgentkitExtensionInfo,
	supportedChains: SupportedChain[],
	wallet: ethers.Wallet,
): Promise<AgentkitHeaderResult> {
	// eip191（EOA）対応のチェーンを選択
	const chain = supportedChains.find((c) => c.type === "eip191");
	if (!chain) {
		throw new Error("eip191 をサポートするチェーンが 402 レスポンスにありません");
	}

	// 公式 formatSIWEMessage で EIP-4361 準拠のメッセージを構築
	const siweMessage = formatSIWEMessage(
		{ ...info, chainId: chain.chainId, type: chain.type },
		wallet.address,
	);

	// EIP-191 署名
	const signature = await wallet.signMessage(siweMessage);

	// agentkit ヘッダーのペイロードを Base64 エンコード
	const headerPayload = {
		...info,
		address: wallet.address,
		chainId: chain.chainId,
		type: "eip191" as const,
		signature,
	};
	const headerValue = Buffer.from(JSON.stringify(headerPayload)).toString("base64");

	return { headerValue, siweMessage, signature, chain };
}
