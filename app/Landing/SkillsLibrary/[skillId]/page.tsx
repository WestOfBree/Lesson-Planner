"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "../../../UI/Navbar";
import { useCoachApp } from "../../../lib/coach-store";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const difficultyOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];

export default function SkillDetailPage() {
  const params = useParams<{ skillId: string }>();
  const searchParams = useSearchParams();
  const { skillExercises, lessonPlan, toggleLessonPlanItem, updateSkillExercise } = useCoachApp();
  const skill = skillExercises.find((item) => item.slug === params.skillId || item.id === params.skillId);

  const [isEditing, setIsEditing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("");
  const [equipment, setEquipment] = useState("");
  const [coachingCues, setCoachingCues] = useState("");
  const [progressions, setProgressions] = useState("");
  const [regressions, setRegressions] = useState("");
  const [lessonUse, setLessonUse] = useState("");

  useEffect(() => {
    if (!skill) {
      return;
    }

    setTitle(skill.title);
    setDescription(skill.description || "");
    setDifficulty(skill.difficulty || "Beginner");
    setDuration(skill.duration || "");
    setEquipment(skill.equipment.join(", "));
    setCoachingCues(skill.coachingCues.join(", "));
    setProgressions(skill.progressions.join(", "));
    setRegressions(skill.regressions.join(", "));
    setLessonUse(skill.lessonUse || "");
  }, [skill]);

  useEffect(() => {
    if (searchParams.get("edit") === "1") {
      setIsEditing(true);
    }
  }, [searchParams]);

  if (!skill) {
    return (
      <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <Navbar />
        <main className="mx-auto mt-6 w-full max-w-4xl rounded-[1.75rem] border border-slate-200 bg-white p-8 text-slate-600 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Not found</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">Skill not found</h2>
          <p className="mt-3 text-base leading-7">The skill you opened is no longer available in the skills library.</p>
          <Link href="/Landing/SkillsLibrary" className="mt-6 inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white">
            Back to skills library
          </Link>
        </main>
      </div>
    );
  }

  const selected = lessonPlan.skillIds.includes(skill.id);

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <Navbar />
      <main className="mx-auto mt-6 grid w-full max-w-5xl gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Skill detail</p>
          <h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">{skill.title}</h2>
          <p className="mt-4 text-base leading-8 text-slate-600">{skill.description}</p>

          <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
            <span className="rounded-full bg-slate-100 px-3 py-1">{skill.difficulty}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">{skill.duration}</span>
            {skill.equipment.map((equipment) => (
              <span key={equipment} className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                {equipment}
              </span>
            ))}
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Coaching cues</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {skill.coachingCues.map((cue) => (
                  <li key={cue} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-600" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Lesson use</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">{skill.lessonUse}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Progressions</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {skill.progressions.map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Regressions</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {skill.regressions.map((item) => (
                  <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <aside className="space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-teal-700">Lesson plan</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Add this skill to your draft plan</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Keep your class sequence close by so you can move from conditioning into technical work with less friction.
            </p>
          </div>

          <button
            type="button"
            className={`w-full rounded-2xl px-4 py-3 font-semibold transition ${
              selected ? "bg-teal-700 text-white hover:bg-teal-800" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
            onClick={() => toggleLessonPlanItem("skill", skill.id)}
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
            {isEditing ? "Cancel edit" : "Edit skill"}
          </button>

          {statusMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
          ) : null}

          {isEditing ? (
            <form
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              onSubmit={(event) => {
                event.preventDefault();
                updateSkillExercise(skill.id, {
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
                setStatusMessage("Skill updated.");
                setIsEditing(false);
              }}
            >
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Title"
                required
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Description"
              />
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
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
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Duration"
              />
              <input
                type="text"
                value={equipment}
                onChange={(event) => setEquipment(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Equipment (comma separated)"
              />
              <input
                type="text"
                value={coachingCues}
                onChange={(event) => setCoachingCues(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Coaching cues (comma separated)"
              />
              <input
                type="text"
                value={progressions}
                onChange={(event) => setProgressions(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Progressions (comma separated)"
              />
              <input
                type="text"
                value={regressions}
                onChange={(event) => setRegressions(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Regressions (comma separated)"
              />
              <textarea
                value={lessonUse}
                onChange={(event) => setLessonUse(event.target.value)}
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
            href="/Landing/SkillsLibrary"
            className="inline-flex rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Back to skills library
          </Link>
        </aside>
      </main>
    </div>
  );
}
