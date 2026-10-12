import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { preconnect } from "react-dom";

import { ToastProvider } from "@/components/ui/toast/ToastProvider";
import { API_BASE_URL } from "@/lib/env";
import { CANVAS_COLOR, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "resume tailoring",
    "AI resume tailor",
    "tailor resume to job description",
    "ATS resume checker",
    "ATS score",
    "resume keywords",
    "resume optimizer",
    "cover letter generator",
    "free resume tool",
  ],
  category: "productivity",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: CANVAS_COLOR,
  colorScheme: "dark",
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps): React.JSX.Element {
  // API calls are CORS requests without cookies, so they use the anonymous connection pool.
  preconnect(API_BASE_URL, { crossOrigin: "anonymous" });
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-canvas font-sans text-body text-ink">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
