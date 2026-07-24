"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

interface SessionProviderProps {
  children: ReactNode;
}

export default function AuthProvider({
  children,
}: SessionProviderProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}