"use client";

import { useMemo, useState } from "react";
import Navbar from "../../UI/Navbar";
import StudentCard from "../../UI/StudentCard";
import { useCoachApp } from "@/app/lib/coach-store";
import type { CoachClassData, StudentProfileData } from "@/app/lib/coach-data";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const levelOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];

export default function StudentsPage() {
  const { classes, students, skillExercises, addStudent, updateStudentProgress } = useCoachApp();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [goals, setGoals] = useState("");
  const [skillsKnown, setSkillsKnown] = useState<string[]>([]);
  const [struggles, setStruggles] = useState("");
  const [progress, setProgress] = useState(30);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const availableSkillTitles = useMemo(
    () => Array.from(new Set(skillExercises.map((item) => item.title.trim()).filter(Boolean))),
    [skillExercises],
  );

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      <main className="mx-auto mt-6 w-full max-w-7xl space-y-6">
        <section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Student profiles</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Add and track your students</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Build a coaching roster, store notes, and move each student forward with progress updates and class assignments.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
          <form
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              addStudent({
                name,
                level,
                focus,
                notes,
                classIds: selectedClassIds,
                goals: splitValues(goals),
                skillsKnown,
                struggles: splitValues(struggles),
                progress,
              });
              setName("");
              setLevel("Beginner");
              setFocus("");
              setNotes("");
              setGoals("");
              setSkillsKnown([]);
              setStruggles("");
              setProgress(30);
              setSelectedClassIds([]);
            }}
          >
            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Student name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Ava Moreno"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Level</span>
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                  >
                    {levelOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Focus</span>
                  <input
                    type="text"
                    value={focus}
                    onChange={(event) => setFocus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Clean inverts"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Goals</span>
                <input
                  type="text"
                  value={goals}
                  onChange={(event) => setGoals(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Stronger hollow, smoother climbs, more endurance"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Skills known</span>
                {availableSkillTitles.length ? (
                  <div className="grid gap-2">
                    {availableSkillTitles.map((skillTitle) => (
                      <label
                        key={skillTitle}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{skillTitle}</span>
                        <input
                          type="checkbox"
                          checked={skillsKnown.includes(skillTitle)}
                          onChange={(event) => {
                            setSkillsKnown((current) =>
                              event.target.checked
                                ? [...current, skillTitle]
                                : current.filter((entry) => entry !== skillTitle),
                            );
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                        />
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                    Add skills in the Skills Library first, then select them here.
                  </p>
                )}
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Current struggles</span>
                <input
                  type="text"
                  value={struggles}
                  onChange={(event) => setStruggles(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Inversion strength, endurance, sequencing"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Anything the coach should remember during future lessons."
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(event) => setProgress(Number(event.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-700"
                />
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Starting point</span>
                  <span>{progress}%</span>
                </div>
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Assign to classes</span>
                <div className="grid gap-2">
                  {classes.length ? (
                    classes.map((classItem: CoachClassData) => (
                      <label
                        key={classItem.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{classItem.name}</span>
                        <input
                          type="checkbox"
                          checked={selectedClassIds.includes(classItem.id)}
                          onChange={(event) => {
                            setSelectedClassIds((current) =>
                              event.target.checked
                                ? [...current, classItem.id]
                                : current.filter((id) => id !== classItem.id),
                            );
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                        />
                      </label>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Add classes first, then assign students here for easy organization.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
              >
                Save student profile
              </button>
            </div>
          </form>

          <section className="space-y-4">
            {students.length ? (
                    students.map((student: StudentProfileData) => (
                <StudentCard
                  key={student.id}
                  student={student}
                  classes={classes}
                  onProgressChange={updateStudentProgress}
                />
              ))
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                No student profiles yet. Create the first one using the form on the left.
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
