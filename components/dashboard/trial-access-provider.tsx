"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { TrialAccessResult } from "@/lib/trial-status";

const TrialAccessContext = createContext<TrialAccessResult | null>(null);

export function useTrialAccess(): TrialAccessResult | null {
  return useContext(TrialAccessContext);
}

interface TrialAccessSetterProps {
  access: TrialAccessResult;
}

export function TrialAccessSetter({ access }: TrialAccessSetterProps) {
  const setAccess = useContext(TrialAccessSetterContext);

  useEffect(() => {
    if (setAccess) {
      setAccess(access);
    }
  }, [access, setAccess]);

  return null;
}

const TrialAccessSetterContext = createContext<
  ((access: TrialAccessResult) => void) | null
>(null);

export default function TrialAccessProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [access, setAccess] = useState<TrialAccessResult | null>(null);

  return (
    <TrialAccessContext.Provider value={access}>
      <TrialAccessSetterContext.Provider value={setAccess}>
        {children}
      </TrialAccessSetterContext.Provider>
    </TrialAccessContext.Provider>
  );
}
