import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MythosOS - AI Co-Writer & Platform",
  description: "The ultimate AI-driven SaaS platform built on a Dynamic RAG Architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
