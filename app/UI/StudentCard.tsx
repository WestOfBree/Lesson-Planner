import Link from "next/link";
import type { CoachClassData, StudentProfileData } from "../lib/coach-data";

interface StudentCardProps {
  student: StudentProfileData;
  classes: CoachClassData[];
  onProgressChange?: (studentId: string, progress: number) => void;
}

const StudentCard = ({ student, classes, onProgressChange }: StudentCardProps) => {
  const relatedClasses = classes.filter((classItem) => student.classIds.includes(classItem.id));

  return (
    <article className="rounded-3xl border border-pink-200/70 bg-white p-5 shadow-[0_16px_36px_rgba(190,24,93,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-pink-700">Student card</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950">{student.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{student.level}</p>
        </div>
        <div className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-800">
          Progress {student.progress}%
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-600">{student.notes || "No notes added yet."}</p>

      <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Focus</p>
          <p className="mt-1 font-medium text-slate-800">{student.focus || "General development"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Last updated</p>
          <p className="mt-1 font-medium text-slate-800">{new Date(student.lastUpdated).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Progress tracking</span>
          <span>{student.progress}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={student.progress}
          onChange={(event) => onProgressChange?.(student.id, Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-pink-100 accent-pink-600"
        />
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Class tags</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {relatedClasses.length ? (
            relatedClasses.map((classItem) => (
              <span key={classItem.id} className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">
                {classItem.name}
              </span>
            ))
          ) : (
            <span className="text-sm text-slate-500">Not assigned to a class yet.</span>
          )}
        </div>
      </div>

      {student.goals.length ? (
        <div className="mt-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Goals</p>
          <ul className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
            {student.goals.map((goal) => (
              <li key={goal} className="rounded-full bg-pink-100 px-3 py-1 text-pink-800">
                {goal}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={`/Landing/Students/${student.id}`}
          className="inline-flex cursor-pointer rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-pink-300 hover:bg-pink-50"
        >
          Open student profile
        </Link>
        <Link
          href={`/Landing/Students/${student.id}?edit=1`}
          className="inline-flex cursor-pointer rounded-full bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-200"
        >
          Edit
        </Link>
      </div>
    </article>
  );
};

export default StudentCard;
