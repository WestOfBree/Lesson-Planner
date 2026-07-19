"use client";

import type { ReactNode } from "react";
import { CoachProvider } from "./lib/coach-store";

export default function Providers({ children }: { children: ReactNode }) {
  return <CoachProvider>{children}</CoachProvider>;
}
