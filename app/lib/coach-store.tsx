"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  type AssignedLessonPlan,
  coachNameFromEmail,
  defaultConditioningExercises,
  defaultSkillExercises,
  slugify,
  type CoachClassData,
  type CoachSession,
  type LessonPlanState,
  type LibraryItem,
  type NewClassInput,
  type NewLessonPlanInput,
  type NewLibraryItemInput,
  type NewStudentInput,
  type StudentProfileData,
} from "./coach-data";

type SignInInput = {
  email: string;
  password: string;
  mode: "login" | "register" | "guest";
};

type CoachState = {
  currentCoach: CoachSession | null;
  students: StudentProfileData[];
  classes: CoachClassData[];
  conditioningExercises: LibraryItem[];
  skillExercises: LibraryItem[];
  assignedLessonPlans: AssignedLessonPlan[];
  lessonPlan: LessonPlanState;
  accounts: Record<string, { displayName: string; password: string }>;
};

type CoachStore = CoachState & {
  signInCoach: (input: SignInInput) => Promise<CoachSession>;
  signOutCoach: () => void;
  updateCoachProfile: (input: { displayName: string; email: string }) => CoachSession;
  changeCoachPassword: (input: { currentPassword: string; newPassword: string }) => void;
  addStudent: (input: NewStudentInput) => StudentProfileData;
  updateStudent: (
    studentId: string,
    input: {
      name: string;
      level: string;
      focus: string;
      classIds: string[];
      goals: string[];
      skillsKnown: string[];
      struggles: string[];
    },
  ) => void;
  updateStudentProgress: (studentId: string, progress: number) => void;
  updateStudentProfile: (
    studentId: string,
    input: { focus: string; goals: string[]; skillsKnown: string[]; struggles: string[] },
  ) => void;
  addStudentNote: (studentId: string, note: string) => void;
  addClass: (input: NewClassInput) => CoachClassData;
  addConditioningExercise: (input: NewLibraryItemInput) => LibraryItem;
  updateConditioningExercise: (exerciseId: string, input: NewLibraryItemInput) => void;
  addSkillExercise: (input: NewLibraryItemInput) => LibraryItem;
  updateSkillExercise: (exerciseId: string, input: NewLibraryItemInput) => void;
  assignLessonPlanToClass: (input: NewLessonPlanInput) => AssignedLessonPlan;
  toggleLessonPlanItem: (kind: "conditioning" | "skill", itemId: string) => void;
  clearLessonPlan: () => void;
};

const STORAGE_KEY = "aerial-coach-state";
const listeners = new Set<() => void>();
let cachedState: CoachState | undefined;

const initialState: CoachState = {
  currentCoach: null,
  students: [],
  classes: [],
  conditioningExercises: defaultConditioningExercises,
  skillExercises: defaultSkillExercises,
  assignedLessonPlans: [],
  lessonPlan: {
    conditioningIds: [],
    skillIds: [],
  },
  accounts: {},
};

const CoachContext = createContext<CoachStore | null>(null);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const createId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;

const normalizeLessonPlan = (plan: AssignedLessonPlan): AssignedLessonPlan => ({
  ...plan,
  studentIds: plan.studentIds ?? [],
  conditioningIds: plan.conditioningIds ?? [],
  skillIds: plan.skillIds ?? [],
  perStudentSkillIds: plan.perStudentSkillIds ?? {},
});

const mergeLibraryItems = (defaults: LibraryItem[], stored: LibraryItem[] | undefined): LibraryItem[] => {
  const merged = new Map(defaults.map((item) => [item.id, item]));

  (stored ?? []).forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values());
};

const normalizeStudent = (student: StudentProfileData): StudentProfileData => {
  const notesHistory =
    student.notesHistory?.length
      ? student.notesHistory
      : student.notes
        ? [
            {
              id: createId("note"),
              note: student.notes,
              createdAt: student.lastUpdated || new Date().toISOString(),
            },
          ]
        : [];

  const progressHistory =
    student.progressHistory?.length
      ? student.progressHistory
      : [
          {
            id: createId("progress"),
            progress: student.progress,
            createdAt: student.lastUpdated || new Date().toISOString(),
          },
        ];

  return {
    ...student,
    goals: student.goals ?? [],
    skillsKnown: student.skillsKnown ?? [],
    struggles: student.struggles ?? [],
    notesHistory,
    progressHistory,
  };
};

const mergeState = (value: Partial<CoachState> | null | undefined): CoachState => ({
  ...initialState,
  ...value,
  conditioningExercises: mergeLibraryItems(initialState.conditioningExercises, value?.conditioningExercises),
  skillExercises: mergeLibraryItems(initialState.skillExercises, value?.skillExercises),
  students: value?.students?.map((student) => normalizeStudent(student)) ?? initialState.students,
  classes: value?.classes ?? initialState.classes,
  assignedLessonPlans: value?.assignedLessonPlans?.map((plan) => normalizeLessonPlan(plan)) ?? initialState.assignedLessonPlans,
  lessonPlan: value?.lessonPlan ?? initialState.lessonPlan,
  currentCoach: value?.currentCoach ?? initialState.currentCoach,
  accounts: value?.accounts ?? initialState.accounts,
});

const readStorageState = (): CoachState => {
  if (typeof window === "undefined") {
    return initialState;
  }

  const storedValue = window.localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return initialState;
  }

  try {
    return mergeState(JSON.parse(storedValue) as Partial<CoachState>);
  } catch {
    return initialState;
  }
};

const getSnapshot = () => {
  if (!cachedState) {
    cachedState = readStorageState();
  }

  return cachedState;
};

const notify = () => {
  listeners.forEach((listener) => listener());
};

const persistState = (updater: (current: CoachState) => CoachState) => {
  if (typeof window === "undefined") {
    return;
  }

  const nextState = updater(cachedState ?? readStorageState());
  cachedState = nextState;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const normalizeItem = (input: NewLibraryItemInput, category: string): LibraryItem => ({
  id: createId("item"),
  slug: slugify(input.title),
  title: input.title,
  category,
  description: input.description,
  difficulty: input.difficulty,
  duration: input.duration,
  equipment: unique(input.equipment),
  coachingCues: unique(input.coachingCues),
  progressions: unique(input.progressions),
  regressions: unique(input.regressions),
  lessonUse: input.lessonUse,
  isCustom: true,
});

export const CoachProvider = ({ children }: { children: ReactNode }) => {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => initialState);

  const signInCoach = async ({ email, password, mode }: SignInInput) => {
    if (mode !== "guest" && (!email.trim() || !password.trim())) {
      throw new Error("Enter both an email and password.");
    }

    if (mode === "guest") {
      const session: CoachSession = {
        id: createId("guest"),
        email: "guest@aerialcoach.local",
        displayName: "Guest Coach",
        isGuest: true,
      };

      persistState((current) => ({ ...current, currentCoach: session }));
      return session;
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const currentState = getSnapshot();
    const existingAccount = currentState.accounts[sanitizedEmail];

    if (mode === "register" && existingAccount) {
      throw new Error("An account with this email already exists.");
    }

    if (mode === "login" && existingAccount && existingAccount.password !== trimmedPassword) {
      throw new Error("Incorrect password.");
    }

    const nextAccount =
      existingAccount ?? {
        displayName: coachNameFromEmail(sanitizedEmail),
        password: trimmedPassword,
      };

    const session: CoachSession = {
      id: sanitizedEmail,
      email: sanitizedEmail,
      displayName: nextAccount.displayName,
      isGuest: false,
    };

    persistState((current) => ({
      ...current,
      currentCoach: session,
      accounts: {
        ...current.accounts,
        [sanitizedEmail]: {
          displayName: nextAccount.displayName,
          password: nextAccount.password,
        },
      },
    }));

    return session;
  };

  const signOutCoach = () => {
    persistState((current) => ({ ...current, currentCoach: null }));
  };

  const updateCoachProfile = ({ displayName, email }: { displayName: string; email: string }) => {
    const nextDisplayName = displayName.trim();
    const nextEmail = email.trim().toLowerCase();

    if (!nextDisplayName || !nextEmail) {
      throw new Error("Display name and email are required.");
    }

    const currentState = getSnapshot();
    const activeCoach = currentState.currentCoach;

    if (!activeCoach) {
      throw new Error("No active coach session.");
    }

    if (activeCoach.isGuest) {
      throw new Error("Guest sessions cannot edit account details.");
    }

    const currentEmail = activeCoach.email.toLowerCase();
    const account = currentState.accounts[currentEmail];

    if (nextEmail !== currentEmail && currentState.accounts[nextEmail]) {
      throw new Error("That email is already in use.");
    }

    const updatedSession: CoachSession = {
      ...activeCoach,
      email: nextEmail,
      displayName: nextDisplayName,
      id: nextEmail,
    };

    persistState((current) => {
      const nextAccounts = { ...current.accounts };
      delete nextAccounts[currentEmail];
      nextAccounts[nextEmail] = {
        displayName: nextDisplayName,
        password: account?.password ?? "",
      };

      return {
        ...current,
        currentCoach: updatedSession,
        accounts: nextAccounts,
      };
    });

    return updatedSession;
  };

  const changeCoachPassword = ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    const existingPassword = currentPassword.trim();
    const nextPassword = newPassword.trim();

    if (!existingPassword || !nextPassword) {
      throw new Error("Current and new password are required.");
    }

    if (nextPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }

    const currentState = getSnapshot();
    const activeCoach = currentState.currentCoach;

    if (!activeCoach) {
      throw new Error("No active coach session.");
    }

    if (activeCoach.isGuest) {
      throw new Error("Guest sessions cannot change passwords.");
    }

    const accountEmail = activeCoach.email.toLowerCase();
    const account = currentState.accounts[accountEmail];

    if (!account) {
      throw new Error("Account not found.");
    }

    if (account.password !== existingPassword) {
      throw new Error("Current password is incorrect.");
    }

    persistState((current) => ({
      ...current,
      accounts: {
        ...current.accounts,
        [accountEmail]: {
          ...account,
          password: nextPassword,
        },
      },
    }));
  };

  const addStudent = (input: NewStudentInput) => {
    const classIds = unique(input.classIds);
    const createdAt = new Date().toISOString();
    const student: StudentProfileData = {
      id: createId("student"),
      name: input.name.trim(),
      level: input.level.trim(),
      focus: input.focus.trim(),
      notes: input.notes.trim(),
      notesHistory: input.notes.trim()
        ? [
            {
              id: createId("note"),
              note: input.notes.trim(),
              createdAt,
            },
          ]
        : [],
      classIds,
      goals: unique(input.goals),
      skillsKnown: unique(input.skillsKnown),
      struggles: unique(input.struggles),
      progress: input.progress,
      progressHistory: [
        {
          id: createId("progress"),
          progress: input.progress,
          createdAt,
        },
      ],
      lastUpdated: createdAt,
    };

    persistState((current) => ({
      ...current,
      students: [student, ...current.students],
      classes: current.classes.map((classItem) =>
        classIds.includes(classItem.id)
          ? { ...classItem, studentIds: unique([...classItem.studentIds, student.id]) }
          : classItem,
      ),
    }));

    return student;
  };

  const updateStudent = (
    studentId: string,
    input: {
      name: string;
      level: string;
      focus: string;
      classIds: string[];
      goals: string[];
      skillsKnown: string[];
      struggles: string[];
    },
  ) => {
    const updatedAt = new Date().toISOString();
    const nextClassIds = unique(input.classIds);

    persistState((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              name: input.name.trim(),
              level: input.level.trim(),
              focus: input.focus.trim(),
              classIds: nextClassIds,
              goals: unique(input.goals),
              skillsKnown: unique(input.skillsKnown),
              struggles: unique(input.struggles),
              lastUpdated: updatedAt,
            }
          : student,
      ),
      classes: current.classes.map((classItem) => {
        const shouldIncludeStudent = nextClassIds.includes(classItem.id);
        const hasStudent = classItem.studentIds.includes(studentId);

        if (shouldIncludeStudent && !hasStudent) {
          return { ...classItem, studentIds: [...classItem.studentIds, studentId] };
        }

        if (!shouldIncludeStudent && hasStudent) {
          return { ...classItem, studentIds: classItem.studentIds.filter((id) => id !== studentId) };
        }

        return classItem;
      }),
    }));
  };

  const updateStudentProgress = (studentId: string, progress: number) => {
    const updatedAt = new Date().toISOString();

    persistState((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              progress,
              progressHistory: [
                ...student.progressHistory,
                {
                  id: createId("progress"),
                  progress,
                  createdAt: updatedAt,
                },
              ],
              lastUpdated: updatedAt,
            }
          : student,
      ),
    }));
  };

  const updateStudentProfile = (
    studentId: string,
    input: { focus: string; goals: string[]; skillsKnown: string[]; struggles: string[] },
  ) => {
    const updatedAt = new Date().toISOString();

    persistState((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              focus: input.focus.trim(),
              goals: unique(input.goals),
              skillsKnown: unique(input.skillsKnown),
              struggles: unique(input.struggles),
              lastUpdated: updatedAt,
            }
          : student,
      ),
    }));
  };

  const addStudentNote = (studentId: string, note: string) => {
    const trimmedNote = note.trim();

    if (!trimmedNote) {
      throw new Error("Enter a note before saving.");
    }

    const updatedAt = new Date().toISOString();

    persistState((current) => ({
      ...current,
      students: current.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              notes: trimmedNote,
              notesHistory: [
                {
                  id: createId("note"),
                  note: trimmedNote,
                  createdAt: updatedAt,
                },
                ...student.notesHistory,
              ],
              lastUpdated: updatedAt,
            }
          : student,
      ),
    }));
  };

  const addClass = (input: NewClassInput) => {
    const studentIds = unique(input.studentIds);
    const classItem: CoachClassData = {
      id: createId("class"),
      name: input.name.trim(),
      level: input.level.trim(),
      schedule: input.schedule.trim(),
      location: input.location.trim(),
      focus: input.focus.trim(),
      notes: input.notes.trim(),
      studentIds,
    };

    persistState((current) => ({
      ...current,
      classes: [classItem, ...current.classes],
      students: current.students.map((student) =>
        studentIds.includes(student.id)
          ? { ...student, classIds: unique([...student.classIds, classItem.id]) }
          : student,
      ),
    }));

    return classItem;
  };

  const addConditioningExercise = (input: NewLibraryItemInput) => {
    const item = normalizeItem(input, "Conditioning");

    persistState((current) => ({
      ...current,
      conditioningExercises: [item, ...current.conditioningExercises],
    }));

    return item;
  };

  const updateConditioningExercise = (exerciseId: string, input: NewLibraryItemInput) => {
    persistState((current) => ({
      ...current,
      conditioningExercises: current.conditioningExercises.map((item) =>
        item.id === exerciseId
          ? {
              ...item,
              slug: slugify(input.title),
              title: input.title.trim(),
              description: input.description.trim(),
              difficulty: input.difficulty.trim(),
              duration: input.duration.trim(),
              equipment: unique(input.equipment),
              coachingCues: unique(input.coachingCues),
              progressions: unique(input.progressions),
              regressions: unique(input.regressions),
              lessonUse: input.lessonUse.trim(),
            }
          : item,
      ),
    }));
  };

  const addSkillExercise = (input: NewLibraryItemInput) => {
    const item = normalizeItem(input, "Aerial Skill");

    persistState((current) => ({
      ...current,
      skillExercises: [item, ...current.skillExercises],
    }));

    return item;
  };

  const updateSkillExercise = (exerciseId: string, input: NewLibraryItemInput) => {
    persistState((current) => ({
      ...current,
      skillExercises: current.skillExercises.map((item) =>
        item.id === exerciseId
          ? {
              ...item,
              slug: slugify(input.title),
              title: input.title.trim(),
              description: input.description.trim(),
              difficulty: input.difficulty.trim(),
              duration: input.duration.trim(),
              equipment: unique(input.equipment),
              coachingCues: unique(input.coachingCues),
              progressions: unique(input.progressions),
              regressions: unique(input.regressions),
              lessonUse: input.lessonUse.trim(),
            }
          : item,
      ),
    }));
  };

  const assignLessonPlanToClass = (input: NewLessonPlanInput) => {
    const title = input.title.trim();
    const classId = input.classId.trim();
    const classDate = input.classDate.trim();
    const notes = input.notes.trim();
    const studentIds = unique(input.studentIds);
    const conditioningIds = unique(input.conditioningIds);
    const skillIds = unique(input.skillIds);
    const perStudentSkillIds = input.perStudentSkillIds ?? {};

    if (!classId || !classDate) {
      throw new Error("Class and class date are required.");
    }

    const classItem = getSnapshot().classes.find((entry) => entry.id === classId);

    if (!classItem) {
      throw new Error("Selected class could not be found.");
    }

    const resolvedTitle = title || `${classItem.name} - ${classDate}`;
    const validStudentIds = studentIds.filter((studentId) => classItem.studentIds.includes(studentId));
    const lessonScopeStudentIds = validStudentIds.length ? validStudentIds : [];
    const eligibleStudentIds = lessonScopeStudentIds.length ? lessonScopeStudentIds : classItem.studentIds;
    const normalizedPerStudentSkillIds = Object.entries(perStudentSkillIds).reduce<Record<string, string[]>>(
      (current, [studentId, ids]) => {
        if (!eligibleStudentIds.includes(studentId)) {
          return current;
        }

        const normalizedIds = unique(ids ?? []);

        if (!normalizedIds.length) {
          return current;
        }

        current[studentId] = normalizedIds;
        return current;
      },
      {},
    );

    const createdAt = new Date().toISOString();

    const plan: AssignedLessonPlan = {
      id: createId("lesson-plan"),
      title: resolvedTitle,
      classId,
      classDate,
      notes,
      studentIds: lessonScopeStudentIds,
      conditioningIds,
      skillIds,
      perStudentSkillIds: normalizedPerStudentSkillIds,
      createdAt,
    };

    persistState((current) => ({
      ...current,
      assignedLessonPlans: [plan, ...current.assignedLessonPlans],
    }));

    return plan;
  };

  const toggleLessonPlanItem = (kind: "conditioning" | "skill", itemId: string) => {
    persistState((current) => {
      const key = kind === "conditioning" ? "conditioningIds" : "skillIds";
      const ids = current.lessonPlan[key];
      const nextIds = ids.includes(itemId)
        ? ids.filter((id) => id !== itemId)
        : [...ids, itemId];

      return {
        ...current,
        lessonPlan: {
          ...current.lessonPlan,
          [key]: nextIds,
        },
      };
    });
  };

  const clearLessonPlan = () => {
    persistState((current) => ({
      ...current,
      lessonPlan: {
        conditioningIds: [],
        skillIds: [],
      },
    }));
  };

  const value: CoachStore = {
    ...state,
    signInCoach,
    signOutCoach,
    updateCoachProfile,
    changeCoachPassword,
    addStudent,
    updateStudent,
    updateStudentProgress,
    updateStudentProfile,
    addStudentNote,
    addClass,
    addConditioningExercise,
    updateConditioningExercise,
    addSkillExercise,
    updateSkillExercise,
    assignLessonPlanToClass,
    toggleLessonPlanItem,
    clearLessonPlan,
  };

  return <CoachContext.Provider value={value}>{children}</CoachContext.Provider>;
};

export const useCoachApp = () => {
  const context = useContext(CoachContext);

  if (!context) {
    throw new Error("useCoachApp must be used inside CoachProvider.");
  }

  return context;
};
