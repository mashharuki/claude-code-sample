import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { payload, reference } = await req.json();

    const apiKey = process.env.DEV_PORTAL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "DEV_PORTAL_API_KEY が設定されていません" },
        { status: 500 }
      );
    }

    // Developer Portal APIでトランザクションを検証
    const response = await fetch(
      `https://developer.worldcoin.org/api/v2/minikit/transaction/${payload.transaction_id}?type=transaction`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "トランザクション検証APIエラー" },
        { status: 502 }
      );
    }

    const transaction = await response.json();

    // referenceとstatusを照合
    if (transaction.reference === reference && transaction.status === "mined") {
      return NextResponse.json({ success: true, transaction });
    }

    return NextResponse.json(
      { success: false, error: "トランザクションが一致しません" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment verify error:", error);
    return NextResponse.json(
      { error: "決済検証中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
