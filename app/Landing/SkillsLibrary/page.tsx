"use client";

import { useMemo, useState } from "react";
import Navbar from "../../UI/Navbar";
import SkillCard from "../../UI/SkillCard";
import { useCoachApp } from "@/app/lib/coach-store";
import { useActionResponse } from "@/app/lib/action-response";
import type { SkillLibraryItem } from "@/app/lib/coach-data";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const difficultyOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];

type SkillSortOption = "none" | "difficulty" | "az" | "za";

const difficultyRank: Record<string, number> = {
  beginner: 0,
  begintermediate: 1,
  intermediate: 2,
  "upper intermediate": 3,
  advanced: 4,
};

export default function SkillsLibraryPage() {
  const { skillExercises, addSkillExercise, uploadSkillExerciseVideo, lessonPlan, toggleLessonPlanItem } = useCoachApp();
  const { showActionResponse } = useActionResponse();
  const [showCreateSkill, setShowCreateSkill] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [coachingCues, setCoachingCues] = useState("");
  const [lessonUse, setLessonUse] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SkillSortOption>("none");

  const sortedSkillExercises = useMemo(() => {
    const items = [...skillExercises];

    if (sortBy === "difficulty") {
      return items.sort((left, right) => {
        const leftRank = difficultyRank[left.difficulty.trim().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;
        const rightRank = difficultyRank[right.difficulty.trim().toLowerCase()] ?? Number.MAX_SAFE_INTEGER;

        if (leftRank !== rightRank) {
          return leftRank - rightRank;
        }

        return left.title.localeCompare(right.title);
      });
    }

    if (sortBy === "az") {
      return items.sort((left, right) => left.title.localeCompare(right.title));
    }

    if (sortBy === "za") {
      return items.sort((left, right) => right.title.localeCompare(left.title));
    }

    return items;
  }, [skillExercises, sortBy]);

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
              onSubmit={async (event) => {
                event.preventDefault();

                setIsSubmitting(true);

                try {
                  const createdSkill = addSkillExercise({
                    title,
                    description,
                    difficulty,
                    coachingCues: splitValues(coachingCues),
                    lessonUse,
                  });

                  if (videoFile) {
                    await uploadSkillExerciseVideo(createdSkill.id, videoFile);
                  }

                  showActionResponse({ tone: "success", message: "Skill exercise created." });
                  setTitle("");
                  setDescription("");
                  setDifficulty("Beginner");
                  setCoachingCues("");
                  setLessonUse("");
                  setVideoFile(null);
                } catch (error) {
                  showActionResponse({
                    tone: "error",
                    message: error instanceof Error ? error.message : "Unable to create skill exercise.",
                  });
                } finally {
                  setIsSubmitting(false);
                }
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

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Skill video (optional)</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
                />
              </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="cursor-pointer w-full rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Add skill exercise"}
                </button>
              </div>
            </form>
          </div>

          <section className="space-y-4">
            <div className="inline-flex flex-wrap items-center justify-start gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3">
              <p className="text-sm font-medium text-slate-700">Sort skills</p>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SkillSortOption)}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-teal-600"
                  aria-label="Sort skills"
                >
                  <option value="none">Default</option>
                  <option value="difficulty">Skill level</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
              </label>
            </div>

            <div className={`grid gap-4 ${showCreateSkill ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
            {sortedSkillExercises.map((item: SkillLibraryItem) => (
              <SkillCard
                key={item.id}
                item={item}
                href={`/Landing/SkillsLibrary/${item.slug}`}
                selected={lessonPlan.skillIds.includes(item.id)}
                onAddToLessonPlan={() => toggleLessonPlanItem("skill", item.id)}
              />
            ))}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
