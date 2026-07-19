"use client";

import Link from "next/link";
import Navbar from "../UI/Navbar";
import { useCoachApp } from "../lib/coach-store";

const quickLinks = [
  {
    href: "/Landing/StudentPage",
    title: "Students",
    description: "Create profiles, track progress, and assign class rosters.",
  },
  {
    href: "/Landing/Classes",
    title: "Classes",
    description: "Organize students into cohorts and keep schedules visible.",
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
  const { currentCoach, classes, students, conditioningExercises, skillExercises, lessonPlan, clearLessonPlan } = useCoachApp();

  const selectedConditioning = conditioningExercises.filter((item) => lessonPlan.conditioningIds.includes(item.id));
  const selectedSkills = skillExercises.filter((item) => lessonPlan.skillIds.includes(item.id));
  const recentStudents = [...students].slice(0, 3);
  const recentClasses = [...classes].slice(0, 3);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      <main className="mx-auto mt-6 grid w-full max-w-7xl gap-6 lg:mt-8">
        <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="rounded-[1.75rem] border border-white/60 bg-white/75 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Coach dashboard</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-4xl font-semibold tracking-tight text-slate-950">
                  {currentCoach ? `Welcome back, ${currentCoach.displayName}` : "Welcome to your coaching workspace"}
                </h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                  Use this home page to check who is in your classes, keep track of student progress, and pull skills and conditioning straight into lesson plans.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">Current focus</p>
                <p className="mt-1 text-lg font-semibold">{lessonPlan.conditioningIds.length + lessonPlan.skillIds.length} items on deck</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Students", value: students.length, hint: "profiles tracked" },
                { label: "Classes", value: classes.length, hint: "groups organized" },
                { label: "Conditioning", value: conditioningExercises.length, hint: "exercise cards" },
                { label: "Skills", value: skillExercises.length, hint: "skill cards" },
              ].map((stat) => (
                <article key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-semibold text-slate-950">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.hint}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Lesson plan draft</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-700">Conditioning</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  {selectedConditioning.length ? (
                    selectedConditioning.map((item) => (
                      <span key={item.id} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                        {item.title}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Pick conditioning exercises from the library.</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-700">Skills</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  {selectedSkills.length ? (
                    selectedSkills.map((item) => (
                      <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                        {item.title}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Pick aerial skills from the library.</span>
                  )}
                </div>
              </div>

              <button
                type="button"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                onClick={clearLessonPlan}
              >
                Clear lesson draft
              </button>
            </div>
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.1)]"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-teal-700">Navigate</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">{link.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{link.description}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Recent students</p>
            <div className="mt-5 space-y-4">
              {recentStudents.length ? (
                recentStudents.map((student) => (
                  <div key={student.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{student.name}</h3>
                        <p className="text-sm text-slate-500">{student.level}</p>
                      </div>
                      <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-medium text-white">{student.progress}%</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{student.focus || "No focus added yet."}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  No students yet. Add your first student profile to start tracking progress.
                </p>
              )}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Recent classes</p>
            <div className="mt-5 space-y-4">
              {recentClasses.length ? (
                recentClasses.map((classItem) => (
                  <div key={classItem.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">{classItem.name}</h3>
                        <p className="text-sm text-slate-500">{classItem.schedule}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                        {classItem.studentIds.length} students
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{classItem.focus || "No class focus added yet."}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  No classes yet. Create a class and assign students to keep groups organized.
                </p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
