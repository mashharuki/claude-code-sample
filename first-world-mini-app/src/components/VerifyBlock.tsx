"use client";

import { useState } from "react";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";

type VerifyState = "idle" | "loading" | "success" | "error";

export function VerifyBlock() {
  const [state, setState] = useState<VerifyState>("idle");
  const [result, setResult] = useState<string>("");

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) {
      setResult("World App内で実行してください");
      setState("error");
      return;
    }

    setState("loading");

    try {
      const { finalPayload } = await MiniKit.commandsAsync.verify({
        action: "verify-human",
        verification_level: VerificationLevel.Orb,
      });

      if (finalPayload.status === "error") {
        setResult(`エラー: ${finalPayload.error_code}`);
        setState("error");
        return;
      }

      // バックエンドで検証
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          action: "verify-human",
        }),
      });

      const data = await res.json();

      if (data.verified) {
        setResult("あなたはユニークな人間であることが証明されました！");
        setState("success");
      } else {
        setResult("検証に失敗しました");
        setState("error");
      }
    } catch (err) {
      setResult(`エラーが発生しました: ${err}`);
      setState("error");
    }
  };

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h2 className="text-lg font-bold mb-2">World ID 検証</h2>
      <p
        className="text-sm mb-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        World IDで「ユニークな人間」であることを証明します。
        Orb認証済みユーザーのみがパスできます。
      </p>

      {/* How it works */}
      <div
        className="rounded-xl p-4 mb-6 text-sm"
        style={{ background: "var(--color-bg)" }}
      >
        <p className="font-medium mb-2">仕組み:</p>
        <ol
          className="list-decimal list-inside space-y-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <li>「検証する」ボタンをタップ</li>
          <li>World AppがOrb検証を確認</li>
          <li>ゼロ知識証明がバックエンドに送信される</li>
          <li>バックエンドで proof を検証して結果を返す</li>
        </ol>
      </div>

      <button
        onClick={handleVerify}
        disabled={state === "loading"}
        className="w-full py-3 px-4 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        {state === "loading" ? "検証中..." : "検証する"}
      </button>

      {result && (
        <div
          className="mt-4 p-3 rounded-xl text-sm"
          style={{
            background:
              state === "success"
                ? "rgba(0, 184, 124, 0.1)"
                : "rgba(255, 80, 80, 0.1)",
            color: state === "success" ? "var(--color-success)" : "#ff5050",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
