"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCoachApp } from "./lib/coach-store";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { currentCoach, isHydrating } = useCoachApp();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isHydrating) {
      return;
    }

    const isLoginRoute = pathname === "/";

    if (!currentCoach && !isLoginRoute) {
      router.replace("/");
      return;
    }

    if (currentCoach && isLoginRoute) {
      router.replace("/Landing");
    }
  }, [currentCoach, isHydrating, pathname, router]);

  if (isHydrating) {
    return null;
  }

  if (!currentCoach && pathname !== "/") {
    return null;
  }

  if (currentCoach && pathname === "/") {
    return null;
  }

  return <>{children}</>;
}
