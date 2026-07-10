import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";
import AuthProvider from "@/components/providers/session-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "CyberMind",
  description: "CyberMind SaaS",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en">
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