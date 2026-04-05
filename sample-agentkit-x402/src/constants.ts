/**
 * アプリ全体で共有する定数
 */

/** World Chain mainnet の CAIP-2 チェーン ID */
export const WORLD_CHAIN = "eip155:480" as const;

/**
 * World Chain mainnet の USDC コントラクトアドレス
 * x402 の支払い受取時にクライアントが参照するトークン
 */
export const WORLD_CHAIN_USDC = "0x79A02482A880bCE3F13e09Da970dC34db4CD24d1";

/**
 * SIWE メッセージに含まれるステートメント
 * サーバー・クライアントで完全一致する必要がある
 */
export const AGENTKIT_STATEMENT = "Verify your agent is backed by a real human";
