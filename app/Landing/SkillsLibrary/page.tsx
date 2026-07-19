"use client";

import { useState } from "react";
import Navbar from "../../UI/Navbar";
import SkillCard from "../../UI/SkillCard";
import { useCoachApp } from "../../lib/coach-store";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function SkillsLibraryPage() {
  const { skillExercises, addSkillExercise, lessonPlan, toggleLessonPlanItem } = useCoachApp();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [equipment, setEquipment] = useState("");
  const [coachingCues, setCoachingCues] = useState("");
  const [progressions, setProgressions] = useState("");
  const [regressions, setRegressions] = useState("");
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
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
          <form
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              addSkillExercise({
                title,
                description,
                difficulty,
                duration,
                equipment: splitValues(equipment),
                coachingCues: splitValues(coachingCues),
                progressions: splitValues(progressions),
                regressions: splitValues(regressions),
                lessonUse,
              });
              setTitle("");
              setDescription("");
              setDifficulty("Beginner");
              setDuration("");
              setEquipment("");
              setCoachingCues("");
              setProgressions("");
              setRegressions("");
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
                  <input
                    type="text"
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Duration</span>
                  <input
                    type="text"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
                    placeholder="5 focused attempts"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Equipment</span>
                <input
                  type="text"
                  value={equipment}
                  onChange={(event) => setEquipment(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Silks, mat"
                />
              </label>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Progressions</span>
                  <input
                    type="text"
                    value={progressions}
                    onChange={(event) => setProgressions(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Assisted version, loaded version"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Regressions</span>
                  <input
                    type="text"
                    value={regressions}
                    onChange={(event) => setRegressions(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Floor drill, spot version"
                  />
                </label>
              </div>

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
                className="w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
              >
                Add skill exercise
              </button>
            </div>
          </form>

          <section className="grid gap-4 sm:grid-cols-2">
            {skillExercises.map((item) => (
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
