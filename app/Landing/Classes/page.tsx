"use client";

import { useState } from "react";
import Navbar from "../../UI/Navbar";
import { useCoachApp } from "../../lib/coach-store";

export default function ClassesPage() {
  const { classes, students, addClass } = useCoachApp();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [schedule, setSchedule] = useState("");
  const [location, setLocation] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      <main className="mx-auto mt-6 w-full max-w-7xl space-y-6">
        <section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Classes</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Create and organize class groups</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Keep your roster organized by class level, schedule, and student assignment so lesson planning stays simple.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_1.4fr]">
          <form
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              addClass({
                name,
                level,
                schedule,
                location,
                focus,
                notes,
                studentIds: selectedStudentIds,
              });
              setName("");
              setLevel("Beginner");
              setSchedule("");
              setLocation("");
              setFocus("");
              setNotes("");
              setSelectedStudentIds([]);
            }}
          >
            <div className="space-y-5">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Class name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Wednesday Fundamentals"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Level</span>
                  <input
                    type="text"
                    value={level}
                    onChange={(event) => setLevel(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                    placeholder="Beginner"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Schedule</span>
                  <input
                    type="text"
                    value={schedule}
                    onChange={(event) => setSchedule(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Wednesdays at 6:00 PM"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Location</span>
                  <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Studio A"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Focus</span>
                  <input
                    type="text"
                    value={focus}
                    onChange={(event) => setFocus(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Strength and inverts"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Lesson reminders, prop needs, or skill sequencing notes."
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Assign students</span>
                <div className="grid gap-2">
                  {students.length ? (
                    students.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{student.name}</span>
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={(event) => {
                            setSelectedStudentIds((current) =>
                              event.target.checked
                                ? [...current, student.id]
                                : current.filter((id) => id !== student.id),
                            );
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                        />
                      </label>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Create student profiles first, then place them into classes.
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
              >
                Save class
              </button>
            </div>
          </form>

          <section className="grid gap-4">
            {classes.length ? (
              classes.map((classItem) => {
                const roster = students.filter((student) => classItem.studentIds.includes(student.id));

                return (
                  <article
                    key={classItem.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-teal-700">Class group</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">{classItem.name}</h3>
                        <p className="mt-1 text-sm text-slate-500">{classItem.level}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                        {classItem.studentIds.length} students
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Schedule</p>
                        <p className="mt-1 font-medium text-slate-800">{classItem.schedule || "Add a schedule"}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Location</p>
                        <p className="mt-1 font-medium text-slate-800">{classItem.location || "Add a location"}</p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-600">{classItem.focus || "No focus added yet."}</p>
                    {classItem.notes ? <p className="mt-3 text-sm leading-6 text-slate-500">{classItem.notes}</p> : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {roster.length ? (
                        roster.map((student) => (
                          <span key={student.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {student.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">No students assigned yet.</span>
                      )}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                No classes yet. Create the first group and assign students to keep the roster organized.
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
