import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/components/lightswind.css";
import { Toaster } from "@/components/ui/toaster";
import { MockDataProvider } from "@/hooks/use-mock-data";
import { UserProvider } from "@/hooks/use-user";
import * as Sentry from "@sentry/nextjs";

// Initialize Sentry only if DSN is provided
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 1.0,
    environment: process.env.NODE_ENV,
  });
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FairGo IVR System - AI-Powered Communication Platform",
  description: "Advanced AI-powered Interactive Voice Response system for Malayalam communication. Built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["FairGo IVR", "AI IVR", "Voice Response", "Malayalam AI", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI Communication", "React"],
  authors: [{ name: "FairGo IVR Team" }],
  openGraph: {
    title: "FairGo IVR System",
    description: "AI-powered communication platform for modern voice interactions",
    url: "https://fairgo-ivr.com",
    siteName: "FairGo IVR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FairGo IVR System",
    description: "AI-powered communication platform for modern voice interactions",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <UserProvider>
          <MockDataProvider>
            {children}
            <Toaster />
          </MockDataProvider>
        </UserProvider>
      </body>
    </html>
  );
}
