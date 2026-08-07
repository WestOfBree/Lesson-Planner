"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCoachApp } from "../lib/coach-store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSun, faMoon, faBars } from "@fortawesome/free-solid-svg-icons";
import FeedbackWidget from "./FeedbackWidget";

const links = [
  { href: "/Landing", label: "Home" },
  { href: "/Landing/Students", label: "Students" },
  { href: "/Landing/Classes", label: "Classes" },
  { href: "/Landing/LessonPlanner", label: "Lesson Planner" },
  { href: "/Landing/ConditioningLibrary", label: "Conditioning" },
  { href: "/Landing/SkillsLibrary", label: "Skills" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentCoach, signOutCoach } = useCoachApp();

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const savedTheme = window.localStorage.getItem("aerial-coach-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return savedTheme === "dark" || savedTheme === "light" ? savedTheme : prefersDark ? "dark" : "light";
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("aerial-coach-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    type ViewTransitionDoc = Document & {
      startViewTransition?: (update: () => void) => { finished: Promise<void> };
    };

    const doc = document as ViewTransitionDoc;
    if (typeof doc.startViewTransition === "function") {
      doc.startViewTransition(() => {
        setTheme(nextTheme);
      });
      return;
    }

    document.documentElement.classList.add("theme-transitioning");
    window.requestAnimationFrame(() => {
      setTheme(nextTheme);
      window.setTimeout(() => {
        document.documentElement.classList.remove("theme-transitioning");
      }, 320);
    });
  };

  return (
    <>
    <div className="sticky top-4 z-20 mx-auto flex w-full max-w-7xl flex-col items-start gap-3 lg:static">
      <div className="flex w-full items-center justify-between lg:justify-end">
        <button
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="coach-main-navigation"
          className="cursor-pointer rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_10px_24px_rgba(79,70,229,0.16)] transition hover:border-indigo-300 hover:bg-indigo-50 lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          <FontAwesomeIcon icon={faBars} className="h-5 w-5" />
        </button>

        <button
        type="button"
        suppressHydrationWarning
        aria-pressed={theme === "dark"}
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        className="theme-toggle group relative flex h-11 w-15 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-200/90 shadow-[0_10px_24px_rgba(79,70,229,0.24)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 lg:fixed lg:top-4 lg:right-4 lg:z-30"
        onClick={toggleTheme}
      >
        <span
          aria-hidden
          suppressHydrationWarning
          className={`absolute inset-0 ${
            theme === "dark"
              ? "bg-linear-to-br from-slate-800 via-slate-900 to-indigo-950"
              : "bg-linear-to-br from-amber-200 via-yellow-100 to-sky-200"
          }`}
        />
        <span
          aria-hidden
          suppressHydrationWarning
          className={`theme-toggle-thumb absolute left-1 top-1 flex h-9 w-9 items-center justify-center rounded-full text-sm shadow-[0_8px_18px_rgba(15,23,42,0.22)] ${
            theme === "dark"
              ? "translate-x-5 bg-slate-900 text-indigo-200"
              : "translate-x-0 bg-white text-amber-600"
          }`}
        >
          <FontAwesomeIcon icon={theme === "dark" ? faMoon : faSun} />
        </span>
      </button>
      </div>
      <header
        className={`${isMenuOpen ? "block" : "hidden"} w-full rounded-3xl border border-indigo-200/70 bg-white/88 px-4 py-4 shadow-[0_18px_46px_rgba(79,70,229,0.16)] backdrop-blur dark:border-indigo-300/40 dark:bg-slate-900/80 sm:px-6 lg:block`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-700">Aerial Coach</p>
              <h1 className="mt-1 text-xl font-semibold text-slate-950">
                {currentCoach ? `${currentCoach.displayName}'s workspace` : "Coach workspace"}
              </h1>
            </div>
          </div>

          <nav
            id="coach-main-navigation"
            className={`${isMenuOpen ? "grid" : "hidden"}  w-full grid-cols-3 gap-2 lg:flex lg:w-auto lg:flex-wrap lg:justify-start`}
          >
            {links.map((link) => {
              const isHomeLink = link.href === "/Landing";
              const isActive = isHomeLink
                ? pathname === "/Landing" || pathname === "/Landing/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex min-h-11 items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white shadow-[0_10px_24px_rgba(15,23,42,0.32)]"
                      : "bg-indigo-50 text-slate-700 hover:bg-indigo-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={`${isMenuOpen ? "flex" : "hidden"} items-center justify-between gap-3 lg:flex`}>
            <Link
              href="/Landing/CoachPage"
              aria-label="Open coach profile"
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col rounded-2xl border border-indigo-200/70 bg-indigo-50/70 px-3 py-2 text-left transition hover:border-indigo-300 hover:bg-white sm:block sm:text-right"
            >
              <p className="text-sm font-medium text-slate-950">{currentCoach?.displayName ?? "Signed out"}</p>
              <p className="text-xs text-slate-500">{currentCoach?.email ?? "Log back in to continue"}</p>
            </Link>
            <button
              type="button"
              className="cursor-pointer rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-300/40 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
              onClick={() => {
                setIsMenuOpen(false);
                signOutCoach();
                router.push("/");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

     
    </div>
    <FeedbackWidget />
    </>
  );
}
