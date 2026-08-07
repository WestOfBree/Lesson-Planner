import Link from "next/link";
import type { AssignedLessonPlan, CoachClassData } from "@/app/lib/coach-data";

type LessonPlanAssignedListProps = {
  assignedLessonPlans: AssignedLessonPlan[];
  classes: CoachClassData[];
};

const LessonPlanAssignedList = ({ assignedLessonPlans, classes }: LessonPlanAssignedListProps) => {
  return (
    <section className="space-y-4">
      {assignedLessonPlans.length ? (
        assignedLessonPlans.map((plan) => {
          const classItem = classes.find((entry) => entry.id === plan.classId);

          return (
            <article
              key={plan.id}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:shadow-[0_20px_40px_rgba(15,23,42,0.14)] dark:border-slate-700 dark:bg-slate-900/80 dark:shadow-[0_18px_40px_rgba(2,6,23,0.45)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-teal-700 dark:text-teal-300">Past lessons</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-slate-100">
                    <Link href={`/Landing/LessonPlanner/${plan.id}`} className="cursor-pointer transition hover:text-teal-700 dark:hover:text-teal-300">
                      {plan.title}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
                    {classItem?.name ?? "Unknown class"} · {new Date(`${plan.classDate}T00:00:00`).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/Landing/LessonPlanner/${plan.id}`}
                    className="inline-flex cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/80"
                  >
                    View details
                  </Link>
                  <Link
                    href={`/Landing/LessonPlanner/${plan.id}?edit=1`}
                    className="inline-flex cursor-pointer rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-200 transition hover:border-teal-300 hover:bg-teal-100 dark:border-teal-300/40 dark:bg-teal-500/15 dark:text-teal-200 dark:hover:bg-teal-500/30"
                  >
                    Edit lesson
                  </Link>
                </div>
              </div>

              {plan.notes ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{plan.notes}</p> : null}
              {plan.outcomeNotes ? (
                <p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-300/40 dark:bg-emerald-500/15 dark:text-emerald-200">
                  Outcome notes: {plan.outcomeNotes}
                </p>
              ) : null}

              <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                <p>
                  Students in lesson: {plan.studentIds.length ? plan.studentIds.length : classItem?.studentIds.length ?? 0}
                </p>
                <p>Conditioning items: {plan.conditioningIds.length}</p>
                <p>Class skill items: {plan.skillIds.length}</p>
                <p>Per-student skill assignments: {Object.keys(plan.perStudentSkillIds ?? {}).length}</p>
              </div>
            </article>
          );
        })
      ) : (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-300">
          No assigned lesson plans yet. Build one on the left and attach it to a class date.
        </div>
      )}
    </section>
  );
};

export default LessonPlanAssignedList;
