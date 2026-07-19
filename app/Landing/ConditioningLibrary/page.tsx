"use client";

import { useState } from "react";
import ExerciseCard from "../../UI/ExerciseCard";
import Navbar from "../../UI/Navbar";
import { useCoachApp } from "../../lib/coach-store";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

export default function ConditioningLibraryPage() {
  const { conditioningExercises, addConditioningExercise, lessonPlan, toggleLessonPlanItem } = useCoachApp();
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
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Conditioning library</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Strength work to support aerial training</h2>
          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Start with the built-in exercises, then add custom conditioning cards that match your own coaching style.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.35fr]">
          <form
            className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();
              addConditioningExercise({
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
                <span className="text-sm font-medium text-slate-700">Exercise title</span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Hollow body rocks"
                  required
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Description</span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-28 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Describe what the exercise builds and how it supports aerial work."
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
                    placeholder="3 rounds of 10 reps"
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
                  placeholder="Floor, mat"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Coaching cues</span>
                <input
                  type="text"
                  value={coachingCues}
                  onChange={(event) => setCoachingCues(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Brace the ribs, keep the neck long"
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
                    placeholder="Tempo reps, loaded version"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-slate-700">Regressions</span>
                  <input
                    type="text"
                    value={regressions}
                    onChange={(event) => setRegressions(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                    placeholder="Wall version, supported version"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Lesson use</span>
                <textarea
                  value={lessonUse}
                  onChange={(event) => setLessonUse(event.target.value)}
                  className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
                  placeholder="Where does this fit in the lesson?"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
              >
                Add conditioning exercise
              </button>
            </div>
          </form>

          <section className="grid gap-4 sm:grid-cols-2">
            {conditioningExercises.map((item) => (
              <ExerciseCard
                key={item.id}
                item={item}
                href={`/Landing/ConditioningLibrary/${item.slug}`}
                selected={lessonPlan.conditioningIds.includes(item.id)}
                onAddToLessonPlan={() => toggleLessonPlanItem("conditioning", item.id)}
              />
            ))}
          </section>
        </section>
      </main>
    </div>
  );
}
