import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://startupagent.ai'),
  title: {
    default: "StartupAgent | The command center for your startup",
    template: "%s | StartupAgent"
  },
  description: "The AI-powered command center for high-growth startups. Unifying goals, decisions, and knowledge.",
  applicationName: "StartupAgent",
  authors: [{ name: "StartupAgent Team" }],
  keywords: ["startup", "AI", "agent", "productivity", "knowledge management", "goals"],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://startupagent.ai',
    title: "StartupAgent | The command center for your startup",
    description: "The AI-powered command center for high-growth startups.",
    siteName: 'StartupAgent',
  },
  twitter: {
    card: 'summary_large_image',
    title: "StartupAgent | The command center for your startup",
    description: "The AI-powered command center for high-growth startups.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
