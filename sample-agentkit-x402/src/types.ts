/**
 * アプリ全体で共有する型定義
 */

import type { AgentkitExtensionInfo, SupportedChain } from "@worldcoin/agentkit-core";

// ──────────────────────────────────────────
// サーバー側
// ──────────────────────────────────────────

/** agentkit ヘッダー検証結果 */
export interface VerifyResult {
	valid: boolean;
	/** 失敗したステップ名 (parse / validate / signature / agentbook) */
	step?: string;
	error?: string;
	address?: string;
	humanId?: string;
	/** SKIP_AGENT_BOOK=true 時のみ true */
	devMode?: boolean;
}

/** デモ UI 向けのフロー説明ステップ */
export interface DemoStep {
	label: string;
	detail: string;
}

// ──────────────────────────────────────────
// クライアント側（agent.ts / gen-header.ts）
// ──────────────────────────────────────────

/** 402 レスポンス内の agentkit 拡張オブジェクト */
export interface AgentKitExtension {
	info: AgentkitExtensionInfo;
	supportedChains: SupportedChain[];
	mode?: { type: string; uses?: number; percent?: number };
	schema?: unknown;
}

/** x402 の 402 Payment Required レスポンスボディ */
export interface PaymentRequiredBody {
	version: string;
	error: string;
	accepts: unknown[];
	extensions?: {
		agentkit?: AgentKitExtension;
	};
}
