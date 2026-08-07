"use client";

import type { ReactNode } from "react";
import { CoachProvider } from "./lib/coach-store";
import AuthGate from "./auth-gate";
import { ActionResponseProvider } from "./lib/action-response";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ActionResponseProvider>
      <CoachProvider>
        <AuthGate>{children}</AuthGate>
      </CoachProvider>
    </ActionResponseProvider>
  );
}
