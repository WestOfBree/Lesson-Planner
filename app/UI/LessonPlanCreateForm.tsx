import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { CoachClassData, LibraryItem, SkillLibraryItem, StudentProfileData } from "@/app/lib/coach-data";

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
  conditioningRepsById: Record<string, number>;
  selectedClassSkillIds: string[];
  perStudentSkillIds: Record<string, string[]>;
  setTitle: Dispatch<SetStateAction<string>>;
  setClassId: Dispatch<SetStateAction<string>>;
  setClassDate: Dispatch<SetStateAction<string>>;
  setNotes: Dispatch<SetStateAction<string>>;
  setSelectedStudentIds: Dispatch<SetStateAction<string[]>>;
  setSelectedConditioningIds: Dispatch<SetStateAction<string[]>>;
  setConditioningRepsById: Dispatch<SetStateAction<Record<string, number>>>;
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

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Students in this lesson</p>
          <p className="text-xs text-slate-500">Select students for a targeted lesson. Leave none selected to assign to the whole class.</p>
          <div className="grid gap-2">
            {classId ? (
              classStudents.length ? (
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
              )
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Select a class to manage student targeting.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Conditioning blocks</p>
          <p className="text-xs text-slate-500">Each selected block can include a rep target for class tracking.</p>
          <div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
            {conditioningExercises.map((item) => (
              <label
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
              >
                <span className="flex-1">{item.title}</span>
                <div className="flex items-center gap-2">
                  {selectedConditioningIds.includes(item.id) ? (
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
                    checked={selectedConditioningIds.includes(item.id)}
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
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Skill blocks for whole class</p>
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
