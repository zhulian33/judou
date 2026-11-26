import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "句读JUDOU · 不会回的消息，我帮你读懂",
  description:
    "把对方的话、你自己的想法和对象资料放在一起看，给出多种可能解读、下一句预测和接下来该怎么走。",
  applicationName: "句读JUDOU",
  keywords: ["句读", "消息解读", "AI 回复", "潜台词", "沟通", "Qoder"],
  authors: [{ name: "句读JUDOU" }],
  openGraph: {
    title: "句读JUDOU · 不会回的消息，我帮你读懂",
    description: "先看懂，再回复。",
    type: "website",
    locale: "zh_CN",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F6F7F3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
