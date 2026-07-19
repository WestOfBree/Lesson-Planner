"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCoachApp } from "../lib/coach-store";

const links = [
  { href: "/Landing", label: "Home" },
  { href: "/Landing/StudentPage", label: "Students" },
  { href: "/Landing/Classes", label: "Classes" },
  { href: "/Landing/ConditioningLibrary", label: "Conditioning" },
  { href: "/Landing/SkillsLibrary", label: "Skills" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentCoach, signOutCoach } = useCoachApp();

  return (
    <header className="sticky top-4 z-20 mx-auto w-full max-w-7xl rounded-3xl border border-white/60 bg-white/80 px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal-700">Aerial Coach</p>
          <h1 className="mt-1 text-xl font-semibold text-slate-950">
            {currentCoach ? `${currentCoach.displayName}'s workspace` : "Coach workspace"}
          </h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/Landing/CoachPage"
            aria-label="Open coach profile"
            className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-right transition hover:border-slate-300 hover:bg-white sm:block"
          >
            <p className="text-sm font-medium text-slate-950">{currentCoach?.displayName ?? "Signed out"}</p>
            <p className="text-xs text-slate-500">{currentCoach?.email ?? "Log back in to continue"}</p>
          </Link>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => {
              signOutCoach();
              router.push("/");
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
