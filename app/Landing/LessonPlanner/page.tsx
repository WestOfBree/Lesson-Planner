"use client";

import { useMemo, useState } from "react";
import Navbar from "../../UI/Navbar";
import LessonPlanAssignedList from "../../UI/LessonPlanAssignedList";
import LessonPlanCreateForm from "../../UI/LessonPlanCreateForm";
import LessonPlanLivePreview from "../../UI/LessonPlanLivePreview";
import { useCoachApp } from "@/app/lib/coach-store";
import { useActionResponse } from "@/app/lib/action-response";
import type { CoachClassData, ConditioningPrescription, StudentProfileData } from "@/app/lib/coach-data";

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
	const [conditioningRepsById, setConditioningRepsById] = useState<Record<string, ConditioningPrescription>>({});
	const [selectedClassSkillIds, setSelectedClassSkillIds] = useState<string[]>([]);
	const [perStudentSkillIds, setPerStudentSkillIds] = useState<Record<string, string[]>>({});
	const { showActionResponse } = useActionResponse();

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
				<section className="rounded-[1.75rem] border border-white/60 bg-white/80 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
					<p className="text-sm uppercase tracking-[0.35em] text-teal-200 dark:text-teal-300">Lesson planner</p>
					<h2 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Build and assign lesson plans</h2>
					<p className="mt-3 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
						Create a lesson plan, assign it to a class with a date, and keep it visible from each enrolled student profile.
					</p>
				</section>

				<section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
					<LessonPlanCreateForm
						classes={classes}
						students={students}
						classStudents={classStudents}
						activeStudentIds={activeStudentIds}
						conditioningExercises={conditioningExercises}
						skillExercises={skillExercises}
						title={title}
						classId={classId}
						classDate={classDate}
						notes={notes}
						selectedStudentIds={selectedStudentIds}
						selectedConditioningIds={selectedConditioningIds}
						conditioningRepsById={conditioningRepsById}
						selectedClassSkillIds={selectedClassSkillIds}
						perStudentSkillIds={perStudentSkillIds}
						setTitle={setTitle}
						setClassId={setClassId}
						setClassDate={setClassDate}
						setNotes={setNotes}
						setSelectedStudentIds={setSelectedStudentIds}
						setSelectedConditioningIds={setSelectedConditioningIds}
						setConditioningRepsById={setConditioningRepsById}
						setSelectedClassSkillIds={setSelectedClassSkillIds}
						setPerStudentSkillIds={setPerStudentSkillIds}
						onSubmit={(event) => {
							event.preventDefault();

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
								showActionResponse({ tone: "success", message: "Lesson plan assigned to class." });
							} catch (error) {
								showActionResponse({
									tone: "error",
									message: error instanceof Error ? error.message : "Unable to create lesson plan.",
								});
							}
						}}
					/>

					<LessonPlanLivePreview
						classes={classes}
						students={students}
						conditioningExercises={conditioningExercises}
						skillExercises={skillExercises}
						title={title}
						classId={classId}
						classDate={classDate}
						notes={notes}
						selectedStudentIds={selectedStudentIds}
						selectedConditioningIds={selectedConditioningIds}
						conditioningRepsById={conditioningRepsById}
						selectedClassSkillIds={selectedClassSkillIds}
						perStudentSkillIds={perStudentSkillIds}
						activeStudentIds={activeStudentIds}
					/>
				</section>

				<section className="space-y-4">
					<div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900/80 sm:p-6">
						<p className="text-xs uppercase tracking-[0.35em] text-teal-200 dark:text-teal-300">Past lessons</p>
						<h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">Lesson history and edits</h3>
						<p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review saved lesson plans, open details, and keep continuity between sessions.</p>
					</div>
					<LessonPlanAssignedList assignedLessonPlans={assignedLessonPlans} classes={classes} />
				</section>
			</main>
		</div>
	);
}
