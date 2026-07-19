"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "../../../UI/Navbar";
import { useCoachApp } from "../../../lib/coach-store";

export default function LessonPlanDetailPage() {
  const params = useParams<{ lessonId: string }>();
  const searchParams = useSearchParams();
  const lessonId = params?.lessonId;
  const startInEditMode = searchParams.get("edit") === "1";

  const {
    classes,
    students,
    conditioningExercises,
    skillExercises,
    assignedLessonPlans,
    updateAssignedLessonPlan,
  } = useCoachApp();

  const lessonPlan = useMemo(
    () => assignedLessonPlans.find((plan) => plan.id === lessonId),
    [assignedLessonPlans, lessonId],
  );

  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [title, setTitle] = useState(lessonPlan?.title ?? "");
  const [classId, setClassId] = useState(lessonPlan?.classId ?? "");
  const [classDate, setClassDate] = useState(lessonPlan?.classDate ?? "");
  const [notes, setNotes] = useState(lessonPlan?.notes ?? "");
  const [outcomeNotes, setOutcomeNotes] = useState(lessonPlan?.outcomeNotes ?? "");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(lessonPlan?.studentIds ?? []);
  const [selectedConditioningIds, setSelectedConditioningIds] = useState<string[]>(lessonPlan?.conditioningIds ?? []);
  const [conditioningRepsById, setConditioningRepsById] = useState<Record<string, number>>(lessonPlan?.conditioningReps ?? {});
  const [selectedClassSkillIds, setSelectedClassSkillIds] = useState<string[]>(lessonPlan?.skillIds ?? []);
  const [perStudentSkillIds, setPerStudentSkillIds] = useState<Record<string, string[]>>(lessonPlan?.perStudentSkillIds ?? {});
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedClass = useMemo(
    () => classes.find((entry) => entry.id === classId),
    [classId, classes],
  );

  const classStudents = useMemo(
    () => students.filter((student) => selectedClass?.studentIds.includes(student.id)),
    [selectedClass?.studentIds, students],
  );

  const activeStudentIds = selectedStudentIds.length
    ? selectedStudentIds
    : classStudents.map((student) => student.id);

  const displayConditioningItems = useMemo(
    () => conditioningExercises.filter((item) => (lessonPlan?.conditioningIds ?? []).includes(item.id)),
    [conditioningExercises, lessonPlan?.conditioningIds],
  );

  const displaySkillItems = useMemo(
    () => skillExercises.filter((item) => (lessonPlan?.skillIds ?? []).includes(item.id)),
    [skillExercises, lessonPlan?.skillIds],
  );

  if (!lessonPlan) {
    return (
      <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <Navbar />
        <main className="mx-auto mt-6 w-full max-w-4xl">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
            <h2 className="text-2xl font-semibold text-slate-950">Lesson plan not found</h2>
            <p className="mt-3 text-sm leading-6">The lesson plan could not be found in your current workspace data.</p>
            <Link
              href="/Landing/LessonPlanner"
              className="mt-5 inline-flex cursor-pointer rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Back to lesson planner
            </Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      <main className="mx-auto mt-6 w-full max-w-7xl space-y-6 lg:mt-8">
        <section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Lesson details</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{lessonPlan.title}</h2>
              <p className="mt-2 text-sm text-slate-600">
                {selectedClass?.name ?? "Unknown class"} · {new Date(`${lessonPlan.classDate}T00:00:00`).toLocaleDateString()}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/Landing/LessonPlanner"
                className="inline-flex cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                Back
              </Link>
              <button
                type="button"
                className="inline-flex cursor-pointer rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition hover:border-teal-300 hover:bg-teal-100"
                onClick={() => setIsEditing((current) => !current)}
              >
                {isEditing ? "Preview view" : "Edit lesson"}
              </button>
            </div>
          </div>
        </section>

        {errorMessage ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
        ) : null}

        {statusMessage ? (
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            {isEditing ? (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setErrorMessage("");
                  setStatusMessage("");

                  try {
                    updateAssignedLessonPlan(lessonPlan.id, {
                      title,
                      classId,
                      classDate,
                      notes,
                      outcomeNotes,
                      studentIds: selectedStudentIds,
                      conditioningIds: selectedConditioningIds,
                      conditioningReps: conditioningRepsById,
                      skillIds: selectedClassSkillIds,
                      perStudentSkillIds,
                    });
                    setStatusMessage("Lesson plan changes saved.");
                    setIsEditing(false);
                  } catch (error) {
                    setErrorMessage(error instanceof Error ? error.message : "Unable to update lesson plan.");
                  }
                }}
              >
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Lesson title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Lesson title"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Assign to class</span>
                    <select
                      value={classId}
                      onChange={(event) => {
                        setClassId(event.target.value);
                        setSelectedStudentIds([]);
                        setPerStudentSkillIds({});
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                      required
                    >
                      <option value="">Select class</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-2">
                    <span className="text-sm font-medium text-slate-700">Class date</span>
                    <input
                      type="date"
                      value={classDate}
                      onChange={(event) => setClassDate(event.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                      required
                    />
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Lesson notes</span>
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Warm-up flow, key cues, and sequencing notes."
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Outcome notes (after lesson completion)</span>
                  <textarea
                    value={outcomeNotes}
                    onChange={(event) => setOutcomeNotes(event.target.value)}
                    className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="What worked well, where students got stuck, and priorities for the next class."
                  />
                </label>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Students in this lesson</p>
                  <p className="text-xs text-slate-500">Leave all unchecked to keep this lesson assigned to the full class.</p>
                  <div className="grid gap-2">
                    {classStudents.length ? (
                      classStudents.map((student) => (
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
                        This class has no students yet.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Conditioning blocks</p>
                  <p className="text-xs text-slate-500">Only nine options are visible at once. Scroll for more.</p>
                  <div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
                    {conditioningExercises.map((item) => {
                      const isSelected = selectedConditioningIds.includes(item.id);

                      return (
                        <label
                          key={item.id}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                        >
                          <span className="flex-1">{item.title}</span>
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <input
                                type="number"
                                min={1}
                                step={1}
                                value={conditioningRepsById[item.id] ?? 8}
                                onChange={(event) => {
                                  const nextValue = Number(event.target.value);

                                  setConditioningRepsById((current) => ({
                                    ...current,
                                    [item.id]: Number.isFinite(nextValue) && nextValue > 0 ? Math.round(nextValue) : 1,
                                  }));
                                }}
                                className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600"
                                aria-label={`${item.title} reps`}
                              />
                            ) : (
                              <span className="w-20 text-right text-xs text-slate-400">set reps</span>
                            )}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) => {
                                setSelectedConditioningIds((current) => {
                                  if (event.target.checked) {
                                    return [...current, item.id];
                                  }

                                  return current.filter((id) => id !== item.id);
                                });

                                setConditioningRepsById((current) => {
                                  if (event.target.checked) {
                                    return { ...current, [item.id]: current[item.id] ?? 8 };
                                  }

                                  const next = { ...current };
                                  delete next[item.id];
                                  return next;
                                });
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Skill blocks for whole class</p>
                  <p className="text-xs text-slate-500">Only nine options are visible at once. Scroll for more.</p>
                  <div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
                    {skillExercises.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        <span>{item.title}</span>
                        <input
                          type="checkbox"
                          checked={selectedClassSkillIds.includes(item.id)}
                          onChange={(event) => {
                            setSelectedClassSkillIds((current) =>
                              event.target.checked
                                ? [...current, item.id]
                                : current.filter((id) => id !== item.id),
                            );
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Skill blocks per student</p>
                  <p className="text-xs text-slate-500">Assign extra or personalized skills to specific students.</p>
                  {activeStudentIds.length ? (
                    activeStudentIds.map((studentId) => {
                      const student = students.find((entry) => entry.id === studentId);

                      if (!student) {
                        return null;
                      }

                      const selectedIds = perStudentSkillIds[student.id] ?? [];

                      return (
                        <div key={student.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                          <div className="grid max-h-88 gap-2 overflow-y-auto pr-1">
                            {skillExercises.map((item) => (
                              <label
                                key={`${student.id}-${item.id}`}
                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                              >
                                <span>{item.title}</span>
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(item.id)}
                                  onChange={(event) => {
                                    setPerStudentSkillIds((current) => {
                                      const existingIds = current[student.id] ?? [];
                                      const nextIds = event.target.checked
                                        ? [...existingIds, item.id]
                                        : existingIds.filter((id) => id !== item.id);

                                      if (!nextIds.length) {
                                        const next = { ...current };
                                        delete next[student.id];
                                        return next;
                                      }

                                      return { ...current, [student.id]: nextIds };
                                    });
                                  }}
                                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      Select a class with students to assign individual skill blocks.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
                >
                  Save lesson changes
                </button>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-slate-700">Class</p>
                  <p className="mt-1 text-slate-900">{selectedClass?.name ?? "Unknown class"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Lesson notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {lessonPlan.notes || "No lesson notes added."}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700">Outcome notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {lessonPlan.outcomeNotes || "No outcome notes added yet."}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-slate-700">Students targeted</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {lessonPlan.studentIds.length
                        ? lessonPlan.studentIds.length
                        : selectedClass?.studentIds.length ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">Created</p>
                    <p className="mt-1 text-sm text-slate-700">{new Date(lessonPlan.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}
          </article>

          <article className="space-y-5 rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-950">Lesson block summary</h3>
              <p className="mt-2 text-sm text-slate-600">Quick view of assigned conditioning and skill blocks.</p>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Conditioning blocks</p>
              {displayConditioningItems.length ? (
                <div className="space-y-2">
                  {displayConditioningItems.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-500">{lessonPlan.conditioningReps?.[item.id] ?? 8} reps</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No conditioning blocks assigned.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Class skill blocks</p>
              {displaySkillItems.length ? (
                <div className="flex flex-wrap gap-2">
                  {displaySkillItems.map((item) => (
                    <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      {item.title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No class skill blocks assigned.
                </p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
