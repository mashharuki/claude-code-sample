"use client";

import { useState } from "react";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
import { v4 as uuidv4 } from "uuid";

type PayState = "idle" | "loading" | "success" | "error";

// デモ用の受取アドレス（本番では自分のアドレスに変更）
const RECEIVER_ADDRESS = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";

export function PayBlock() {
  const [state, setState] = useState<PayState>("idle");
  const [result, setResult] = useState<string>("");
  const [txId, setTxId] = useState<string>("");
  const [selectedToken, setSelectedToken] = useState<Tokens>(Tokens.WLD);
  const [amount, setAmount] = useState<string>("0.1");

  const handlePay = async () => {
    if (!MiniKit.isInstalled()) {
      setResult("World App内で実行してください");
      setState("error");
      return;
    }

    setState("loading");

    try {
      const reference = uuidv4();

      const { finalPayload } = await MiniKit.commandsAsync.pay({
        reference,
        to: RECEIVER_ADDRESS,
        tokens: [
          {
            symbol: selectedToken,
            token_amount: tokenToDecimals(
              Number(amount),
              selectedToken
            ).toString(),
          },
        ],
        description: `Tutorial Payment - ${amount} ${selectedToken}`,
      });

      if (finalPayload.status === "error") {
        setResult(`エラー: ${finalPayload.error_code}`);
        setState("error");
        return;
      }

      // バックエンドでトランザクション検証
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          reference,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTxId(finalPayload.transaction_id);
        setResult("決済が完了しました！");
        setState("success");
      } else {
        setResult("決済の検証に失敗しました");
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
      <h2 className="text-lg font-bold mb-2">トークン決済</h2>
      <p
        className="text-sm mb-6"
        style={{ color: "var(--color-text-secondary)" }}
      >
        WLD または USDC で支払いを実行します。World Chain上で即座に処理されます。
      </p>

      {/* Token Selector */}
      <div className="flex gap-2 mb-4">
        {[Tokens.WLD, Tokens.USDC].map((token) => (
          <button
            key={token}
            onClick={() => setSelectedToken(token)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background:
                selectedToken === token
                  ? "var(--color-accent)"
                  : "var(--color-bg)",
              color: selectedToken === token ? "#fff" : "var(--color-text)",
              border: "1px solid var(--color-border)",
            }}
          >
            {token}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label
          className="block text-sm mb-1.5"
          style={{ color: "var(--color-text-secondary)" }}
        >
          金額
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.1"
          step="0.1"
          className="w-full py-3 px-4 rounded-xl text-sm"
          style={{
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          }}
        />
      </div>

      <button
        onClick={handlePay}
        disabled={state === "loading"}
        className="w-full py-3 px-4 rounded-xl text-white font-medium transition-opacity disabled:opacity-50"
        style={{ background: "var(--color-accent)" }}
      >
        {state === "loading"
          ? "処理中..."
          : `${amount} ${selectedToken} を送金する`}
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
          <p>{result}</p>
          {txId && (
            <p className="mt-1 font-mono text-xs break-all opacity-80">
              TX: {txId}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
