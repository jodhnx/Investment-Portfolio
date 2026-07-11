import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvestTrack – Portfolio & Investment Rechner",
  description:
    "Persönliches Investment-Portfolio für Krypto, Aktien, ETFs und Gold",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>
          <AuthProvider>
            <StoreHydrator>
              <ThemeProvider>
                <Suspense>{children}</Suspense>
                <Toaster richColors position="bottom-right" />
              </ThemeProvider>
            </StoreHydrator>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
