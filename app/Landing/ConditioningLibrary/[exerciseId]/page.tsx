"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import Navbar from "../../../UI/Navbar";
import { useCoachApp } from "../../../lib/coach-store";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const difficultyOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];

interface ExerciseFormState {
  exerciseId: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  equipment: string;
  coachingCues: string;
  progressions: string;
  regressions: string;
  lessonUse: string;
}

export default function ConditioningDetailPage() {
  const params = useParams<{ exerciseId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { conditioningExercises, lessonPlan, toggleLessonPlanItem, updateConditioningExercise, deleteConditioningExercise } = useCoachApp();
  const exercise = conditioningExercises.find((item) => item.slug === params.exerciseId || item.id === params.exerciseId);

  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [statusMessage, setStatusMessage] = useState("");
  const [draft, setDraft] = useState<ExerciseFormState | null>(null);

  if (!exercise) {
    return (
      <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <Navbar />
        <main className="mx-auto mt-6 w-full max-w-4xl rounded-[1.75rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Not found</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Conditioning exercise not found</h2>
          <p className="mt-3 text-base leading-7">The item you opened is no longer available in the conditioning library.</p>
          <Link href="/Landing/ConditioningLibrary" className="mt-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            Back to conditioning library
          </Link>
        </main>
      </div>
    );
  }

  const selected = lessonPlan.conditioningIds.includes(exercise.id);
  const baseFormState: ExerciseFormState = {
    exerciseId: exercise.id,
    title: exercise.title,
    description: exercise.description || "",
    difficulty: exercise.difficulty || "Beginner",
    duration: exercise.duration || "",
    equipment: exercise.equipment.join(", "),
    coachingCues: exercise.coachingCues.join(", "),
    progressions: exercise.progressions.join(", "),
    regressions: exercise.regressions.join(", "),
    lessonUse: exercise.lessonUse || "",
  };
  const formState = draft?.exerciseId === exercise.id ? draft : baseFormState;
  const updateFormState = (updater: (current: ExerciseFormState) => ExerciseFormState) => {
    setDraft((current) => {
      const activeState = current?.exerciseId === exercise.id ? current : baseFormState;
      return updater(activeState);
    });
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />
      <main className="mx-auto mt-6 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Conditioning detail</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{exercise.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{exercise.description}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">{exercise.difficulty}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{exercise.duration}</span>
            {exercise.equipment.map((equipment) => (
              <span key={equipment} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                {equipment}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Coaching cues</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {exercise.coachingCues.map((cue) => (
                  <li key={cue} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lesson use</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{exercise.lessonUse}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Progressions</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {exercise.progressions.map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Regressions</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {exercise.regressions.map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Lesson plan</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Add this drill to today&apos;s class plan</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Keep your session notes organized by toggling this exercise into the draft lesson plan.
            </p>
          </div>

          <button
            type="button"
            className={`w-full rounded-2xl px-4 py-3 font-semibold transition ${
              selected ? "bg-teal-700 text-white hover:bg-teal-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => toggleLessonPlanItem("conditioning", exercise.id)}
          >
            {selected ? "Remove from lesson plan" : "Add to lesson plan"}
          </button>

          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => {
              setStatusMessage("");
              setIsEditing((current) => !current);
            }}
          >
            {isEditing ? "Cancel edit" : "Edit exercise"}
          </button>

          <button
            type="button"
            className="w-full cursor-pointer rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-100"
            onClick={() => {
              if (window.confirm(`Delete ${exercise.title}?`)) {
                deleteConditioningExercise(exercise.id);
                router.push("/Landing/ConditioningLibrary");
              }
            }}
          >
            Delete exercise
          </button>

          {statusMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
          ) : null}

          {isEditing ? (
            <form
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateConditioningExercise(exercise.id, {
                  title: formState.title,
                  description: formState.description,
                  difficulty: formState.difficulty,
                  duration: formState.duration,
                  equipment: splitValues(formState.equipment),
                  coachingCues: splitValues(formState.coachingCues),
                  progressions: splitValues(formState.progressions),
                  regressions: splitValues(formState.regressions),
                  lessonUse: formState.lessonUse,
                });
                setStatusMessage("Conditioning exercise updated.");
                setIsEditing(false);
              }}
            >
              <input
                type="text"
                value={formState.title}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, title: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Title"
                required
              />
              <textarea
                value={formState.description}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, description: nextValue }));
                }}
                className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Description"
              />
              <select
                value={formState.difficulty}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, difficulty: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
              >
                {difficultyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={formState.duration}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, duration: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Duration"
              />
              <input
                type="text"
                value={formState.equipment}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, equipment: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Equipment (comma separated)"
              />
              <input
                type="text"
                value={formState.coachingCues}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, coachingCues: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Coaching cues (comma separated)"
              />
              <input
                type="text"
                value={formState.progressions}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, progressions: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Progressions (comma separated)"
              />
              <input
                type="text"
                value={formState.regressions}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, regressions: nextValue }));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Regressions (comma separated)"
              />
              <textarea
                value={formState.lessonUse}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  updateFormState((current) => ({ ...current, lessonUse: nextValue }));
                }}
                className="min-h-16 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Lesson use"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Save changes
              </button>
            </form>
          ) : null}

          <Link
            href="/Landing/ConditioningLibrary"
            className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to conditioning library
          </Link>
        </aside>
      </main>
    </div>
  );
}
