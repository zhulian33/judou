import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "句读 · 桌面黄历",
  description: "一块只显示今日黄历、打开就能回的桌面小配件。",
};

export default function WidgetLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
