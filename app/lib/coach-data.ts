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
  classIds: string[];
  goals: string[];
  progress: number;
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
