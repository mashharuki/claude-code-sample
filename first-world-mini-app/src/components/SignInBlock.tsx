"use client";

import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

type AuthState = "idle" | "loading" | "authenticated" | "error";

export function SignInBlock() {
  const [state, setState] = useState<AuthState>("idle");
  const [address, setAddress] = useState<string>("");
  const [result, setResult] = useState<string>("");

  const handleSignIn = async () => {
    if (!MiniKit.isInstalled()) {
      setResult("World App内で実行してください");
      setState("error");
      return;
    }

    setState("loading");

    try {
      // 1. バックエンドからnonceを取得
      const nonceRes = await fetch("/api/nonce");
      const { nonce } = await nonceRes.json();

      // 2. ウォレット認証（SIWE）
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        statement: "My First MiniApp にサインインします",
        expirationTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      if (finalPayload.status === "error") {
        setResult(`エラー: ${finalPayload.error_code}`);
        setState("error");
        return;
      }

      // 3. バックエンドで署名を検証
      const verifyRes = await fetch("/api/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, nonce }),
      });

      const data = await verifyRes.json();

      if (data.authenticated) {
        setAddress(data.address);
        setResult("サインインに成功しました！");
        setState("authenticated");
      } else {
        setResult("署名の検証に失敗しました");
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
      <h2 className="text-lg font-bold mb-2">ウォレット認証</h2>
      <p
        className="text-sm mb-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        SIWE（Sign-In With Ethereum）でウォレット認証します。
        パスワード不要の安全なサインインです。
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
          <li>バックエンドが一意なnonce（ランダム文字列）を生成</li>
          <li>World Appがnonceを含むメッセージに署名</li>
          <li>バックエンドで署名を検証（ERC-1271対応）</li>
          <li>検証成功でセッション確立</li>
        </ol>
      </div>

      {state === "authenticated" ? (
        <div
          className="p-4 rounded-xl"
          style={{ background: "rgba(0, 184, 124, 0.1)" }}
        >
          <p
            className="text-sm font-medium"
            style={{ color: "var(--color-success)" }}
          >
            サインイン済み
          </p>
          <p className="font-mono text-xs mt-2 break-all opacity-80">
            {address}
          </p>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          disabled={state === "loading"}
          className="w-full py-3 px-4 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}
        >
          {state === "loading" ? "署名を確認中..." : "ウォレットでサインイン"}
        </button>
      )}

      {result && state === "error" && (
        <div
          className="mt-4 p-3 rounded-xl text-sm"
          style={{
            background: "rgba(255, 80, 80, 0.1)",
            color: "#ff5050",
          }}
        >
          {result}
        </div>
      )}
    </div>
  );
}
