"use client";

import Link from "next/link";
import Navbar from "../UI/Navbar";
import { useCoachApp } from "@/app/lib/coach-store";
import type { LibraryItem, SkillLibraryItem } from "@/app/lib/coach-data";

const quickLinks = [
  {
    href: "/Landing/Students",
    title: "Students",
    description: "Create profiles, track progress, and assign class rosters.",
  },
  {
    href: "/Landing/Classes",
    title: "Classes",
    description: "Organize students into cohorts and keep schedules visible.",
  },
  {
    href: "/Landing/LessonPlanner",
    title: "Lesson planner",
    description: "Create class-date lesson plans and keep assignments visible for students.",
  },
  {
    href: "/Landing/ConditioningLibrary",
    title: "Conditioning library",
    description: "Pull from prefilled strength work or add your own exercises.",
  },
  {
    href: "/Landing/SkillsLibrary",
    title: "Skills library",
    description: "Store aerial skill progressions and lesson-ready cues.",
  },
];

export default function LandingPage() {
  const {
    currentCoach,
    isHydrating,
    hydrationError,
    classes,
    students,
    conditioningExercises,
    skillExercises,
    lessonPlan,
    clearLessonPlan,
  } = useCoachApp();

  const selectedConditioning = conditioningExercises.filter((item: LibraryItem) => lessonPlan.conditioningIds.includes(item.id));
  const selectedSkills = skillExercises.filter((item: SkillLibraryItem) => lessonPlan.skillIds.includes(item.id));
  const recentStudents = [...students].slice(0, 3);
  const recentClasses = [...classes].slice(0, 3);
  const boardStats = [
    { label: "Students", value: students.length, hint: "active profiles" },
    { label: "Classes", value: classes.length, hint: "running groups" },
    { label: "Conditioning", value: conditioningExercises.length, hint: "drills ready" },
    { label: "Skills", value: skillExercises.length, hint: "skill cards" },
  ];

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      {isHydrating ? (
        <main className="mx-auto mt-6 w-full max-w-7xl lg:mt-8">
          <section className="rounded-[1.75rem] border border-cyan-200 bg-cyan-50/80 p-6 text-cyan-900 shadow-[0_16px_40px_rgba(14,116,144,0.12)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-700">Syncing workspace</p>
            <h2 className="mt-3 text-2xl font-semibold">Loading your Firestore coaching data...</h2>
            <p className="mt-2 text-sm leading-6 text-cyan-800">
              Hang tight while classes, students, lesson plans, and libraries are pulled from the cloud.
            </p>
          </section>
        </main>
      ) : null}

      {hydrationError ? (
        <main className="mx-auto mt-6 w-full max-w-7xl lg:mt-8">
          <section className="rounded-[1.75rem] border border-rose-200 bg-rose-50/90 p-6 text-rose-900 shadow-[0_16px_40px_rgba(244,63,94,0.12)] sm:p-8">
            <p className="text-xs uppercase tracking-[0.32em] text-rose-700">Sync issue</p>
            <h2 className="mt-3 text-2xl font-semibold">Unable to fully load Firestore data</h2>
            <p className="mt-2 text-sm leading-6 text-rose-800">{hydrationError}</p>
          </section>
        </main>
      ) : null}

      <main className={`mx-auto mt-6 grid w-full max-w-7xl gap-6 lg:mt-8 ${isHydrating ? "pointer-events-none" : ""}`}>
        <section className="landing-control-deck overflow-hidden rounded-4xl border border-indigo-200/70 bg-white/92 text-indigo-950 shadow-[0_24px_70px_rgba(15,23,42,0.18)] dark:bg-slate-900 dark:text-indigo-100 dark:shadow-[0_24px_70px_rgba(15,23,42,0.34)]">
          <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1.5fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.42em] text-indigo-900 dark:text-cyan-300">Control deck</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl text-indigo-950 dark:text-indigo-50">
                {currentCoach ? `${currentCoach.displayName}, your coaching board is live.` : "Your coaching board is live."}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-indigo-800 sm:text-base dark:text-indigo-200">
                Build sessions faster, keep class momentum visible, and pull exactly what you need into the next lesson.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {boardStats.map((stat, index) => (
                  <article
                    key={stat.label}
                    className={`landing-stat-card rounded-2xl border px-4 py-3 shadow-sm transition-colors duration-200 ${
                      index % 2 === 0
                        ? "border-cyan-300/70 bg-cyan-100/80 text-indigo-900 shadow-cyan-100/60 dark:border-cyan-400/40 dark:bg-cyan-500/10 dark:text-indigo-100"
                        : "border-orange-300/70 bg-orange-100/80 text-indigo-900 shadow-orange-100/60 dark:border-orange-400/40 dark:bg-orange-500/10 dark:text-indigo-100"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.24em] text-indigo-700 dark:text-indigo-200">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-indigo-950 dark:text-indigo-50">{stat.value}</p>
                    <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-200">{stat.hint}</p>
                  </article>
                ))}
              </div>
            </div>

            <aside className="landing-draft-panel rounded-2xl border border-indigo-300/50 bg-indigo-50/85 p-5 backdrop-blur dark:border-indigo-300/35 dark:bg-white/10">
              <p className="text-xs uppercase tracking-[0.35em] text-amber-700 dark:text-amber-200">Lesson draft</p>
              <p className="mt-2 text-2xl font-semibold text-indigo-950 dark:text-indigo-50">
                {lessonPlan.conditioningIds.length + lessonPlan.skillIds.length} total picks
              </p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-indigo-800 dark:text-indigo-200">Conditioning</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedConditioning.length ? (
                      selectedConditioning.map((item: LibraryItem) => (
                        <span key={item.id} className="rounded-full bg-cyan-100 px-3 py-1 text-xs text-cyan-700 dark:bg-cyan-300/20 dark:text-cyan-100">
                          {item.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-indigo-800 dark:text-indigo-200">No conditioning selected yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-indigo-800 dark:text-indigo-200">Skills</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedSkills.length ? (
                      selectedSkills.map((item: SkillLibraryItem) => (
                        <span key={item.id} className="rounded-full bg-orange-100 px-3 py-1 text-xs text-orange-700 dark:bg-orange-300/20 dark:text-orange-100">
                          {item.title}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-indigo-800 dark:text-indigo-200">No skills selected yet.</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  className="w-full rounded-xl border border-indigo-300 bg-white px-4 py-2 text-sm font-medium text-indigo-900 transition hover:bg-indigo-50 dark:border-white/35 dark:bg-white/15 dark:text-indigo-50 dark:hover:bg-white/25"
                  onClick={clearLessonPlan}
                >
                  Reset draft
                </button>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[0.95fr_1.55fr]">
          <aside className="landing-launch-panel rounded-[1.75rem] border border-indigo-200/70 bg-white/85 p-5 shadow-[0_18px_46px_rgba(79,70,229,0.15)] dark:border-indigo-300/30 dark:bg-slate-900/75 dark:shadow-[0_18px_46px_rgba(2,6,23,0.45)]">
            <p className="text-xs uppercase tracking-[0.35em] text-indigo-700 dark:text-indigo-300">Launch pads</p>
            <div className="mt-4 grid gap-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="landing-launch-link rounded-2xl border border-indigo-200/70 bg-indigo-100/75 bg-linear-to-r from-indigo-200 via-cyan-100 to-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:from-indigo-300 hover:via-cyan-200 hover:to-indigo-50 dark:border-indigo-300/35 dark:from-indigo-950/65 dark:via-slate-900 dark:to-cyan-950/45 dark:hover:border-cyan-300/55"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-300">0{index + 1}</p>
                  <h3 className="mt-1 text-xl font-semibold text-indigo-950 dark:text-indigo-50">{link.title}</h3>
                  <p className="mt-1 text-sm text-indigo-800 dark:text-indigo-200">{link.description}</p>
                </Link>
              ))}
            </div>
          </aside>

          <div className="grid gap-6">
            <article className="landing-students-panel rounded-[1.75rem] border border-cyan-200/70 bg-white/88 p-6 shadow-[0_18px_46px_rgba(14,116,144,0.14)] dark:border-cyan-300/30 dark:bg-slate-900/75 dark:shadow-[0_18px_46px_rgba(2,6,23,0.45)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-700 dark:text-cyan-300">Recent students</p>
              <div className="mt-4 grid gap-3">
                {recentStudents.length ? (
                  recentStudents.map((student) => (
                    <Link
                      key={student.id}
                      href={`/Landing/Students/${student.id}`}
                      className="landing-student-row block rounded-2xl border border-cyan-200/70 bg-cyan-50/70 px-4 py-3 transition hover:-translate-y-0.5 hover:border-cyan-300/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/70 dark:border-cyan-300/30 dark:bg-slate-800/80 dark:hover:border-cyan-200/60 dark:focus-visible:ring-cyan-200/60"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-indigo-950 dark:text-indigo-50">{student.name}</h3>
                          <p className="text-sm text-indigo-800 dark:text-indigo-200">{student.level}</p>
                        </div>
                        <span className="rounded-full bg-cyan-500 px-3 py-1 text-xs font-semibold text-white dark:bg-cyan-400">{student.progress}%</span>
                      </div>
                      <p className="mt-2 text-sm text-indigo-800 dark:text-indigo-200">{student.focus || "No focus added yet."}</p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/40 p-4 text-sm text-indigo-800 dark:border-cyan-300/35 dark:bg-slate-800/70 dark:text-indigo-200">
                    No students yet. Add your first student profile to start tracking progress.
                  </p>
                )}
              </div>
            </article>

            <article className="landing-classes-panel rounded-[1.75rem] border border-orange-200/70 bg-white/88 p-6 shadow-[0_18px_46px_rgba(194,65,12,0.12)] dark:border-orange-300/30 dark:bg-slate-900/75 dark:shadow-[0_18px_46px_rgba(2,6,23,0.45)] sm:p-8">
              <p className="text-xs uppercase tracking-[0.35em] text-orange-700 dark:text-orange-300">Recent classes</p>
              <div className="mt-4 grid gap-3">
                {recentClasses.length ? (
                  recentClasses.map((classItem) => (
                    <div key={classItem.id} className="landing-class-row rounded-2xl border border-orange-200/70 bg-orange-50/70 px-4 py-3 dark:border-orange-300/30 dark:bg-slate-800/80">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-indigo-950 dark:text-indigo-50">{classItem.name}</h3>
                          <p className="text-sm text-indigo-800 dark:text-indigo-200">{classItem.schedule}</p>
                        </div>
                        <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-semibold text-white dark:bg-orange-500">
                          {classItem.studentIds.length} students
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-indigo-800 dark:text-indigo-200">{classItem.focus || "No class focus added yet."}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-orange-300 bg-orange-50/40 p-4 text-sm text-indigo-800 dark:border-orange-300/35 dark:bg-slate-800/70 dark:text-indigo-200">
                    No classes yet. Create a class and assign students to keep groups organized.
                  </p>
                )}
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
