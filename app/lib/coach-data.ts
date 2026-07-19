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

export interface SkillLibraryItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  difficulty: string;
  coachingCues: string[];
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

export interface NewSkillLibraryItemInput {
  title: string;
  description: string;
  difficulty: string;
  coachingCues: string[];
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

const createSkillItem = (item: Omit<SkillLibraryItem, "id" | "slug" | "isCustom">): SkillLibraryItem => ({
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
    title: "Squats",
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
];

export const defaultSkillExercises: SkillLibraryItem[] = [
  createSkillItem({
    title: "Basic Invert",
    category: "Aerial Skill",
    description: "The core aerial skill that teaches momentum, compression, and a clean inversion pathway.",
    difficulty: "Intermediate",
    coachingCues: ["Initiate from the core", "Stay tight through the feet", "Finish stacked and stable"],
    lessonUse: "A reliable skill focus for developing body awareness and line control.",
  }),
  createSkillItem({
    title: "Footlocks",
    category: "Aerial Skill",
    description: "Standard footlocks from the ground.",
    difficulty: "Beginner",
    coachingCues: ["Keep wraps tidy", "Wrap out and around", "Over then under"],
    lessonUse: "Use as a transition skill when building sequencing confidence.",
  }),
  createSkillItem({
    title: "Butterfly",
    category: "Aerial Skill",
    description: "A classic, beautiful pose where the aerialist is suspended upside down in a straddle with the silks creating a large 'X' across their lower back.",
    difficulty: "Begintermediate",
    coachingCues: ["Keep legs rotated outwards", "Engage the core for stability", "Maintain a strong line through the spine"],
    lessonUse: "Useful in warm-ups and as a prelude to dynamic skill work.",
  }),
  createSkillItem({
    title: "Backfall",
    category: "Aerial Skill",
    description: "A dynamic move where the aerialist sits on a single cross of the fabric and falls backward, allowing the momentum to invert the body before catching oneself.",
    difficulty: "Beginner",
    coachingCues: ["Engage the core", "Control the descent", "Don't forget the arms"],
    lessonUse: "Builds endurance for longer sequences and stronger climbs.",
  }),
];
