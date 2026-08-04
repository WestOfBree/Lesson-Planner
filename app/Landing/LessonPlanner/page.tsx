"use client";

import { useMemo, useState } from "react";
import Navbar from "../../UI/Navbar";
import LessonPlanAssignedList from "../../UI/LessonPlanAssignedList";
import LessonPlanCreateForm from "../../UI/LessonPlanCreateForm";
import { useCoachApp } from "@/app/lib/coach-store";
import type { CoachClassData, StudentProfileData } from "@/app/lib/coach-data";

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
					/>

					<LessonPlanAssignedList assignedLessonPlans={assignedLessonPlans} classes={classes} />
				</section>
			</main>
		</div>
	);
}
