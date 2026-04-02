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
  metadataBase: new URL('https://tasklyne.com'),
  title: {
    default: "TaskLyne | The command center for your startup",
    template: "%s | TaskLyne"
  },
  description: "The AI platform that unites decisions, goals, and intelligent workflows in one place.",
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "TaskLyne | The command center for your startup",
    description: "The AI platform that unites decisions, goals, and intelligent workflows in one place.",
    url: 'https://tasklyne.com',
    siteName: 'TaskLyne',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TaskLyne | The command center for your startup",
    description: "The AI platform that unites decisions, goals, and intelligent workflows in one place.",
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
