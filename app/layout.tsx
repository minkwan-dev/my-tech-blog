import React from "react";
import type { Metadata, Viewport } from "next";

import "./globals.css";

const favicon =
  "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%233d8b6e'/><text x='50' y='72' font-size='60' font-weight='bold' text-anchor='middle' fill='white' font-family='monospace'>M</text></svg>";

export const metadata: Metadata = {
  title: {
    default: "Minkwan",
    template: "%s | Minkwan",
  },
  description:
    "Frontend Developer passionate about building clean, data-driven web experiences.",
  icons: { icon: favicon },
};

export const viewport: Viewport = {
  themeColor: "#3d8b6e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
