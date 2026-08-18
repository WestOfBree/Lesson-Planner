import type {
  CoachClassData,
  ConditioningPrescription,
  LibraryItem,
  SkillLibraryItem,
  StudentProfileData,
} from "@/app/lib/coach-data";

type LessonPlanLivePreviewProps = {
  classes: CoachClassData[];
  students: StudentProfileData[];
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
  activeStudentIds: string[];
};

const LessonPlanLivePreview = ({
  classes,
  students,
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
  activeStudentIds,
}: LessonPlanLivePreviewProps) => {
  const selectedClass = classes.find((entry) => entry.id === classId);
  const selectedClassName = selectedClass?.name ?? "No class selected";

  const resolvedTitle = title.trim()
    ? title
    : classDate
      ? `${selectedClassName} - ${new Date(`${classDate}T00:00:00`).toLocaleDateString()}`
      : "Untitled lesson plan";

  const targetStudents = activeStudentIds
    .map((studentId) => students.find((student) => student.id === studentId))
    .filter((student): student is StudentProfileData => Boolean(student));

  const hasAnyConditioningValue = (itemId: string) => {
    const prescription = conditioningRepsById[itemId] ?? {};
    return (
      prescription.reps !== undefined ||
      prescription.holdSeconds !== undefined ||
      prescription.sets !== undefined
    );
  };

  const conditioningItems = selectedConditioningIds
    .filter((itemId) => hasAnyConditioningValue(itemId))
    .map((itemId) => conditioningExercises.find((item) => item.id === itemId))
    .filter((item): item is LibraryItem => Boolean(item));

  const classSkills = selectedClassSkillIds
    .map((itemId) => skillExercises.find((item) => item.id === itemId))
    .filter((item): item is SkillLibraryItem => Boolean(item));

  const perStudentSkillEntries = Object.entries(perStudentSkillIds)
    .map(([studentId, skillIds]) => {
      const student = students.find((entry) => entry.id === studentId);

      if (!student) {
        return null;
      }

      const items = skillIds
        .map((skillId) => skillExercises.find((entry) => entry.id === skillId))
        .filter((item): item is SkillLibraryItem => Boolean(item));

      if (!items.length) {
        return null;
      }

      return { studentName: student.name, items };
    })
    .filter((entry): entry is { studentName: string; items: SkillLibraryItem[] } => Boolean(entry));

  const formatConditioningPrescription = (itemId: string) => {
    const prescription = conditioningRepsById[itemId] ?? {};
    const parts = [
      prescription.reps ? `${prescription.reps} reps` : null,
      prescription.holdSeconds ? `${prescription.holdSeconds}s hold` : null,
      prescription.sets ? `${prescription.sets} sets` : null,
    ].filter((part): part is string => Boolean(part));

    return parts.length ? parts.join(" • ") : "No prescription set";
  };

  return (
    <aside className="rounded-[1.75rem] border border-indigo-200/70 bg-white/90 p-6 shadow-[0_18px_46px_rgba(79,70,229,0.15)] dark:border-indigo-300/40 dark:bg-slate-900/80 sm:p-8">
      <p className="text-xs uppercase tracking-[0.35em] text-indigo-100 dark:text-indigo-300">Live mockup</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">{resolvedTitle}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {selectedClassName}
        {classDate ? ` - ${new Date(`${classDate}T00:00:00`).toLocaleDateString()}` : " - Pick a class date"}
      </p>

      <div className="mt-6 space-y-5 text-sm text-slate-700 dark:text-slate-300">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Students</p>
          <p className="mt-2">{selectedStudentIds.length ? "Targeted students" : "Whole class assignment"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {targetStudents.length ? (
              targetStudents.map((student) => (
                <span key={student.id} className="rounded-full bg-indigo-50 px-3 py-1 text-xs text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-200">
                  {student.name}
                </span>
              ))
            ) : (
              <span className="text-slate-500 dark:text-slate-400">Students will populate after class selection.</span>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Conditioning blocks</p>
          <div className="mt-2 space-y-2">
            {conditioningItems.length ? (
              conditioningItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-xl bg-cyan-50 px-3 py-2 dark:bg-cyan-500/15">
                  <span>{item.title}</span>
                  <span className="text-xs font-semibold text-cyan-800 dark:text-cyan-200">{formatConditioningPrescription(item.id)}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No conditioning blocks selected yet.</p>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Class skill blocks</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {classSkills.length ? (
              classSkills.map((item) => (
                <span key={item.id} className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-800 dark:bg-orange-500/20 dark:text-orange-200">
                  {item.title}
                </span>
              ))
            ) : (
              <span className="text-slate-500 dark:text-slate-400">No class skills selected yet.</span>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Per-student skill blocks</p>
          <div className="mt-2 space-y-2">
            {perStudentSkillEntries.length ? (
              perStudentSkillEntries.map((entry) => (
                <div key={entry.studentName} className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{entry.studentName}</p>
                  <p className="mt-1 text-sm">{entry.items.map((item) => item.title).join(", ")}</p>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400">No individual skill assignments yet.</p>
            )}
          </div>
        </section>

        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Coach notes</p>
          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
            {notes.trim() || "Add warm-up flow, key coaching cues, and transitions for your class."}
          </p>
        </section>
      </div>
    </aside>
  );
};

export default LessonPlanLivePreview;
