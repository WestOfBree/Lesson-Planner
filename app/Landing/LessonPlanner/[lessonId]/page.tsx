"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "../../../UI/Navbar";
import { useCoachApp } from "../../../lib/coach-store";
import { useActionResponse } from "../../../lib/action-response";
import type { ConditioningPrescription } from "../../../lib/coach-data";

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
  const [conditioningRepsById, setConditioningRepsById] = useState<Record<string, ConditioningPrescription>>(lessonPlan?.conditioningReps ?? {});
  const [selectedClassSkillIds, setSelectedClassSkillIds] = useState<string[]>(lessonPlan?.skillIds ?? []);
  const [perStudentSkillIds, setPerStudentSkillIds] = useState<Record<string, string[]>>(lessonPlan?.perStudentSkillIds ?? {});
  const [perStudentOutcomeNotes, setPerStudentOutcomeNotes] = useState<Record<string, string>>(
    lessonPlan?.perStudentOutcomeNotes ?? {},
  );
  const [showStudentOutcomeEditor, setShowStudentOutcomeEditor] = useState(
    Boolean(Object.keys(lessonPlan?.perStudentOutcomeNotes ?? {}).length),
  );
  const [todayDateKey] = useState(() => new Date().toISOString().slice(0, 10));
  const { showActionResponse } = useActionResponse();

  const parsePositiveNumber = (value: string) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : undefined;
  };

  const hasAnyPrescriptionValue = (prescription: ConditioningPrescription) =>
    prescription.reps !== undefined ||
    prescription.holdSeconds !== undefined ||
    prescription.sets !== undefined;

  const getMissingPrescriptionLabels = (prescription: ConditioningPrescription) => {
    const missingLabels: string[] = [];

    if (prescription.reps === undefined) {
      missingLabels.push("reps");
    }

    if (prescription.holdSeconds === undefined) {
      missingLabels.push("hold seconds");
    }

    if (prescription.sets === undefined) {
      missingLabels.push("sets");
    }

    return missingLabels;
  };

  const getConditioningIdsWithValues = () =>
    selectedConditioningIds.filter((itemId) => {
      const prescription = conditioningRepsById[itemId] ?? {};
      return hasAnyPrescriptionValue(prescription);
    });

  const formatConditioningPrescription = (prescription: ConditioningPrescription | undefined) => {
    const parts = [
      prescription?.reps ? `${prescription.reps} reps` : null,
      prescription?.holdSeconds ? `${prescription.holdSeconds}s hold` : null,
      prescription?.sets ? `${prescription.sets} sets` : null,
    ].filter((part): part is string => Boolean(part));

    return parts.length ? parts.join(" • ") : "No prescription";
  };

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
  const isLessonComplete = useMemo(() => {
    if (!classDate) {
      return false;
    }

    return classDate <= todayDateKey;
  }, [classDate, todayDateKey]);

  const displayConditioningItems = useMemo(
    () => conditioningExercises.filter((item) => (lessonPlan?.conditioningIds ?? []).includes(item.id)),
    [conditioningExercises, lessonPlan?.conditioningIds],
  );

  const displaySkillItems = useMemo(
    () => skillExercises.filter((item) => (lessonPlan?.skillIds ?? []).includes(item.id)),
    [skillExercises, lessonPlan?.skillIds],
  );

  const lessonScopeStudentIds = useMemo(
    () => (lessonPlan.studentIds.length ? lessonPlan.studentIds : selectedClass?.studentIds ?? []),
    [lessonPlan.studentIds, selectedClass?.studentIds],
  );

  const lessonStudents = useMemo(
    () => students.filter((student) => lessonScopeStudentIds.includes(student.id)),
    [students, lessonScopeStudentIds],
  );

  const sharedConditioningAssignments = useMemo(
    () =>
      (lessonPlan.conditioningIds ?? [])
        .map((itemId) => {
          const item = conditioningExercises.find((entry) => entry.id === itemId);

          if (!item) {
            return null;
          }

          return {
            id: item.id,
            label: `${item.title} (${formatConditioningPrescription(lessonPlan.conditioningReps?.[item.id])})`,
          };
        })
        .filter((entry): entry is { id: string; label: string } => Boolean(entry)),
    [lessonPlan.conditioningIds, lessonPlan.conditioningReps, conditioningExercises],
  );

  const sharedSkillAssignments = useMemo(
    () =>
      (lessonPlan.skillIds ?? [])
        .map((itemId) => {
          const item = skillExercises.find((entry) => entry.id === itemId);

          if (!item) {
            return null;
          }

          return { id: item.id, title: item.title };
        })
        .filter((entry): entry is { id: string; title: string } => Boolean(entry)),
    [lessonPlan.skillIds, skillExercises],
  );

  const studentAssignmentRows = useMemo(
    () =>
      lessonStudents.map((student) => {
        const personalSkillIds = lessonPlan.perStudentSkillIds?.[student.id] ?? [];
        const personalSkillTitles = personalSkillIds
          .map((itemId) => skillExercises.find((entry) => entry.id === itemId)?.title)
          .filter((title): title is string => Boolean(title));

        return {
          student,
          personalSkillTitles,
        };
      }),
    [lessonStudents, lessonPlan.perStudentSkillIds, skillExercises],
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

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8">
            {isEditing ? (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();

                  try {
                    const conditioningIdsWithValues = getConditioningIdsWithValues();

                    updateAssignedLessonPlan(lessonPlan.id, {
                      title,
                      classId,
                      classDate,
                      notes,
                      outcomeNotes,
                      perStudentOutcomeNotes,
                      studentIds: selectedStudentIds,
                      conditioningIds: conditioningIdsWithValues,
                      conditioningReps: conditioningRepsById,
                      skillIds: selectedClassSkillIds,
                      perStudentSkillIds,
                    });
                    showActionResponse({ tone: "success", message: "Lesson plan changes saved." });
                    setIsEditing(false);
                  } catch (error) {
                    showActionResponse({
                      tone: "error",
                      message: error instanceof Error ? error.message : "Unable to update lesson plan.",
                    });
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

                <p className="text-xs text-slate-500">
                  {isLessonComplete
                    ? "Lesson date has passed. Add outcome reflections now."
                    : "Outcome notes are usually completed after the class date."}
                </p>

                <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Individual student outcomes</p>
                      <p className="text-xs text-slate-500">Optional notes for student-specific wins, cues, and next steps.</p>
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      onClick={() => setShowStudentOutcomeEditor((current) => !current)}
                    >
                      {showStudentOutcomeEditor ? "Hide individual notes" : "Add individual notes"}
                    </button>
                  </div>

                  {showStudentOutcomeEditor ? (
                    activeStudentIds.length ? (
                      <div className="space-y-3">
                        {activeStudentIds.map((studentId) => {
                          const student = students.find((entry) => entry.id === studentId);

                          if (!student) {
                            return null;
                          }

                          return (
                            <label key={`outcome-${student.id}`} className="block space-y-2">
                              <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                              <textarea
                                value={perStudentOutcomeNotes[student.id] ?? ""}
                                onChange={(event) => {
                                  const nextValue = event.target.value;

                                  setPerStudentOutcomeNotes((current) => ({
                                    ...current,
                                    [student.id]: nextValue,
                                  }));
                                }}
                                className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600"
                                placeholder={`Outcome notes for ${student.name}`}
                              />
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-500">
                        Select a class with students to add individual outcome notes.
                      </p>
                    )
                  ) : null}
                </div>

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
                      const currentPrescription = conditioningRepsById[item.id] ?? {};
                      const hasAnyValue = hasAnyPrescriptionValue(currentPrescription);
                      const missingLabels = getMissingPrescriptionLabels(currentPrescription);

                      return (
                        <label
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="flex-1 pt-1">{item.title}</span>
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
                                    return {
                                      ...current,
                                      [item.id]: current[item.id] ?? {},
                                    };
                                  }

                                  const next = { ...current };
                                  delete next[item.id];
                                  return next;
                                });
                              }}
                              className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
                            />
                          </div>

                          {isSelected ? (
                            <>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                              <label className="space-y-1">
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Reps</span>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={currentPrescription.reps ?? ""}
                                  onChange={(event) => {
                                    const nextReps = parsePositiveNumber(event.target.value);

                                    setConditioningRepsById((current) => ({
                                      ...current,
                                      [item.id]: {
                                        ...(current[item.id] ?? {}),
                                        reps: nextReps,
                                      },
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                  aria-label={`${item.title} reps`}
                                />
                              </label>

                              <label className="space-y-1">
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Hold (sec)</span>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={currentPrescription.holdSeconds ?? ""}
                                  onChange={(event) => {
                                    const nextHoldSeconds = parsePositiveNumber(event.target.value);

                                    setConditioningRepsById((current) => ({
                                      ...current,
                                      [item.id]: {
                                        ...(current[item.id] ?? {}),
                                        holdSeconds: nextHoldSeconds,
                                      },
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                  aria-label={`${item.title} hold seconds`}
                                />
                              </label>

                              <label className="space-y-1">
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Sets</span>
                                <input
                                  type="number"
                                  min={1}
                                  step={1}
                                  value={currentPrescription.sets ?? ""}
                                  onChange={(event) => {
                                    const nextSets = parsePositiveNumber(event.target.value);

                                    setConditioningRepsById((current) => ({
                                      ...current,
                                      [item.id]: {
                                        ...(current[item.id] ?? {}),
                                        sets: nextSets,
                                      },
                                    }));
                                  }}
                                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                                  aria-label={`${item.title} sets`}
                                />
                              </label>
                            </div>
                            {!hasAnyValue ? (
                              <p className="mt-2 text-xs text-amber-700">Add at least one value to include this exercise in the lesson plan.</p>
                            ) : missingLabels.length ? (
                              <p className="mt-2 text-xs text-slate-500">Missing value: {missingLabels.join(", ")}.</p>
                            ) : (
                              <p className="mt-2 text-xs text-emerald-700">All prescription fields are set.</p>
                            )}
                            </>
                          ) : (
                            <p className="mt-2 text-xs text-slate-400">Select to add prescription details.</p>
                          )}
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

                <div>
                  <p className="text-sm font-medium text-slate-700">Individual student outcomes</p>
                  {Object.keys(lessonPlan.perStudentOutcomeNotes ?? {}).length ? (
                    <div className="mt-2 space-y-2">
                      {Object.entries(lessonPlan.perStudentOutcomeNotes ?? {}).map(([studentId, note]) => {
                        const student = students.find((entry) => entry.id === studentId);

                        return (
                          <div key={`preview-outcome-${studentId}`} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                            <p className="text-sm font-semibold text-slate-900">{student?.name ?? "Student"}</p>
                            <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">{note}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-1 text-sm text-slate-700">No individual student outcomes added.</p>
                  )}
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
                        <p className="text-xs text-slate-500">{formatConditioningPrescription(lessonPlan.conditioningReps?.[item.id])}</p>
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

            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Student assignments</p>
              {studentAssignmentRows.length ? (
                <div className="space-y-2">
                  {studentAssignmentRows.map(({ student, personalSkillTitles }) => (
                    <div key={`student-assignment-${student.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <div className="mt-2 space-y-2 text-xs text-slate-600">
                        <div>
                          <p className="font-medium text-slate-700">Conditioning</p>
                          {sharedConditioningAssignments.length ? (
                            <p className="mt-1">{sharedConditioningAssignments.map((entry) => entry.label).join(" • ")}</p>
                          ) : (
                            <p className="mt-1">None assigned</p>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-slate-700">Class skills</p>
                          {sharedSkillAssignments.length ? (
                            <p className="mt-1">{sharedSkillAssignments.map((entry) => entry.title).join(" • ")}</p>
                          ) : (
                            <p className="mt-1">None assigned</p>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-slate-700">Individual skills</p>
                          {personalSkillTitles.length ? (
                            <p className="mt-1">{personalSkillTitles.join(" • ")}</p>
                          ) : (
                            <p className="mt-1">None assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  No students are currently assigned to this lesson.
                </p>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
