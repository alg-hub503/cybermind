import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import { getLocale } from "@/lib/i18n/get-locale";

export const metadata: Metadata = {
  title: "CyberMind",
  description: "CyberMind SaaS",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body>
        <AuthProvider>
          {children}

          <Toaster
            position="top-right"
            richColors
            closeButton
          />
        </AuthProvider>
      </body>
    </html>
  );
}
