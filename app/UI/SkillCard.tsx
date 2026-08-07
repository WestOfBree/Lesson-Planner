import Link from "next/link";
import type { SkillLibraryItem } from "../lib/coach-data";

interface SkillCardProps {
  item: SkillLibraryItem;
  href: string;
  onAddToLessonPlan?: () => void;
  selected?: boolean;
}

export default function SkillCard({ item, href, onAddToLessonPlan, selected }: SkillCardProps) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-pink-200/70 bg-white p-5 shadow-[0_16px_36px_rgba(190,24,93,0.12)] transition hover:shadow-[0_24px_44px_rgba(190,24,93,0.2)] dark:border-pink-300/35 dark:bg-slate-900/80 dark:shadow-[0_18px_38px_rgba(2,6,23,0.45)]">
      <Link href={href} className="group flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-pink-700 dark:text-pink-300">{item.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950 group-hover:text-pink-700 dark:text-slate-100 dark:group-hover:text-pink-300">{item.title}</h3>
          </div>
          <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-medium text-pink-800 dark:bg-pink-400/20 dark:text-pink-200">{item.difficulty}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>


        <div className="mt-5 grid gap-3">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Coaching cues</p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {item.coachingCues.slice(0, 2).map((cue) => (
              <li key={cue} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-pink-600 dark:bg-pink-300" />
                <span>{cue}</span>
              </li>
            ))}
          </ul>
        </div>
      </Link>

      {onAddToLessonPlan ? (
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
              selected
                ? "bg-linear-to-r from-pink-600 to-rose-500 text-white hover:from-pink-700 hover:to-rose-600"
                : "bg-pink-50 text-slate-700 hover:bg-pink-100 dark:bg-pink-500/15 dark:text-pink-200 dark:hover:bg-pink-500/30"
            }`}
            onClick={onAddToLessonPlan}
          >
            {selected ? "Added to lesson plan" : "Add to lesson plan"}
          </button>
          <Link
            href={`${href}?edit=1`}
            className="inline-flex rounded-full bg-violet-100 px-3 py-2 text-xs font-semibold text-violet-800 transition hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/35"
          >
            Edit
          </Link>
        </div>
      ) : null}
    </article>
  );
}
