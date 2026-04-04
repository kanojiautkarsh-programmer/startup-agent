import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
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
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tasklyne.com'),
  title: {
    default: "TaskLyne | AI Chief of Staff for your startup",
    template: "%s | TaskLyne"
  },
  description: "The AI-powered command center for high-growth startups. Capture decisions, track goals, and surface context exactly when you need it.",
  applicationName: "TaskLyne",
  authors: [{ name: "TaskLyne Team" }],
  keywords: ["startup", "AI", "agent", "productivity", "knowledge management", "goals", "chief of staff"],
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://tasklyne.com',
    title: "TaskLyne | AI Chief of Staff for your startup",
    description: "The AI-powered command center for high-growth startups.",
    siteName: 'TaskLyne',
  },
  twitter: {
    card: 'summary_large_image',
    title: "TaskLyne | AI Chief of Staff for your startup",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${newsreader.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}




