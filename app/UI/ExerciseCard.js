"use client";

import Link from "next/link";

export default function ExerciseCard({ item, href, onAddToLessonPlan, selected }) {
  return (
    <article className="flex h-full flex-col rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_18px_35px_rgba(15,23,42,0.1)]">
      <Link href={href} className="group flex h-full flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-teal-700">{item.category}</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950 group-hover:text-teal-800">{item.title}</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{item.difficulty}</span>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1">{item.duration}</span>
          {item.equipment.slice(0, 2).map((equipment) => (
            <span key={equipment} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
              {equipment}
            </span>
          ))}
        </div>
      </Link>

      {onAddToLessonPlan ? (
        <button
          type="button"
          className={`mt-5 rounded-full px-4 py-2 text-sm font-medium transition ${
            selected ? "bg-teal-700 text-white hover:bg-teal-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
          onClick={onAddToLessonPlan}
        >
          {selected ? "Added to lesson plan" : "Add to lesson plan"}
        </button>
      ) : null}
    </article>
  );
}
