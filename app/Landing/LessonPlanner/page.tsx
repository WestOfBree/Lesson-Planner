"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "../../UI/Navbar";
import { useCoachApp } from "@/app/lib/coach-store";
import type { AssignedLessonPlan, CoachClassData, LibraryItem, StudentProfileData } from "@/app/lib/coach-data";

export default function LessonPlannerPage() {
	const {
		classes,
		students,
		conditioningExercises,
		skillExercises,
		assignedLessonPlans,
		assignLessonPlanToClass,
	} = useCoachApp();

	const [title, setTitle] = useState("");
	const [classId, setClassId] = useState("");
	const [classDate, setClassDate] = useState("");
	const [notes, setNotes] = useState("");
	const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
	const [selectedConditioningIds, setSelectedConditioningIds] = useState<string[]>([]);
	const [conditioningRepsById, setConditioningRepsById] = useState<Record<string, number>>({});
	const [selectedClassSkillIds, setSelectedClassSkillIds] = useState<string[]>([]);
	const [perStudentSkillIds, setPerStudentSkillIds] = useState<Record<string, string[]>>({});
	const [statusMessage, setStatusMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const selectedClass = useMemo(
		() => classes.find((entry: CoachClassData) => entry.id === classId),
		[classId, classes],
	);

	const classStudents = useMemo(
		() => students.filter((student: StudentProfileData) => selectedClass?.studentIds.includes(student.id)),
		[selectedClass?.studentIds, students],
	);

	const activeStudentIds = selectedStudentIds.length
		? selectedStudentIds
		: classStudents.map((student: StudentProfileData) => student.id);

	return (
		<div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
			<Navbar />

			<main className="mx-auto mt-6 w-full max-w-7xl space-y-6">
				<section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8">
					<p className="text-sm uppercase tracking-[0.35em] text-teal-700">Lesson planner</p>
					<h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">Build and assign lesson plans</h2>
					<p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
						Create a lesson plan, assign it to a class with a date, and keep it visible from each enrolled student profile.
					</p>
				</section>

				{errorMessage ? (
					<p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{errorMessage}</p>
				) : null}

				{statusMessage ? (
					<p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{statusMessage}</p>
				) : null}

				<section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
					<form
						className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-8"
						onSubmit={(event) => {
							event.preventDefault();
							setErrorMessage("");
							setStatusMessage("");

							try {
								assignLessonPlanToClass({
									title,
									classId,
									classDate,
									notes,
									studentIds: selectedStudentIds,
									conditioningIds: selectedConditioningIds,
									conditioningReps: conditioningRepsById,
									skillIds: selectedClassSkillIds,
									perStudentSkillIds,
								});
								setTitle("");
								setClassId("");
								setClassDate("");
								setNotes("");
								setSelectedStudentIds([]);
								setSelectedConditioningIds([]);
								setConditioningRepsById({});
								setSelectedClassSkillIds([]);
								setPerStudentSkillIds({});
								setStatusMessage("Lesson plan assigned to class.");
							} catch (error) {
								setErrorMessage(error instanceof Error ? error.message : "Unable to create lesson plan.");
							}
						}}
					>
						<div className="space-y-5">
							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Lesson title (optional)</span>
								<input
									type="text"
									value={title}
									onChange={(event) => setTitle(event.target.value)}
									className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
									placeholder="Leave blank to use class name and date"
								/>
							</label>

							<div className="grid gap-4 sm:grid-cols-2">
								<label className="block space-y-2">
									<span className="text-sm font-medium text-slate-700">Assign to class</span>
									<select
										value={classId}
										onChange={(event) => {
											setClassId(event.target.value);
											setSelectedStudentIds([]);
											setPerStudentSkillIds({});
										}}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
										required
									>
										<option value="">Select class</option>
										{classes.map((classItem: CoachClassData) => (
											<option key={classItem.id} value={classItem.id}>
												{classItem.name}
											</option>
										))}
									</select>
								</label>

								<label className="block space-y-2">
									<span className="text-sm font-medium text-slate-700">Class date</span>
									<input
										type="date"
										value={classDate}
										onChange={(event) => setClassDate(event.target.value)}
										className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-teal-600 focus:bg-white"
										required
									/>
								</label>
							</div>

							<label className="block space-y-2">
								<span className="text-sm font-medium text-slate-700">Lesson notes</span>
								<textarea
									value={notes}
									onChange={(event) => setNotes(event.target.value)}
									className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white"
									placeholder="Warm-up flow, key cues, and sequencing notes."
								/>
							</label>

							<div className="space-y-2">
								<p className="text-sm font-medium text-slate-700">Students in this lesson</p>
								<p className="text-xs text-slate-500">Select students for a targeted lesson. Leave none selected to assign to the whole class.</p>
								<div className="grid gap-2">
									{classId ? (
										classStudents.length ? (
													classStudents.map((student: StudentProfileData) => (
												<label
													key={student.id}
													className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
												>
													<span>{student.name}</span>
													<input
														type="checkbox"
														checked={selectedStudentIds.includes(student.id)}
														onChange={(event) => {
															setSelectedStudentIds((current) =>
																event.target.checked
																	? [...current, student.id]
																	: current.filter((id) => id !== student.id),
															);
														}}
														className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
													/>
												</label>
											))
										) : (
											<p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
												This class has no students yet.
											</p>
										)
									) : (
										<p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
											Select a class to manage student targeting.
										</p>
									)}
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-sm font-medium text-slate-700">Conditioning blocks</p>
								<p className="text-xs text-slate-500">Each selected block can include a rep target for class tracking.</p>
								<div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
										{conditioningExercises.map((item: LibraryItem) => (
										<label
											key={item.id}
											className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
										>
											<span className="flex-1">{item.title}</span>
											<div className="flex items-center gap-2">
												{selectedConditioningIds.includes(item.id) ? (
													<input
														type="number"
														min={1}
														step={1}
														value={conditioningRepsById[item.id] ?? 8}
														onChange={(event) => {
															const nextValue = Number(event.target.value);

															setConditioningRepsById((current) => ({
																...current,
																[item.id]: Number.isFinite(nextValue) && nextValue > 0 ? Math.round(nextValue) : 1,
															}));
														}}
														className="w-20 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none transition focus:border-teal-600"
														aria-label={`${item.title} reps`}
													/>
												) : (
													<span className="w-20 text-right text-xs text-slate-400">set reps</span>
												)}
											<input
												type="checkbox"
												checked={selectedConditioningIds.includes(item.id)}
												onChange={(event) => {
													setSelectedConditioningIds((current) => {
														if (event.target.checked) {
															return [...current, item.id];
														}

														return current.filter((id) => id !== item.id);
													});

													setConditioningRepsById((current) => {
														if (event.target.checked) {
															return { ...current, [item.id]: current[item.id] ?? 8 };
														}

														const next = { ...current };
														delete next[item.id];
														return next;
													});
												}}
												className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
											/>
											</div>
										</label>
									))}
								</div>
							</div>

							<div className="space-y-2">
								<p className="text-sm font-medium text-slate-700">Skill blocks for whole class</p>
								<div className="grid max-h-128 gap-2 overflow-y-auto pr-1">
										{skillExercises.map((item: LibraryItem) => (
										<label
											key={item.id}
											className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
										>
											<span>{item.title}</span>
											<input
												type="checkbox"
												checked={selectedClassSkillIds.includes(item.id)}
												onChange={(event) => {
													setSelectedClassSkillIds((current) =>
														event.target.checked
															? [...current, item.id]
															: current.filter((id) => id !== item.id),
													);
												}}
												className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
											/>
										</label>
									))}
								</div>
							</div>

							<div className="space-y-3">
								<p className="text-sm font-medium text-slate-700">Skill blocks per student</p>
								<p className="text-xs text-slate-500">Assign extra or personalized skills to specific students.</p>
								{activeStudentIds.length ? (
									activeStudentIds.map((studentId: string) => {
										const student = students.find((entry: StudentProfileData) => entry.id === studentId);

										if (!student) {
											return null;
										}

										const selectedIds = perStudentSkillIds[student.id] ?? [];

										return (
											<div key={student.id} className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
												<p className="text-sm font-semibold text-slate-800">{student.name}</p>
												<div className="grid max-h-88 gap-2 overflow-y-auto pr-1">
															{skillExercises.map((item: LibraryItem) => (
														<label
															key={`${student.id}-${item.id}`}
															className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
														>
															<span>{item.title}</span>
															<input
																type="checkbox"
																checked={selectedIds.includes(item.id)}
																onChange={(event) => {
																	setPerStudentSkillIds((current) => {
																		const existingIds = current[student.id] ?? [];
																		const nextIds = event.target.checked
																			? [...existingIds, item.id]
																			: existingIds.filter((id) => id !== item.id);

																		if (!nextIds.length) {
																			const next = { ...current };
																			delete next[student.id];
																			return next;
																		}

																		return { ...current, [student.id]: nextIds };
																	});
																}}
																className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-700"
															/>
														</label>
													))}
												</div>
											</div>
										);
									})
								) : (
									<p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
										Select a class with students to assign individual skill blocks.
									</p>
								)}
							</div>

							<button
								type="submit"
								className="w-full cursor-pointer rounded-2xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800"
								disabled={!classes.length}
							>
								Save and assign lesson plan
							</button>

							{!classes.length ? (
								<p className="text-sm text-slate-500">Create a class first before assigning a lesson plan.</p>
							) : null}
						</div>
					</form>

					<section className="space-y-4">
								{assignedLessonPlans.length ? (
									assignedLessonPlans.map((plan: AssignedLessonPlan) => {
										const classItem = classes.find((entry: CoachClassData) => entry.id === plan.classId);

								return (
									<article
										key={plan.id}
										className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
									>
										<div className="flex flex-wrap items-start justify-between gap-4">
											<div>
												<p className="text-xs uppercase tracking-[0.35em] text-teal-700">Past lessons</p>
												<h3 className="mt-2 text-xl font-semibold text-slate-950">
													<Link href={`/Landing/LessonPlanner/${plan.id}`} className="cursor-pointer transition hover:text-teal-700">
														{plan.title}
													</Link>
												</h3>
												<p className="mt-1 text-sm text-slate-500">
													{classItem?.name ?? "Unknown class"} · {new Date(`${plan.classDate}T00:00:00`).toLocaleDateString()}
												</p>
											</div>
											<div className="flex flex-wrap gap-2">
												<Link
													href={`/Landing/LessonPlanner/${plan.id}`}
													className="inline-flex cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
												>
													View details
												</Link>
												<Link
													href={`/Landing/LessonPlanner/${plan.id}?edit=1`}
													className="inline-flex cursor-pointer rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 transition hover:border-teal-300 hover:bg-teal-100"
												>
													Edit lesson
												</Link>
											</div>
										</div>

										{plan.notes ? <p className="mt-4 text-sm leading-6 text-slate-600">{plan.notes}</p> : null}
										{plan.outcomeNotes ? (
											<p className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
												Outcome notes: {plan.outcomeNotes}
											</p>
										) : null}

										<div className="mt-4 text-sm text-slate-600">
											<p>
												Students in lesson: {plan.studentIds.length ? plan.studentIds.length : classItem?.studentIds.length ?? 0}
											</p>
											<p>Conditioning items: {plan.conditioningIds.length}</p>
											<p>Class skill items: {plan.skillIds.length}</p>
											<p>Per-student skill assignments: {Object.keys(plan.perStudentSkillIds ?? {}).length}</p>
										</div>
									</article>
								);
							})
						) : (
							<div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
								No assigned lesson plans yet. Build one on the left and attach it to a class date.
							</div>
						)}
					</section>
				</section>
			</main>
		</div>
	);
}
