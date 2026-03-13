import { verifySiweMessage } from "@worldcoin/minikit-js";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

// シンプルなインメモリnonce管理（本番ではRedis等を使用）
const nonces = new Map<string, number>();

// nonce生成
export async function GET() {
  const nonce = randomBytes(16).toString("hex"); // 32文字の英数字
  nonces.set(nonce, Date.now());

  // 5分後に自動削除
  setTimeout(() => nonces.delete(nonce), 5 * 60 * 1000);

  return NextResponse.json({ nonce });
}

// SIWE署名検証
export async function POST(req: Request) {
  try {
    const { payload, nonce } = await req.json();

    // nonceの存在チェック
    if (!nonces.has(nonce)) {
      return NextResponse.json(
        { error: "無効なnonceです" },
        { status: 400 }
      );
    }

    // 使用済みnonceを削除（リプレイ攻撃防止）
    nonces.delete(nonce);

    const isValid = await verifySiweMessage(payload, nonce);

    if (isValid) {
      return NextResponse.json({
        authenticated: true,
        address: payload.address,
      });
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "認証中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
