import React from "react";
import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Portfolio & Blog",
    template: "%s | Portfolio",
  },
  description:
    "Portfolio and blog site with admin panel for content management.",
};

export const viewport: Viewport = {
  themeColor: "#0d9373",
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
