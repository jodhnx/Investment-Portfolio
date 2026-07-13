import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { Toaster } from "@/components/ui/sonner";
import {
  APP_APPLE_TOUCH,
  APP_DESCRIPTION,
  APP_FAVICON,
  APP_FAVICON_16,
  APP_FAVICON_32,
  APP_ICON,
  APP_ICON_192,
  APP_ICON_512,
  APP_NAME,
  APP_TAGLINE,
} from "@/config/brand";
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
  title: `${APP_NAME} – ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: APP_FAVICON, sizes: "any" },
      { url: APP_FAVICON_16, sizes: "16x16", type: "image/png" },
      { url: APP_FAVICON_32, sizes: "32x32", type: "image/png" },
      { url: APP_ICON_192, sizes: "192x192", type: "image/png" },
      { url: APP_ICON_512, sizes: "512x512", type: "image/png" },
      { url: APP_ICON, type: "image/svg+xml" },
    ],
    apple: [{ url: APP_APPLE_TOUCH, sizes: "180x180", type: "image/png" }],
    shortcut: [{ url: APP_FAVICON }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f172a" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
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
      <body className="min-h-[100dvh] flex flex-col overscroll-none">
        <TooltipProvider>
          <AuthProvider>
            <StoreHydrator>
              <ThemeProvider>
                <Suspense>{children}</Suspense>
                <Toaster position="bottom-center" />
              </ThemeProvider>
            </StoreHydrator>
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
