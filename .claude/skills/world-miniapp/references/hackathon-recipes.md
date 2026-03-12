# World MiniApp Hackathon Recipes

ハッカソンで素早くMiniAppを構築するための実装レシピ集。
コピー＆ペーストで使えるコードパターンを提供する。

## 目次

1. [5分でMiniApp起動](#5min-setup)
2. [World ID認証付きアプリ](#world-id-app)
3. [決済付きアプリ](#payment-app)
4. [NFT Mint アプリ](#nft-mint)
5. [投票アプリ（Sybil耐性）](#voting-app)
6. [ソーシャルアプリ](#social-app)
7. [ハッカソンTips](#hackathon-tips)

---

## 5分でMiniApp起動 {#5min-setup}

```bash
# 1. プロジェクト作成
npx @worldcoin/create-mini-app@latest my-hackathon-app

# 2. 環境変数設定
cd my-hackathon-app
cp .env.example .env.local
# APP_ID と DEV_PORTAL_API_KEY を設定

# 3. 起動
pnpm dev
```

Developer Portal（https://developer.worldcoin.org/）でアプリ登録が必要:
1. 新しいアプリを作成
2. App IDをコピー
3. API Keyを生成
4. 必要に応じてIncognito Actions、受取アドレスを設定

---

## World ID認証付きアプリ {#world-id-app}

「この機能はOrb認証済みユーザーのみ」というゲート機能。

### ページコンポーネント

```tsx
"use client";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useState } from "react";

export default function VerifyPage() {
  const [verified, setVerified] = useState(false);

  const handleVerify = async () => {
    if (!MiniKit.isInstalled()) return;

    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action: "my-action",
      verification_level: VerificationLevel.Orb,
    });

    if (finalPayload.status === "success") {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          action: "my-action",
        }),
      });
      const data = await res.json();
      if (data.verified) setVerified(true);
    }
  };

  if (verified) return <div>Verified human! Welcome.</div>;
  return <button onClick={handleVerify}>Verify with World ID</button>;
}
```

### APIルート

```typescript
// app/api/verify/route.ts
import { verifyCloudProof } from "@worldcoin/minikit-js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { payload, action } = await req.json();
  const verifyRes = await verifyCloudProof(
    payload,
    process.env.APP_ID as `app_${string}`,
    action
  );
  return NextResponse.json({ verified: verifyRes.success });
}
```

---

## 決済付きアプリ {#payment-app}

WLD/USDCでの課金機能。

```tsx
"use client";
import { MiniKit, Tokens, tokenToDecimals } from "@worldcoin/minikit-js";
import { v4 as uuidv4 } from "uuid";

export default function PaymentPage() {
  const handlePay = async () => {
    if (!MiniKit.isInstalled()) return;

    const reference = uuidv4();

    const { finalPayload } = await MiniKit.commandsAsync.pay({
      reference,
      to: "0xYourWalletAddress",
      tokens: [
        {
          symbol: Tokens.WLD,
          token_amount: tokenToDecimals(0.5, Tokens.WLD).toString(),
        },
      ],
      description: "Premium Feature Access",
    });

    if (finalPayload.status === "success") {
      // バックエンドで検証
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payload: finalPayload, reference }),
      });
      const data = await res.json();
      if (data.success) {
        // 決済成功 → 機能アンロック
      }
    }
  };

  return <button onClick={handlePay}>Pay 0.5 WLD</button>;
}
```

---

## NFT Mintアプリ {#nft-mint}

スマートコントラクトを呼び出してNFTをmintする例。

```tsx
"use client";
import { MiniKit } from "@worldcoin/minikit-js";

const NFT_CONTRACT = "0xYourNFTContract";
const NFT_ABI = [
  {
    inputs: [{ name: "to", type: "address" }],
    name: "mint",
    outputs: [{ name: "tokenId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function MintPage() {
  const handleMint = async () => {
    if (!MiniKit.isInstalled()) return;

    const { finalPayload } = await MiniKit.commandsAsync.sendTransaction({
      transaction: [
        {
          address: NFT_CONTRACT,
          abi: NFT_ABI,
          functionName: "mint",
          args: [MiniKit.walletAddress],
        },
      ],
    });

    if (finalPayload.status === "success") {
      console.log("Minted! TX:", finalPayload.transaction_id);
      // 成功UI表示
    }
  };

  return <button onClick={handleMint}>Mint NFT</button>;
}
```

---

## 投票アプリ（Sybil耐性） {#voting-app}

World IDで1人1票を保証する投票システム。

```tsx
"use client";
import { MiniKit, VerificationLevel } from "@worldcoin/minikit-js";
import { useState } from "react";

type Candidate = { id: string; name: string; votes: number };

export default function VotePage() {
  const [candidates] = useState<Candidate[]>([
    { id: "a", name: "Option A", votes: 0 },
    { id: "b", name: "Option B", votes: 0 },
  ]);

  const vote = async (candidateId: string) => {
    if (!MiniKit.isInstalled()) return;

    // World IDで人間であることを証明（action + signalで1人1票）
    const { finalPayload } = await MiniKit.commandsAsync.verify({
      action: "vote-2024",
      signal: candidateId,  // 投票先をsignalに含める
      verification_level: VerificationLevel.Orb,
    });

    if (finalPayload.status === "success") {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: finalPayload,
          action: "vote-2024",
          signal: candidateId,
          candidateId,
        }),
      });
      // 結果を反映
    }
  };

  return (
    <div>
      <h1>Vote</h1>
      {candidates.map((c) => (
        <button key={c.id} onClick={() => vote(c.id)}>
          {c.name} ({c.votes} votes)
        </button>
      ))}
    </div>
  );
}
```

バックエンドでは `nullifier_hash` をDBに保存して重複投票を防ぐ:

```typescript
// app/api/vote/route.ts
import { verifyCloudProof } from "@worldcoin/minikit-js";

// メモリDB（本番ではDB使用）
const votedNullifiers = new Set<string>();

export async function POST(req: Request) {
  const { payload, action, signal, candidateId } = await req.json();

  // 1. World ID検証
  const verifyRes = await verifyCloudProof(
    payload,
    process.env.APP_ID as `app_${string}`,
    action,
    signal
  );

  if (!verifyRes.success) {
    return Response.json({ error: "Verification failed" }, { status: 400 });
  }

  // 2. 重複チェック（nullifier_hashはaction毎にユーザー固有）
  if (votedNullifiers.has(payload.nullifier_hash)) {
    return Response.json({ error: "Already voted" }, { status: 400 });
  }

  // 3. 投票記録
  votedNullifiers.add(payload.nullifier_hash);
  // candidateIdの投票数をインクリメント

  return Response.json({ success: true });
}
```

---

## ソーシャルアプリ {#social-app}

連絡先共有 + チャット + 通知を組み合わせたソーシャル機能。

```tsx
"use client";
import { MiniKit, Permission } from "@worldcoin/minikit-js";

export default function SocialPage() {
  // 通知権限リクエスト
  const enableNotifications = async () => {
    const { finalPayload } = await MiniKit.commandsAsync.requestPermission({
      permission: Permission.Notifications,
    });
    console.log("Permission:", finalPayload.status);
  };

  // 友達を招待
  const inviteFriends = async () => {
    const { finalPayload } = await MiniKit.commandsAsync.shareContacts({
      isMultiSelectEnabled: true,
      inviteMessage: "Join me on this awesome app!",
    });

    if (finalPayload.status === "success") {
      for (const contact of finalPayload.contacts) {
        // 招待リンクをチャットで送信
        await MiniKit.commandsAsync.chat({
          message: "Hey! Check out this app: https://your-app.com",
          to: [contact.username],
        });
      }
    }
  };

  // アプリ共有
  const shareApp = async () => {
    await MiniKit.commandsAsync.share({
      title: "My Awesome App",
      text: "Check out this cool MiniApp!",
      url: "https://your-app.com",
    });
  };

  return (
    <div>
      <button onClick={enableNotifications}>Enable Notifications</button>
      <button onClick={inviteFriends}>Invite Friends</button>
      <button onClick={shareApp}>Share App</button>
    </div>
  );
}
```

---

## ハッカソンTips {#hackathon-tips}

### 審査で評価されやすいポイント

1. **World IDの活用度** — Proof of Personhoodをどう活かしているか
2. **UX** — World App内でネイティブに感じる体験
3. **オンチェーン活用** — sendTransactionでWorld Chainを活用
4. **ソーシャル性** — 連絡先共有・チャット・通知の活用
5. **創造性** — World IDだからこそ実現できる新しいユースケース

### よくあるハッカソンのアイデアパターン

| パターン | 概要 | 主要コマンド |
|---------|------|-------------|
| Sybil耐性投票/ガバナンス | 1人1票保証 | verify + sendTransaction |
| UBI/エアドロップ | 1人1回の受取保証 | verify + pay/sendTransaction |
| Reputation System | 検証済み人間のスコアリング | verify + sendTransaction |
| Marketplace | World Pay決済 | pay + verify |
| Social Game | 友達招待・対戦 | shareContacts + chat + verify |
| DeFi | World ID認証付きDeFi | verify + sendTransaction + permit2 |

### 開発スピードを上げるコツ

1. `create-mini-app` テンプレートを使う（環境構築0分）
2. Developer Portalの設定を最初にやる（Incognito Actions、受取アドレス）
3. World App Simulatorでテストする
4. `MiniKit.isInstalled()` でWorld App外のフォールバックUIも用意
5. `tokenToDecimals()` ユーティリティを忘れずに使う
6. バックエンド検証は必ず実装する（フロントだけでは不十分）
