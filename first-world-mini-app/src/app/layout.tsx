import type { Metadata } from "next";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "My First MiniApp",
  description: "World Chain MiniApp Tutorial - World ID, Pay, Smart Contract",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <MiniKitProvider>
        <body className="min-h-screen">{children}</body>
      </MiniKitProvider>
    </html>
  );
}
