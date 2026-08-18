"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Navbar from "../../../UI/Navbar";
import { useCoachApp } from "../../../lib/coach-store";
import { useActionResponse } from "../../../lib/action-response";
import type { SkillLibraryItem } from "../../../lib/coach-data";

const splitValues = (value: string) =>
  value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const difficultyOptions = ["Beginner", "Begintermediate", "Intermediate", "Upper Intermediate", "Advanced"];

export default function SkillDetailPage() {
  const params = useParams<{ skillId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    skillExercises,
    lessonPlan,
    friends,
    toggleLessonPlanItem,
    updateSkillExercise,
    uploadSkillExerciseVideo,
    removeSkillExerciseVideo,
    deleteSkillExercise,
    shareSkillExercise,
  } = useCoachApp();
  const skill = useMemo(
    () => skillExercises.find((item: SkillLibraryItem) => item.slug === params.skillId || item.id === params.skillId),
    [params.skillId, skillExercises],
  );
  const formDefaults = useMemo(
    () => ({
      title: skill?.title ?? "",
      description: skill?.description ?? "",
      difficulty: skill?.difficulty ?? "Beginner",
      coachingCues: skill?.coachingCues?.join(", ") ?? "",
      lessonUse: skill?.lessonUse ?? "",
    }),
    [skill],
  );

  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [shareTargetId, setShareTargetId] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [editVideoFile, setEditVideoFile] = useState<File | null>(null);
  const [title, setTitle] = useState(formDefaults.title);
  const [description, setDescription] = useState(formDefaults.description);
  const [difficulty, setDifficulty] = useState(formDefaults.difficulty);
  const [coachingCues, setCoachingCues] = useState(formDefaults.coachingCues);
  const [lessonUse, setLessonUse] = useState(formDefaults.lessonUse);
  const { showActionResponse } = useActionResponse();

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

          {skill.videoUrl ? (
            <div className="mt-8 space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Skill video</p>
              <video
                controls
                preload="metadata"
                className="w-full rounded-2xl border border-slate-200 bg-black/80"
                src={skill.videoUrl}
              >
                Your browser does not support video playback.
              </video>
            </div>
          ) : null}
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
              setIsEditing((current) => !current);
            }}
          >
            {isEditing ? "Cancel edit" : "Edit skill"}
          </button>

          <button
            type="button"
            className="w-full cursor-pointer rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 font-semibold text-rose-700 transition hover:bg-rose-100"
            onClick={async () => {
              if (window.confirm(`Delete ${skill.title}?`)) {
                try {
                  await deleteSkillExercise(skill.id);
                  router.push("/Landing/SkillsLibrary");
                } catch (error) {
                  showActionResponse({ tone: "error", message: error instanceof Error ? error.message : "Unable to delete skill." });
                }
              }
            }}
          >
            Delete skill
          </button>

          <form
            className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
            onSubmit={async (event) => {
              event.preventDefault();

              if (!shareTargetId) {
                showActionResponse({ tone: "error", message: "Select a coach to share this skill." });
                return;
              }

              setIsSharing(true);

              try {
                let includeVideo = true;

                if (skill.videoUrl) {
                  includeVideo = window.confirm("Share this skill video too? Click OK to include the video, or Cancel to share without it.");
                }

                await shareSkillExercise(skill.id, shareTargetId, { includeVideo });
                const targetCoach = friends.find((friend) => friend.id === shareTargetId);
                showActionResponse({
                  tone: "success",
                  message: `Shared ${skill.title} with ${targetCoach?.displayName ?? "your friend"}. Awaiting their review.`,
                });
                setShareTargetId("");
              } catch (error) {
                showActionResponse({ tone: "error", message: error instanceof Error ? error.message : "Unable to share skill." });
              } finally {
                setIsSharing(false);
              }
            }}
          >
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-teal-700">Share with coach</h4>
            {friends.length ? (
              <>
                <select
                  value={shareTargetId}
                  onChange={(event) => setShareTargetId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                  aria-label="Select coach to share skill with"
                >
                  <option value="">Select friend coach</option>
                  {friends.map((friend) => (
                    <option key={friend.id} value={friend.id}>
                      {friend.displayName} ({friend.email})
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={isSharing}
                  className="w-full cursor-pointer rounded-xl bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSharing ? "Sharing..." : "Share skill"}
                </button>
              </>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                Add friends on the coach profile page to share skills.
              </p>
            )}
          </form>

          {isEditing ? (
            <form
              className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              onSubmit={async (event) => {
                event.preventDefault();

                setIsSavingEdit(true);

                try {
                  updateSkillExercise(skill.id, {
                    title,
                    description,
                    difficulty,
                    coachingCues: splitValues(coachingCues),
                    lessonUse,
                  });

                  if (editVideoFile) {
                    await uploadSkillExerciseVideo(skill.id, editVideoFile);
                    setEditVideoFile(null);
                  }

                  showActionResponse({ tone: "success", message: "Skill updated." });
                  setIsEditing(false);
                } catch (error) {
                  showActionResponse({ tone: "error", message: error instanceof Error ? error.message : "Unable to update skill." });
                } finally {
                  setIsSavingEdit(false);
                }
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
                value={coachingCues}
                onChange={(event) => setCoachingCues(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Coaching cues (comma separated)"
              />
              <textarea
                value={lessonUse}
                onChange={(event) => setLessonUse(event.target.value)}
                className="min-h-16 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-teal-600"
                placeholder="Lesson use"
              />
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Replace skill video (optional)</span>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) => setEditVideoFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-300"
                />
              </label>
              {skill.videoUrl ? (
                <button
                  type="button"
                  disabled={isUploadingVideo}
                  className="w-full cursor-pointer rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
                  onClick={async () => {
                    setIsUploadingVideo(true);

                    try {
                      await removeSkillExerciseVideo(skill.id);
                      showActionResponse({ tone: "success", message: "Skill video removed." });
                    } catch (error) {
                      showActionResponse({ tone: "error", message: error instanceof Error ? error.message : "Unable to remove skill video." });
                    } finally {
                      setIsUploadingVideo(false);
                    }
                  }}
                >
                  Remove current video
                </button>
              ) : null}
              <button
                type="submit"
                disabled={isSavingEdit}
                className="w-full rounded-xl bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingEdit ? "Saving..." : "Save changes"}
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
