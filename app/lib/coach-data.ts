export interface CoachSession {
  id: string;
  email: string;
  displayName: string;
  isGuest: boolean;
}

export interface StudentProfileData {
  id: string;
  name: string;
  level: string;
  focus: string;
  notes: string;
  notesHistory: { id: string; note: string; createdAt: string }[];
  classIds: string[];
  goals: string[];
  skillsKnown: string[];
  struggles: string[];
  progress: number;
  progressHistory: { id: string; progress: number; createdAt: string }[];
  lastUpdated: string;
}

export interface CoachClassData {
  id: string;
  name: string;
  level: string;
  schedule: string;
  location: string;
  focus: string;
  notes: string;
  studentIds: string[];
}

export interface AssignedLessonPlan {
  id: string;
  title: string;
  classId: string;
  classDate: string;
  notes: string;
  studentIds: string[];
  conditioningIds: string[];
  conditioningReps: Record<string, number>;
  skillIds: string[];
  perStudentSkillIds: Record<string, string[]>;
  outcomeNotes: string;
  createdAt: string;
}

export interface LibraryItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  duration: string;
  equipment: string[];
  coachingCues: string[];
  progressions: string[];
  regressions: string[];
  lessonUse: string;
  isCustom: boolean;
}

export interface LessonPlanState {
  conditioningIds: string[];
  skillIds: string[];
}

export interface NewStudentInput {
  name: string;
  level: string;
  focus: string;
  notes: string;
  classIds: string[];
  goals: string[];
  skillsKnown: string[];
  struggles: string[];
  progress: number;
}

export interface NewClassInput {
  name: string;
  level: string;
  schedule: string;
  location: string;
  focus: string;
  notes: string;
  studentIds: string[];
}

export interface NewLibraryItemInput {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  equipment: string[];
  coachingCues: string[];
  progressions: string[];
  regressions: string[];
  lessonUse: string;
}

export interface NewLessonPlanInput {
  title: string;
  classId: string;
  classDate: string;
  notes: string;
  studentIds: string[];
  conditioningIds: string[];
  conditioningReps: Record<string, number>;
  skillIds: string[];
  perStudentSkillIds: Record<string, string[]>;
}

export interface UpdateLessonPlanInput extends NewLessonPlanInput {
  outcomeNotes: string;
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const titleCase = (value: string) =>
  value
    .replace(/[._-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const coachNameFromEmail = (email: string) => {
  const namePart = email.split("@")[0] || "coach";
  return titleCase(namePart);
};

const createItem = (item: Omit<LibraryItem, "id" | "slug" | "isCustom">): LibraryItem => ({
  ...item,
  id: `item-${slugify(item.title)}`,
  slug: slugify(item.title),
  isCustom: false,
});

export const defaultConditioningExercises: LibraryItem[] = [
  createItem({
    title: "Push-Ups",
    category: "Conditioning",
    description: "Foundation upper-body strength work for presses, handstands, and solid line control.",
    difficulty: "Beginner",
    duration: "3 rounds of 10-15 reps",
    equipment: ["Floor"],
    coachingCues: ["Stack ribs over hips", "Keep elbows tracking at 45 degrees", "Own the descent"],
    progressions: ["Tempo push-ups", "Deficit push-ups"],
    regressions: ["Wall push-ups", "Knee push-ups"],
    lessonUse: "Use as an activation block before climb or inversion work.",
  }),
  createItem({
    title: "Sit-Ups",
    category: "Conditioning",
    description: "Simple trunk endurance work for hollow shapes, climbs, and repeated inversions.",
    difficulty: "Beginner",
    duration: "3 rounds of 12-20 reps",
    equipment: ["Mat"],
    coachingCues: ["Move through the ribs", "Exhale on the way up", "Control the lower back"],
    progressions: ["V-ups", "Weighted sit-ups"],
    regressions: ["Crunches", "Dead bug holds"],
    lessonUse: "Pairs well with hollow body drills and spinal awareness.",
  }),
  createItem({
    title: "Hollow Body Hold",
    category: "Conditioning",
    description: "Builds midline tension for inverts, beats, and clean aerial shapes.",
    difficulty: "Intermediate",
    duration: "4 x 20-40 second holds",
    equipment: ["Mat"],
    coachingCues: ["Press lower back into the mat", "Reach long through fingertips", "Breathe behind the brace"],
    progressions: ["Hollow rocks", "Weighted hollow hold"],
    regressions: ["Tuck hollow hold", "One-leg extended hold"],
    lessonUse: "Great bridge into beat drills and invert preparation.",
  }),
  createItem({
    title: "Scapular Pulls",
    category: "Conditioning",
    description: "Trains shoulder engagement and active hang control for silks and rope work.",
    difficulty: "Beginner",
    duration: "3 rounds of 8-12 reps",
    equipment: ["Pull-up bar or silks"],
    coachingCues: ["Keep elbows long", "Move from the shoulder blades", "Avoid shrugging"],
    progressions: ["Paused scap pulls", "Single-arm assisted pulls"],
    regressions: ["Standing band pulls", "Supported hang shrugs"],
    lessonUse: "Use early in class to wake up the upper back.",
  }),
  createItem({
    title: "Plank Hold",
    category: "Conditioning",
    description: "Core endurance drill that improves bodyline control and shoulder stability.",
    difficulty: "Beginner",
    duration: "3 x 30-60 second holds",
    equipment: ["Mat"],
    coachingCues: ["Stack shoulders over elbows", "Keep ribs tucked", "Squeeze glutes"],
    progressions: ["Plank shoulder taps", "Long lever plank"],
    regressions: ["Knee plank", "Incline plank"],
    lessonUse: "Use in warm-up before inversions and climbs.",
  }),
  createItem({
    title: "Side Plank",
    category: "Conditioning",
    description: "Builds oblique strength and lateral stability for wraps and single-arm support.",
    difficulty: "Beginner",
    duration: "3 x 20-40 seconds per side",
    equipment: ["Mat"],
    coachingCues: ["Press the floor away", "Stack hips", "Keep neck long"],
    progressions: ["Side plank leg lift", "Star side plank"],
    regressions: ["Knee side plank", "Supported side hold"],
    lessonUse: "Supports cleaner side-body lines in aerial skills.",
  }),
  createItem({
    title: "Glute Bridge",
    category: "Conditioning",
    description: "Posterior chain activation for better hip extension and low-back support.",
    difficulty: "Beginner",
    duration: "3 rounds of 12-20 reps",
    equipment: ["Mat"],
    coachingCues: ["Drive through heels", "Keep ribs down", "Pause at the top"],
    progressions: ["Single-leg bridge", "Banded bridge"],
    regressions: ["Short-range bridge", "Isometric bridge hold"],
    lessonUse: "Ideal prep before beats, climbs, and dynamic transitions.",
  }),
  createItem({
    title: "Dead Bug",
    category: "Conditioning",
    description: "Improves cross-body coordination and anti-extension core control.",
    difficulty: "Beginner",
    duration: "3 rounds of 8-12 reps per side",
    equipment: ["Mat"],
    coachingCues: ["Press back into mat", "Move slowly", "Exhale as limb extends"],
    progressions: ["Banded dead bug", "Weighted dead bug"],
    regressions: ["Heel taps", "Arm-only dead bug"],
    lessonUse: "Excellent primer for invert mechanics and control.",
  }),
  createItem({
    title: "Superman Hold",
    category: "Conditioning",
    description: "Strengthens posterior chain and spinal extension endurance.",
    difficulty: "Beginner",
    duration: "3 x 20-40 second holds",
    equipment: ["Mat"],
    coachingCues: ["Reach long", "Lift from upper back", "Keep glutes active"],
    progressions: ["Superman rocks", "Alternating superman lifts"],
    regressions: ["Chest lift only", "Leg lift only"],
    lessonUse: "Balances hollow work and supports back-body awareness.",
  }),
  createItem({
    title: "Mountain Climbers",
    category: "Conditioning",
    description: "Cardio-core drill for shoulder endurance and midline stability.",
    difficulty: "Beginner",
    duration: "3 rounds of 20-40 seconds",
    equipment: ["Mat"],
    coachingCues: ["Keep hips level", "Drive knees with control", "Press through hands"],
    progressions: ["Cross-body climbers", "Tempo climbers"],
    regressions: ["Slow step-ins", "Elevated mountain climbers"],
    lessonUse: "Useful in warm-up circuits to raise heart rate quickly.",
  }),
  createItem({
    title: "Bodyweight Squats",
    category: "Conditioning",
    description: "Foundational lower-body strength and control for grounded power.",
    difficulty: "Beginner",
    duration: "3 rounds of 12-20 reps",
    equipment: ["Floor"],
    coachingCues: ["Track knees over toes", "Keep chest open", "Stand with control"],
    progressions: ["Tempo squats", "Jump squats"],
    regressions: ["Box squats", "Assisted squats"],
    lessonUse: "Builds leg endurance for repeated climbs and landings.",
  }),
  createItem({
    title: "Reverse Lunges",
    category: "Conditioning",
    description: "Single-leg stability and strength for balance and directional control.",
    difficulty: "Beginner",
    duration: "3 rounds of 8-12 reps per side",
    equipment: ["Floor"],
    coachingCues: ["Step back softly", "Front knee stable", "Push through front foot"],
    progressions: ["Weighted lunges", "Deficit lunges"],
    regressions: ["Split squat holds", "Supported lunges"],
    lessonUse: "Improves balance and unilateral leg control for entries.",
  }),
  createItem({
    title: "Pike Compression Lifts",
    category: "Conditioning",
    description: "Develops hip-flexor and core compression strength for inverts.",
    difficulty: "Beginner",
    duration: "3 rounds of 8-12 reps",
    equipment: ["Floor", "Yoga blocks"],
    coachingCues: ["Stay tall", "Lift from lower abs", "Keep legs long"],
    progressions: ["Straddle lifts", "Longer hold at top"],
    regressions: ["Bent-knee lifts", "Single-leg pike lifts"],
    lessonUse: "Direct carryover to controlled tuck and straddle inversions.",
  }),
  createItem({
    title: "Bent-Arm Hang",
    category: "Conditioning",
    description: "Grip and pulling endurance baseline for early aerial students.",
    difficulty: "Beginner",
    duration: "4 x 10-30 second holds",
    equipment: ["Pull-up bar or silks"],
    coachingCues: ["Keep shoulders active", "Chin neutral", "Breathe steadily"],
    progressions: ["One-arm assisted hangs", "Longer hold duration"],
    regressions: ["Foot-supported hold", "Active dead hang"],
    lessonUse: "Great benchmark for pulling endurance development.",
  }),
  createItem({
    title: "Scapular Push-Ups",
    category: "Conditioning",
    description: "Improves shoulder blade control and serratus engagement.",
    difficulty: "Beginner",
    duration: "3 rounds of 10-15 reps",
    equipment: ["Floor"],
    coachingCues: ["Keep elbows straight", "Protract and retract smoothly", "Control tempo"],
    progressions: ["Plank scap push-ups", "Deficit scap push-ups"],
    regressions: ["Wall scap push-ups", "Knee scap push-ups"],
    lessonUse: "Preps shoulders for healthy loading in climbs and hangs.",
  }),
];

export const defaultSkillExercises: LibraryItem[] = [
  createItem({
    title: "Basic Invert",
    category: "Aerial Skill",
    description: "The core aerial skill that teaches momentum, compression, and a clean inversion pathway.",
    difficulty: "Intermediate",
    duration: "5-8 focused attempts",
    equipment: ["Silks"],
    coachingCues: ["Initiate from the core", "Stay tight through the feet", "Finish stacked and stable"],
    progressions: ["Tuck invert with spot", "Slow negative invert"],
    regressions: ["Chickens wing prep", "Seated compression drills"],
    lessonUse: "A reliable skill focus for developing body awareness and line control.",
  }),
  createItem({
    title: "Foot Lock Sequence",
    category: "Aerial Skill",
    description: "A foundational silks transition that builds confidence with wraps, balance, and standing support.",
    difficulty: "Beginner",
    duration: "3-5 cycles each side",
    equipment: ["Silks"],
    coachingCues: ["Keep wraps tidy", "Check the tail before loading", "Stand with intention"],
    progressions: ["Foot lock into pose", "Foot lock climb combo"],
    regressions: ["Low wrap rehearsal", "Floor patterning"],
    lessonUse: "Use as a transition drill when building sequencing confidence.",
  }),
  createItem({
    title: "Straddle Beat",
    category: "Aerial Skill",
    description: "Dynamic beat patterning that feeds swings, tempo, and explosive aerial shapes.",
    difficulty: "Intermediate",
    duration: "4 sets of 6-10 beats",
    equipment: ["Silks"],
    coachingCues: ["Keep the chest open", "Drive the rhythm from the hips", "Land each beat cleanly"],
    progressions: ["Beat holds", "Alternate beat timing"],
    regressions: ["Tuck beats", "Floor rhythm drills"],
    lessonUse: "Useful in warm-ups and as a prelude to dynamic skill work.",
  }),
  createItem({
    title: "Catchers Climb",
    category: "Aerial Skill",
    description: "A shape-and-strength climb that helps students connect pulling power with tidy body positions.",
    difficulty: "Advanced Beginner",
    duration: "3-6 controlled reps",
    equipment: ["Silks"],
    coachingCues: ["Pull before you step", "Keep the rope path close", "Stay organized through the torso"],
    progressions: ["Slow tempo climb", "Climb with pauses"],
    regressions: ["Foot assisted climb", "Standing rope pulls"],
    lessonUse: "Builds endurance for longer sequences and stronger climbs.",
  }),
];
