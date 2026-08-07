import { useState, type Dispatch, type FormEvent, type SetStateAction } from "react";
import type {
  CoachClassData,
  ConditioningPrescription,
  LibraryItem,
  SkillLibraryItem,
  StudentProfileData,
} from "@/app/lib/coach-data";

type LessonPlanCreateFormProps = {
  classes: CoachClassData[];
  students: StudentProfileData[];
  classStudents: StudentProfileData[];
  activeStudentIds: string[];
  conditioningExercises: LibraryItem[];
  skillExercises: SkillLibraryItem[];
  title: string;
  classId: string;
  classDate: string;
  notes: string;
  selectedStudentIds: string[];
  selectedConditioningIds: string[];
  conditioningRepsById: Record<string, ConditioningPrescription>;
  selectedClassSkillIds: string[];
  perStudentSkillIds: Record<string, string[]>;
  setTitle: Dispatch<SetStateAction<string>>;
  setClassId: Dispatch<SetStateAction<string>>;
  setClassDate: Dispatch<SetStateAction<string>>;
  setNotes: Dispatch<SetStateAction<string>>;
  setSelectedStudentIds: Dispatch<SetStateAction<string[]>>;
  setSelectedConditioningIds: Dispatch<SetStateAction<string[]>>;
  setConditioningRepsById: Dispatch<SetStateAction<Record<string, ConditioningPrescription>>>;
  setSelectedClassSkillIds: Dispatch<SetStateAction<string[]>>;
  setPerStudentSkillIds: Dispatch<SetStateAction<Record<string, string[]>>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const LessonPlanCreateForm = ({
  classes,
  students,
  classStudents,
  activeStudentIds,
  conditioningExercises,
  skillExercises,
  title,
  classId,
  classDate,
  notes,
  selectedStudentIds,
  selectedConditioningIds,
  conditioningRepsById,
  selectedClassSkillIds,
  perStudentSkillIds,
  setTitle,
  setClassId,
  setClassDate,
  setNotes,
  setSelectedStudentIds,
  setSelectedConditioningIds,
  setConditioningRepsById,
  setSelectedClassSkillIds,
  setPerStudentSkillIds,
  onSubmit,
}: LessonPlanCreateFormProps) => {
  const [isStudentsOpen, setIsStudentsOpen] = useState(true);
  const [isConditioningOpen, setIsConditioningOpen] = useState(true);
  const [isClassSkillsOpen, setIsClassSkillsOpen] = useState(true);
  const [isPerStudentSkillsOpen, setIsPerStudentSkillsOpen] = useState(false);

  const parsePositiveNumber = (value: string) => {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) && numericValue > 0 ? Math.round(numericValue) : undefined;
  };

  const toggleSection = (setter: Dispatch<SetStateAction<boolean>>) => {
    setter((current) => !current);
  };

  return (
    <form
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
      onSubmit={onSubmit}
    >
      <div className="space-y-5">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Lesson title (optional)</span>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
            placeholder="Leave blank to use class name and date"
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

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection(setIsStudentsOpen)}
            aria-expanded={isStudentsOpen}
          >
            <p className="text-sm font-medium text-slate-700">Students in this lesson</p>
            <span className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{isStudentsOpen ? "Collapse" : "Expand"}</span>
          </button>
          {isStudentsOpen ? (
            <>
              <p className="text-xs text-slate-500">Select students for a targeted lesson. Leave none selected to assign to the whole class.</p>
              <div className="grid gap-2">
                {classId ? (
                  classStudents.length ? (
                    classStudents.map((student) => (
                      <label
                        key={student.id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
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
                    <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                      This class has no students yet.
                    </p>
                  )
                ) : (
                  <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                    Select a class to manage student targeting.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection(setIsConditioningOpen)}
            aria-expanded={isConditioningOpen}
          >
            <p className="text-sm font-medium text-slate-700">Conditioning blocks</p>
            <span className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{isConditioningOpen ? "Collapse" : "Expand"}</span>
          </button>
          {isConditioningOpen ? (
            <>
              <p className="text-xs text-slate-500">Set reps, hold seconds, and/or sets for each selected exercise.</p>
              <div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
                {conditioningExercises.map((item) => {
                  const isSelected = selectedConditioningIds.includes(item.id);
                  const currentPrescription = conditioningRepsById[item.id] ?? {};

                  return (
                    <label
                      key={item.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
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
                                  [item.id]: current[item.id] ?? { reps: 8 },
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

                                setConditioningRepsById((current) => {
                                  const next = {
                                    ...(current[item.id] ?? {}),
                                    reps: nextReps,
                                  };

                                  return {
                                    ...current,
                                    [item.id]: next,
                                  };
                                });
                              }}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600"
                              aria-label={`${item.title} reps`}
                              placeholder="e.g. 8"
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
                                const nextHold = parsePositiveNumber(event.target.value);

                                setConditioningRepsById((current) => {
                                  const next = {
                                    ...(current[item.id] ?? {}),
                                    holdSeconds: nextHold,
                                  };

                                  return {
                                    ...current,
                                    [item.id]: next,
                                  };
                                });
                              }}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600"
                              aria-label={`${item.title} hold seconds`}
                              placeholder="e.g. 30"
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

                                setConditioningRepsById((current) => {
                                  const next = {
                                    ...(current[item.id] ?? {}),
                                    sets: nextSets,
                                  };

                                  return {
                                    ...current,
                                    [item.id]: next,
                                  };
                                });
                              }}
                              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600"
                              aria-label={`${item.title} sets`}
                              placeholder="e.g. 3"
                            />
                          </label>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-400">Select to add reps.</p>
                      )}
                    </label>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection(setIsClassSkillsOpen)}
            aria-expanded={isClassSkillsOpen}
          >
            <p className="text-sm font-medium text-slate-700">Skill blocks for whole class</p>
            <span className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{isClassSkillsOpen ? "Collapse" : "Expand"}</span>
          </button>
          {isClassSkillsOpen ? (
            <div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
              {skillExercises.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
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
          ) : null}
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <button
            type="button"
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection(setIsPerStudentSkillsOpen)}
            aria-expanded={isPerStudentSkillsOpen}
          >
            <p className="text-sm font-medium text-slate-700">Skill blocks per student</p>
            <span className="cursor-pointer text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{isPerStudentSkillsOpen ? "Collapse" : "Expand"}</span>
          </button>
          {isPerStudentSkillsOpen ? (
            <>
              <p className="text-xs text-slate-500">Assign extra or personalized skills to specific students.</p>
              {activeStudentIds.length ? (
                activeStudentIds.map((studentId) => {
                  const student = students.find((entry) => entry.id === studentId);

                  if (!student) {
                    return null;
                  }

                  const selectedIds = perStudentSkillIds[student.id] ?? [];

                  return (
                    <div key={student.id} className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      <div className="grid max-h-88 gap-2 overflow-y-auto pr-1">
                        {skillExercises.map((item) => (
                          <label
                            key={`${student.id}-${item.id}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
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
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-500">
                  Select a class with students to assign individual skill blocks.
                </p>
              )}
            </>
          ) : null}
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
          disabled={!classes.length}
        >
          Save and assign lesson plan
        </button>

        {!classes.length ? (
          <p className="text-sm text-slate-500">Create a class first before assigning a lesson plan.</p>
        ) : null}
      </div>
    </form>
  );
};

export default LessonPlanCreateForm;
