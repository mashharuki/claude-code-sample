"use client";

import { useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { VerifyBlock } from "@/components/VerifyBlock";
import { PayBlock } from "@/components/PayBlock";
import { SignInBlock } from "@/components/SignInBlock";

type Tab = "verify" | "pay" | "signin";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("verify");
  const isInstalled = typeof window !== "undefined" && MiniKit.isInstalled();

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "verify", label: "World ID", emoji: "🌍" },
    { id: "pay", label: "Pay", emoji: "💰" },
    { id: "signin", label: "Sign In", emoji: "🔐" },
  ];

  return (
    <main className="max-w-md mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">My First MiniApp</h1>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          World Chain MiniApp チュートリアル
        </p>

        {/* Status Badge */}
        <div
          className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: isInstalled
              ? "rgba(0, 184, 124, 0.1)"
              : "rgba(255, 165, 0, 0.1)",
            color: isInstalled ? "var(--color-success)" : "#f0a030",
          }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{
              background: isInstalled ? "var(--color-success)" : "#f0a030",
            }}
          />
          {isInstalled ? "World App 接続中" : "ブラウザモード（デモ）"}
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className="flex rounded-xl p-1 mb-6"
        style={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all"
            style={{
              background:
                activeTab === tab.id ? "var(--color-accent)" : "transparent",
              color: activeTab === tab.id ? "#fff" : "var(--color-text-secondary)",
            }}
          >
            <span className="mr-1">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "verify" && <VerifyBlock />}
      {activeTab === "pay" && <PayBlock />}
      {activeTab === "signin" && <SignInBlock />}

      {/* Footer */}
      <p
        className="text-center text-xs mt-8"
        style={{ color: "var(--color-text-secondary)" }}
      >
        Built with MiniKit SDK on World Chain
      </p>
    </main>
  );
}
