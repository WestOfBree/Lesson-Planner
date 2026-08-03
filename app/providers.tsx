"use client";

import type { ReactNode } from "react";
import { CoachProvider } from "./lib/coach-store";
import AuthGate from "./auth-gate";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CoachProvider>
      <AuthGate>{children}</AuthGate>
    </CoachProvider>
  );
}
