import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "极速机场 - 高速稳定的网络服务",
  description: "选择最适合您的计划，三网高质量线路，稳定流媒体解锁",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        {children}
      </body>
    </html>
  );
}
