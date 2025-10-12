// src/components/auth/AuthProvider.tsx
"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Session automatikus frissítése háttérben
      refetchInterval={5 * 60} // 5 percenként ellenőrzi
      refetchOnWindowFocus={true} // Ablak focus-kor frissít
      refetchWhenOffline={false} // Ne próbálja offline módban
    >
      {children}
    </SessionProvider>
  );
}
