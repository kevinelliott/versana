import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: '%s | Versana',
    default: 'Versana - AI Co-Writer for Fiction Authors',
  },
  description: "The ultimate AI-driven storytelling platform built on a Dynamic RAG Architecture. Turn a blank page into a bestseller.",
  keywords: ["AI writing", "fiction co-writer", "storytelling software", "novel writing app", "author tools"],
  openGraph: {
    title: 'Versana - AI Co-Writer for Fiction Authors',
    description: 'The ultimate AI-driven storytelling platform built on a Dynamic RAG Architecture.',
    url: 'https://versana.app',
    siteName: 'Versana',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Versana - AI Co-Writer for Fiction Authors',
    description: 'Turn a blank page into a bestseller with our pro-author platform.',
    creator: '@VersanaApp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
