"use client";

import { useState } from "react";
import Navbar from "../../UI/Navbar";
import { useCoachApp } from "@/app/lib/coach-store";
import type { CoachClassData, StudentProfileData } from "@/app/lib/coach-data";

const levelOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];
const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const timeOptions = [
  "12:00",
  "12:30",
  "1:00",
  "1:30",
  "2:00",
  "2:30",
  "3:00",
  "3:30",
  "4:00",
  "4:30",
  "5:00",
  "5:30",
  "6:00",
  "6:30",
  "7:00",
  "7:30",
  "8:00",
  "8:30",
  "9:00",
  "9:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
];


export default function ClassesPage() {
  const { classes, students, addClass, updateClass, deleteClass } = useCoachApp();
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [classTime, setClassTime] = useState("6:00");
  const [meridiem, setMeridiem] = useState("PM");
  const [location, setLocation] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLevel, setEditLevel] = useState("Beginner");
  const [editSchedule, setEditSchedule] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editFocus, setEditFocus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editStudentIds, setEditStudentIds] = useState<string[]>([]);

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
              const schedule = selectedDays.length
                ? `${selectedDays.join(", ")} at ${classTime} ${meridiem}`
                : "";

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
              setSelectedDays([]);
              setClassTime("6:00");
              setMeridiem("PM");
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
                  <span className="text-sm font-medium text-slate-700">Class time</span>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={classTime}
                      onChange={(event) => setClassTime(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                    >
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <select
                      value={meridiem}
                      onChange={(event) => setMeridiem(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Class days</span>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((day) => {
                    const isSelected = selectedDays.includes(day);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => {
                          setSelectedDays((current) =>
                            current.includes(day)
                              ? current.filter((item) => item !== day)
                              : [...current, day],
                          );
                        }}
                        className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                          isSelected
                            ? "border border-teal-700 bg-teal-700 text-white"
                            : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                        aria-pressed={isSelected}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">Selected schedule: {selectedDays.length ? `${selectedDays.join(", ")} at ${classTime} ${meridiem}` : "No days selected"}</p>
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
                    students.map((student: StudentProfileData) => (
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
                className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
              >
                Save class
              </button>
            </div>
          </form>

          <section className="grid gap-4">
            {classes.length ? (
              classes.map((classItem: CoachClassData) => {
                const roster = students.filter((student: StudentProfileData) => classItem.studentIds.includes(student.id));

                return (
                  <article
                    key={classItem.id}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
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
                        roster.map((student: StudentProfileData) => (
                          <span key={student.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {student.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">No students assigned yet.</span>
                      )}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="cursor-pointer rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        onClick={() => {
                          setEditingClassId(classItem.id);
                          setEditName(classItem.name);
                          setEditLevel(classItem.level);
                          setEditSchedule(classItem.schedule);
                          setEditLocation(classItem.location);
                          setEditFocus(classItem.focus);
                          setEditNotes(classItem.notes);
                          setEditStudentIds(classItem.studentIds);
                        }}
                      >
                        Edit class
                      </button>
                      <button
                        type="button"
                        className="cursor-pointer rounded-full border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                        onClick={() => {
                          if (window.confirm(`Delete ${classItem.name}? This will also remove related assigned lesson plans.`)) {
                            deleteClass(classItem.id);
                            if (editingClassId === classItem.id) {
                              setEditingClassId(null);
                            }
                          }
                        }}
                      >
                        Delete class
                      </button>
                    </div>

                    {editingClassId === classItem.id ? (
                      <form
                        className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                        onSubmit={(event) => {
                          event.preventDefault();
                          updateClass(classItem.id, {
                            name: editName,
                            level: editLevel,
                            schedule: editSchedule,
                            location: editLocation,
                            focus: editFocus,
                            notes: editNotes,
                            studentIds: editStudentIds,
                          });
                          setEditingClassId(null);
                        }}
                      >
                        <input
                          type="text"
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                          placeholder="Class name"
                          required
                        />
                        <select
                          value={editLevel}
                          onChange={(event) => setEditLevel(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                        >
                          {levelOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editSchedule}
                          onChange={(event) => setEditSchedule(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                          placeholder="Schedule"
                        />
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(event) => setEditLocation(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                          placeholder="Location"
                        />
                        <input
                          type="text"
                          value={editFocus}
                          onChange={(event) => setEditFocus(event.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                          placeholder="Focus"
                        />
                        <textarea
                          value={editNotes}
                          onChange={(event) => setEditNotes(event.target.value)}
                          className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                          placeholder="Notes"
                        />
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Assigned students</p>
                          <div className="grid gap-2">
                            {students.map((student: StudentProfileData) => (
                              <label
                                key={student.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                              >
                                <span>{student.name}</span>
                                <input
                                  type="checkbox"
                                  checked={editStudentIds.includes(student.id)}
                                  onChange={(event) => {
                                    setEditStudentIds((current) =>
                                      event.target.checked
                                        ? [...current, student.id]
                                        : current.filter((id) => id !== student.id),
                                    );
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            className="w-full cursor-pointer rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
                          >
                            Save changes
                          </button>
                          <button
                            type="button"
                            className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                            onClick={() => setEditingClassId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : null}
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
