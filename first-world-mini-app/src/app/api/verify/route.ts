import {
  verifyCloudProof,
  IVerifyResponse,
  ISuccessResult,
} from "@worldcoin/minikit-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { payload, action } = (await req.json()) as {
      payload: ISuccessResult;
      action: string;
    };

    const appId = process.env.APP_ID as `app_${string}`;

    if (!appId) {
      return NextResponse.json(
        { error: "APP_ID が設定されていません" },
        { status: 500 }
      );
    }

    const verifyRes: IVerifyResponse = await verifyCloudProof(
      payload,
      appId,
      action
    );

    if (verifyRes.success) {
      // 本番では nullifier_hash をDBに保存して重複チェックする
      return NextResponse.json({
        verified: true,
        nullifier_hash: payload.nullifier_hash,
      });
    }

    return NextResponse.json({ verified: false }, { status: 400 });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json(
      { error: "検証中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
