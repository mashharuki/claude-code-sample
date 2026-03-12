# MiniKit API Reference

MiniKit SDKの全コマンド・型定義・エラーコードの詳細リファレンス。

## 目次

1. [Verify（World ID検証）](#verify)
2. [Wallet Auth（ウォレット認証）](#wallet-auth)
3. [Pay（決済）](#pay)
4. [Send Transaction（トランザクション送信）](#send-transaction)
5. [Sign Message（メッセージ署名）](#sign-message)
6. [Sign Typed Data（型付きデータ署名）](#sign-typed-data)
7. [Share Contacts（連絡先共有）](#share-contacts)
8. [Share（ネイティブ共有）](#share)
9. [Chat（チャットメッセージ）](#chat)
10. [Request Permission（権限リクエスト）](#request-permission)
11. [Get Permissions（権限確認）](#get-permissions)
12. [Send Haptic Feedback（ハプティクス）](#send-haptic-feedback)
13. [Utility関数](#utility)
14. [エラーコード一覧](#error-codes)
15. [トークンアドレス一覧](#token-addresses)

---

## Verify

World IDのIncognito Actionsを使ったユニーク人間検証。

### Input

```typescript
type VerifyCommandInput = {
  action: string;                              // Developer Portalで設定したaction名
  signal?: string;                             // オプション：追加シグナルデータ
  verification_level?: VerificationLevel;      // Orb | Device（デフォルト: Orb）
};

enum VerificationLevel {
  Orb = "orb",
  Device = "device",
}
```

### Success Payload

```typescript
type MiniAppVerifyActionSuccessPayload = {
  status: "success";
  proof: string;
  merkle_root: string;
  nullifier_hash: string;        // ユーザーの匿名ID（action毎に一意）
  verification_level: VerificationLevel;
  version: number;
};
```

### Backend Verification

```typescript
import { verifyCloudProof, IVerifyResponse } from "@worldcoin/minikit-js";

const verifyRes: IVerifyResponse = await verifyCloudProof(
  payload,                                    // フロントエンドからのpayload
  process.env.APP_ID as `app_${string}`,      // app_xxxxx形式
  action,                                     // action名
  signal                                      // オプション
);
// verifyRes.success: boolean
```

---

## Wallet Auth

SIWE（Sign-In With Ethereum / EIP-4361）によるウォレット認証。

### Input

```typescript
interface WalletAuthInput {
  nonce: string;             // 最低8文字の英数字
  expirationTime?: Date;     // 署名の有効期限
  statement?: string;        // ユーザーに表示するメッセージ
  requestId?: string;        // リクエスト識別子
  notBefore?: Date;          // 署名が有効になる時刻
}
```

### Success Payload

```typescript
type MiniAppWalletAuthSuccessPayload = {
  status: "success";
  message: string;           // SIWEメッセージ全文
  signature: string;         // 署名
  address: string;           // ウォレットアドレス
  version: number;
};
```

### Backend Verification

```typescript
import { verifySiweMessage } from "@worldcoin/minikit-js";

const isValid: boolean = await verifySiweMessage(payload, nonce);
```

スマートウォレット対応（ERC-1271, EIP-6492）。

---

## Pay

WLD/USDCトークンでの決済。

### Input

```typescript
type PayCommandInput = {
  reference: string;           // UUID推奨、一意な参照ID
  to: string;                  // 受取アドレス（Developer Portalでホワイトリスト登録推奨）
  tokens: TokensPayload[];     // 支払いトークン配列
  network?: Network;           // オプション（デフォルト: World Chain）
  description: string;         // 決済の説明文
};

type TokensPayload = {
  symbol: Tokens;              // Tokens.WLD | Tokens.USDC
  token_amount: string;        // tokenToDecimals()で変換した文字列
};

enum Tokens {
  WLD = "WLD",
  USDC = "USDC",
}
```

### Success Payload

```typescript
type MiniAppPaymentSuccessPayload = {
  status: "success";
  transaction_id: string;     // トランザクションハッシュ
  reference: string;
  from: string;
  chain: string;
  timestamp: string;
  version: number;
};
```

### Backend Verification API

```
GET https://developer.worldcoin.org/api/v2/minikit/transaction/{transaction_id}?type=transaction
Authorization: Bearer {DEV_PORTAL_API_KEY}
```

### 制約
- 最小金額: $0.1/トランザクション
- 1日500件の無料トランザクション/ユーザー
- ガスリミット: 1,000,000
- インドネシア・フィリピンでは利用不可

---

## Send Transaction

スマートコントラクト関数の呼び出し。複数トランザクションのMulticall対応。

### Input

```typescript
type SendTransactionInput = {
  transaction: Transaction[];    // 複数トランザクション（Multicall）
  permit2?: Permit2[];           // オプション：Permit2署名転送
  formatPayload?: boolean;       // オプション
};

type Transaction = {
  address: string;               // コントラクトアドレス
  abi: Abi | readonly unknown[]; // コントラクトABI
  functionName: string;          // 呼び出す関数名
  value?: string;                // hex形式のwei値（payable関数用）
  args: any[];                   // 関数引数
};

type Permit2 = {
  permitted: {
    token: string;               // ERC-20トークンアドレス
    amount: string;              // 許可するトークン量
  };
  spender: string;               // 支出者アドレス（通常はコントラクト）
  nonce: string;                 // ユニークなnonce
  deadline: string;              // UNIX timestamp（秒）
};
```

### Permit2プレースホルダー

トランザクションのargs内で `"PERMIT2_SIGNATURE_PLACEHOLDER_{index}"` を使用。
indexはpermit2配列のインデックスに対応。World Appが自動的に正しい署名で置換する。

### Success Payload

```typescript
type MiniAppSendTransactionSuccessPayload = {
  status: "success";
  transaction_id: string;
  version: number;
};
```

---

## Sign Message

EIP-191準拠のメッセージ署名。

### Input

```typescript
type SignMessageInput = {
  message: string;
};
```

### Success Payload

```typescript
type MiniAppSignMessageSuccessPayload = {
  status: "success";
  signature: string;
  address: string;
  version: number;
};
```

---

## Sign Typed Data

EIP-712準拠の型付きデータ署名。

### Input

```typescript
type SignTypedDataInput = {
  types: Record<string, TypedDataField[]>;
  primaryType: string;
  domain: TypedDataDomain;
  message: Record<string, any>;
};
```

---

## Share Contacts

World Appの連絡先からユーザーを選択。

### Input

```typescript
type ShareContactsInput = {
  isMultiSelectEnabled: boolean;   // 複数選択の可否
  inviteMessage?: string;          // 招待メッセージ
};
```

### Success Payload

```typescript
type MiniAppShareContactsSuccessPayload = {
  status: "success";
  contacts: Array<{
    username: string;
    walletAddress: string;
    profilePictureUrl: string | null;
  }>;
  timestamp: string;
  version: number;
};
```

---

## Share

OS標準の共有ダイアログを表示。

```typescript
type SharePayload = {
  files: File[];        // 共有ファイル
  title?: string;
  text?: string;
  url?: string;
};
```

---

## Chat

World Chat経由でメッセージ送信。

```typescript
type ChatInput = {
  message: string;
  to?: string[];        // ユーザー名またはアドレスの配列
};
```

エラーコード: `user_rejected`, `send_failed`, `generic_error`

---

## Request Permission

権限をリクエスト（1回のみ表示）。

```typescript
type RequestPermissionPayload = {
  permission: Permission;
};

enum Permission {
  Notifications = "notifications",
  Microphone = "microphone",
  Contacts = "contacts",
}
```

エラーコード: `user_rejected`, `generic_error`, `already_requested`, `permission_disabled`, `already_granted`, `unsupported_permission`, `world_app_permission_not_enabled`

---

## Get Permissions

現在の権限状態を取得。

```typescript
type MiniAppGetPermissionsSuccessPayload = {
  status: "success";
  permissions: Permission[];
  version: number;
};
```

---

## Send Haptic Feedback

触覚フィードバック（MiniKit 1.7.1+, World App 2.8.7602+）。

```typescript
type SendHapticFeedbackInput = {
  hapticsType: "impact" | "notification" | "selectionChanged";
  style?: "light" | "medium" | "heavy" | "success" | "warning" | "error";
};
```

`hapticsType`によって有効な`style`が異なる:
- `impact`: `light`, `medium`, `heavy`
- `notification`: `success`, `warning`, `error`
- `selectionChanged`: style不要

---

## Utility

### tokenToDecimals

```typescript
import { tokenToDecimals, Tokens } from "@worldcoin/minikit-js";

tokenToDecimals(1, Tokens.WLD);    // BigInt (18 decimals)
tokenToDecimals(5, Tokens.USDC);   // BigInt (6 decimals)
```

### MiniKit静的メソッド

```typescript
MiniKit.isInstalled(): boolean;            // World App内で実行中か
MiniKit.walletAddress: string;             // ユーザーのウォレットアドレス
MiniKit.getUserByAddress(address): User;   // アドレスからユーザー情報取得
MiniKit.getUserByUsername(username): User;  // ユーザー名から情報取得
MiniKit.showProfileCard({ username?, walletAddress? }): void;  // プロフィール表示
```

### User型

```typescript
type User = {
  walletAddress?: string;
  username?: string;
  profilePictureUrl?: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  optedIntoOptionalAnalytics?: boolean;
  worldAppVersion?: number;
  deviceOS?: string;
};
```

---

## Error Codes

全コマンド共通のエラーコード:

| コード | 説明 |
|--------|------|
| `user_rejected` | ユーザーが操作をキャンセル |
| `generic_error` | 一般的なエラー |
| `input_error` | 入力パラメータが不正 |

コマンド固有のエラーコード:

| コマンド | コード | 説明 |
|---------|--------|------|
| verify | `verification_rejected` | 検証が拒否された |
| verify | `max_verifications_reached` | 最大検証回数に到達 |
| pay | `payment_rejected` | 決済が拒否された |
| pay | `insufficient_balance` | 残高不足 |
| requestPermission | `already_requested` | 既にリクエスト済み |
| requestPermission | `already_granted` | 既に許可済み |
| requestPermission | `permission_disabled` | 権限が無効化されている |
| chat | `send_failed` | 送信失敗 |

---

## Token Addresses

World Chain上の主要トークンアドレス:

| トークン | アドレス |
|---------|---------|
| WLD | `0x2cFc85d8E48F8EAB294be644d9E25C3030863003` |
| USDC | Developer Portalで確認 |

---

## Notifications API

### 送信エンドポイント

```
POST https://developer.worldcoin.org/api/v2/minikit/send-notification
Authorization: Bearer {DEV_PORTAL_API_KEY}
Content-Type: application/json

{
  "app_id": "app_xxxxx",
  "wallet_addresses": ["0x123..."],
  "localisations": [
    {
      "language": "en",
      "title": "Title",
      "message": "Message with ${username}"
    }
  ],
  "mini_app_path": "worldapp://mini-app?app_id=app_xxxxx&path=/route"
}
```

対応言語: `en`, `es`, `fr`, `de`, `ja`, `ko`, `zh`, `pt`, `ru` 他

変数補間: `${username}` が利用可能

### レート制限
- 未認証アプリ: 4時間あたり40通知
- 認証済みアプリ: 制限緩和（Developer Portal参照）

---

## Payment Verification API

### トランザクション確認

```
GET https://developer.worldcoin.org/api/v2/minikit/transaction/{transaction_id}?type=transaction
Authorization: Bearer {DEV_PORTAL_API_KEY}
```

レスポンス:
```json
{
  "transaction_id": "0x...",
  "reference": "uuid-string",
  "status": "mined",
  "from": "0x...",
  "to": "0x...",
  "chain": "worldchain",
  "timestamp": "2024-01-01T00:00:00Z"
}
```
