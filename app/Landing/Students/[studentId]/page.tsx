"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "../../../UI/Navbar";
import { useCoachApp } from "../../../lib/coach-store";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
const levelOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];
interface StudentFormState {
  studentId: string;
  name: string;
  level: string;
  focus: string;
  selectedClassIds: string[];
  goalsText: string;
  skillsKnown: string[];
  strugglesText: string;
  progressValue: number;
}

export default function StudentProfilePage() {
  const params = useParams<{ studentId: string }>();
  const router = useRouter();
  const studentId = params?.studentId;
  const {
    students,
    classes,
    skillExercises,
    assignedLessonPlans,
    updateStudent,
    updateStudentProgress,
    addStudentNote,
    deleteStudent,
  } = useCoachApp();

  const student = useMemo(
    () => students.find((entry) => entry.id === studentId),
    [studentId, students],
  );

  const relatedClasses = useMemo(
    () => classes.filter((classItem) => student?.classIds.includes(classItem.id)),
    [classes, student?.classIds],
  );

  const studentLessonPlans = useMemo(
    () =>
      assignedLessonPlans
        .filter((plan) => {
          if (!student?.id) {
            return false;
          }

          if (!(student?.classIds ?? []).includes(plan.classId)) {
            return false;
          }

          return !plan.studentIds?.length || plan.studentIds.includes(student.id);
        })
        .sort((a, b) => new Date(b.classDate).getTime() - new Date(a.classDate).getTime()),
    [assignedLessonPlans, student],
  );

  const [draft, setDraft] = useState<StudentFormState | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const availableSkillTitles = useMemo(
    () => unique(skillExercises.map((item) => item.title.trim()).filter(Boolean)),
    [skillExercises],
  );

  if (!student) {
    return (
      <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <Navbar />
        <main className="mx-auto mt-6 w-full max-w-4xl">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Student profile not found</h2>
            <p className="mt-3 text-sm leading-6">The requested student could not be found in your current workspace data.</p>
            <Link
              href="/Landing/Students"
              className="mt-5 inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to students
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const baseFormState: StudentFormState = {
    studentId: student.id,
    name: student.name,
    level: student.level || "Beginner",
    focus: student.focus,
    selectedClassIds: student.classIds,
    goalsText: student.goals.join(", "),
    skillsKnown: unique(student.skillsKnown),
    strugglesText: student.struggles.join(", "),
    progressValue: student.progress,
  };
  const formState = draft?.studentId === student.id ? draft : baseFormState;
  const selectableSkillTitles = unique([...availableSkillTitles, ...formState.skillsKnown]);
  const updateFormState = (updater: (current: StudentFormState) => StudentFormState) => {
    setDraft((current) => {
      const activeState = current?.studentId === student.id ? current : baseFormState;
      return updater(activeState);
    });
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      <main className="mx-auto mt-6 grid w-full max-w-7xl gap-6 lg:mt-8">
        <section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Student profile</p>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950">{student.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{student.level} student · Last updated {new Date(student.lastUpdated).toLocaleDateString()}</p>
            </div>
            <div className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">Progress {student.progress}%</div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {relatedClasses.length ? (
              relatedClasses.map((classItem) => (
                <span key={classItem.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                  {classItem.name}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-500">No class assignments yet.</span>
            )}
          </div>
        </section>

        {errorMessage ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
        ) : null}

        {statusMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <article className="space-y-6 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Coaching details</h3>
              <p className="mt-2 text-sm text-slate-600">Update focus notes, goals, known skills, and active struggles for this student.</p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage("");
                setStatusMessage("");

                try {
                  updateStudent(student.id, {
                    name: formState.name,
                    level: formState.level,
                    focus: formState.focus,
                    classIds: formState.selectedClassIds,
                    goals: splitValues(formState.goalsText),
                    skillsKnown: formState.skillsKnown,
                    struggles: splitValues(formState.strugglesText),
                  });
                  setStatusMessage("Student profile details saved.");
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : "Unable to save student profile details.");
                }
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Student name</span>
                <input
                  type="text"
                  value={formState.name}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateFormState((current) => ({ ...current, name: nextValue }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Student name"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Level</span>
                <select
                  value={formState.level}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateFormState((current) => ({ ...current, level: nextValue }));
                  }}
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
                  value={formState.focus}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateFormState((current) => ({ ...current, focus: nextValue }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Current training focus"
                />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Assign to classes</span>
                <div className="grid gap-2">
                  {classes.length ? (
                    classes.map((classItem) => (
                      <label
                        key={classItem.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{classItem.name}</span>
                        <input
                          type="checkbox"
                          checked={formState.selectedClassIds.includes(classItem.id)}
                          onChange={(event) => {
                            updateFormState((current) => ({
                              ...current,
                              selectedClassIds: event.target.checked
                                ? [...current.selectedClassIds, classItem.id]
                                : current.selectedClassIds.filter((id) => id !== classItem.id),
                            }));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                        />
                      </label>
                    ))
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      No classes available yet.
                    </p>
                  )}
                </div>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Specific goals</span>
                <input
                  type="text"
                  value={formState.goalsText}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateFormState((current) => ({ ...current, goalsText: nextValue }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Comma separated goals"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Skills known</span>
                {selectableSkillTitles.length ? (
                  <div className="grid gap-2">
                    {selectableSkillTitles.map((skillTitle) => (
                      <label
                        key={skillTitle}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{skillTitle}</span>
                        <input
                          type="checkbox"
                          checked={formState.skillsKnown.includes(skillTitle)}
                          onChange={(event) => {
                            updateFormState((current) => ({
                              ...current,
                              skillsKnown: event.target.checked
                                ? unique([...current.skillsKnown, skillTitle])
                                : current.skillsKnown.filter((entry) => entry !== skillTitle),
                            }));
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
                  value={formState.strugglesText}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    updateFormState((current) => ({ ...current, strugglesText: nextValue }));
                  }}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Comma separated struggles"
                />
              </label>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
              >
                Save profile details
              </button>

              <button
                type="button"
                className="w-full cursor-pointer rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-100"
                onClick={() => {
                  if (window.confirm(`Delete ${student.name}? This removes the student from classes and related lesson-plan targeting.`)) {
                    deleteStudent(student.id);
                    router.push("/Landing/Students");
                  }
                }}
              >
                Delete student
              </button>
            </form>

            <form
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                setErrorMessage("");
                setStatusMessage("");

                try {
                  addStudentNote(student.id, noteText);
                  setNoteText("");
                  setStatusMessage("New coaching note added.");
                } catch (error) {
                  setErrorMessage(error instanceof Error ? error.message : "Unable to save note.");
                }
              }}
            >
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">Add note update</h4>
              <textarea
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
                className="min-h-24 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600"
                placeholder="Session notes, wins, corrections, and action items."
              />
              <button
                type="submit"
                className="w-full cursor-pointer rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
              >
                Save note
              </button>
            </form>
          </article>

          <article className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Progress updates</h3>
              <p className="mt-2 text-sm text-slate-600">Track short-term progress and maintain a clear timeline of changes.</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-sm text-slate-600">
                <span>Current progress</span>
                <span>{formState.progressValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={formState.progressValue}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  updateFormState((current) => ({ ...current, progressValue: nextValue }));
                }}
                className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-700"
              />
              <button
                type="button"
                className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
                onClick={() => {
                  setErrorMessage("");
                  setStatusMessage("");
                  updateStudentProgress(student.id, formState.progressValue);
                  setStatusMessage("Progress update saved.");
                }}
              >
                Save progress update
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Progress history</h4>
              <ul className="space-y-2">
                {student.progressHistory
                  .slice()
                  .reverse()
                  .map((entry) => (
                    <li key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-semibold text-slate-900">{entry.progress}%</span>
                        <span className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h3 className="text-xl font-semibold text-slate-950">Specific goals</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {student.goals.length ? (
                student.goals.map((goal) => (
                  <span key={goal} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {goal}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-500">No goals added yet.</span>
              )}
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <h3 className="text-xl font-semibold text-slate-950">Skills and struggles</h3>

            <div className="mt-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-700">Skills known</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {student.skillsKnown.length ? (
                  student.skillsKnown.map((skill) => (
                    <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No skills recorded yet.</span>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.3em] text-rose-700">Current struggles</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {student.struggles.length ? (
                  student.struggles.map((struggle) => (
                    <span key={struggle} className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-800">
                      {struggle}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">No struggles recorded yet.</span>
                )}
              </div>
            </div>
          </article>
        </section>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h3 className="text-xl font-semibold text-slate-950">Past notes</h3>
          <div className="mt-4 space-y-3">
            {student.notesHistory.length ? (
              student.notesHistory.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-slate-900">Coaching note</p>
                    <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{entry.note}</p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No coaching notes have been added yet.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
          <h3 className="text-xl font-semibold text-slate-950">Assigned lesson plans</h3>
          <div className="mt-4 space-y-3">
            {studentLessonPlans.length ? (
              studentLessonPlans.map((plan) => {
                const classItem = classes.find((entry) => entry.id === plan.classId);

                return (
                  <div key={plan.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Link href={`/Landing/LessonPlanner/${plan.id}`} className="cursor-pointer text-sm font-semibold text-slate-900 transition hover:text-teal-700">
                        {plan.title}
                      </Link>
                      <p className="text-xs text-slate-500">{new Date(`${plan.classDate}T00:00:00`).toLocaleDateString()}</p>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-teal-700">{classItem?.name ?? "Unknown class"}</p>
                    {plan.notes ? <p className="mt-2 text-sm leading-6 text-slate-700">{plan.notes}</p> : null}
                    {plan.outcomeNotes ? <p className="mt-2 text-sm leading-6 text-emerald-800">Outcome: {plan.outcomeNotes}</p> : null}
                    <div className="mt-2 text-xs text-slate-600">
                      <p>Conditioning: {plan.conditioningIds.length} blocks</p>
                      <p>
                        Skill blocks: {unique([...(plan.skillIds ?? []), ...(plan.perStudentSkillIds?.[student.id] ?? [])]).length}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No lesson plans assigned to this student&apos;s classes yet.
              </p>
            )}
          </div>
        </article>
      </main>
    </div>
  );
}
