"use client";

import { useState } from "react";
import Navbar from "../../UI/Navbar";
import SkillCard from "../../UI/SkillCard";
import { useCoachApp } from "@/app/lib/coach-store";
import type { LibraryItem } from "@/app/lib/coach-data";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const difficultyOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];

export default function SkillsLibraryPage() {
  const { skillExercises, addSkillExercise, lessonPlan, toggleLessonPlanItem } = useCoachApp();
  const [showCreateSkill, setShowCreateSkill] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [coachingCues, setCoachingCues] = useState("");
  const [lessonUse, setLessonUse] = useState("");

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />

      <main className="mx-auto mt-6 w-full max-w-7xl space-y-6">
        <section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Skills library</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Aerial skill cards for lesson planning</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Keep your progressions organized with quick-view cards, detailed drill pages, and custom additions when you want to expand the library.
          </p>
                   <button
            type="button"
            aria-expanded={showCreateSkill}
            className="mt-5 cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setShowCreateSkill((current) => !current)}
          >
            {showCreateSkill ? "Hide create skill" : "Create new skill"}
          </button>
        </section>

        <section className={`grid gap-6 ${showCreateSkill ? "xl:grid-cols-[1fr_1.35fr]" : "grid-cols-1"}`}>
          <div
            className={`overflow-hidden transition-all duration-300 ${showCreateSkill ? "max-h-[2200px] opacity-100" : "max-h-0 opacity-0"}`}
          >
            <form
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
              onSubmit={(event) => {
                event.preventDefault();
                addSkillExercise({
                  title,
                  description,
                  difficulty,
                  duration: "",
                  equipment: [],
                  coachingCues: splitValues(coachingCues),
                  progressions: [],
                  regressions: [],
                  lessonUse,
                });
                setTitle("");
                setDescription("");
                setDifficulty("Beginner");
                setCoachingCues("");
                setLessonUse("");
              }}
            >
              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Skill title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Straddle beat"
                    required
                  />
                </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Describe the skill and where it fits in the progression.
                  "
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Difficulty</span>
                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Coaching cues</span>
                <input
                  type="text"
                  value={coachingCues}
                  onChange={(event) => setCoachingCues(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Stay compact, breathe through the setup"
                />
              </label>


              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Lesson use</span>
                <textarea
                  value={lessonUse}
                  onChange={(event) => setLessonUse(event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Where does this fit in the session?"
                />
              </label>

                <button
                  type="submit"
                  className="cursor-pointer w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
                >
                  Add skill exercise
                </button>
              </div>
            </form>
          </div>

          <section className={`grid gap-4 ${showCreateSkill ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
            {skillExercises.map((item: LibraryItem) => (
              <SkillCard
                key={item.id}
                item={item}
                href={`/Landing/SkillsLibrary/${item.slug}`}
                selected={lessonPlan.skillIds.includes(item.id)}
                onAddToLessonPlan={() => toggleLessonPlanItem("skill", item.id)}
              />
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}
