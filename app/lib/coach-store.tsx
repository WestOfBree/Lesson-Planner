"use client";

import {
  createContext,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  EmailAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateEmail,
  updatePassword,
  updateProfile,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
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
  type UpdateLessonPlanInput,
} from "./coach-data";
import { auth, db } from "../../Firestore/init";

type SignInInput = {
  email: string;
  password: string;
  mode: "login" | "register" | "guest";
};

type CoachState = {
  currentCoach: CoachSession | null;
  isHydrating: boolean;
  hydrationError: string | null;
  students: StudentProfileData[];
  classes: CoachClassData[];
  conditioningExercises: LibraryItem[];
  skillExercises: LibraryItem[];
  assignedLessonPlans: AssignedLessonPlan[];
  lessonPlan: LessonPlanState;
};

type PersistedCoachState = Omit<CoachState, "currentCoach" | "isHydrating" | "hydrationError"> & {
  updatedAt?: unknown;
};

type CoachStore = CoachState & {
  signInCoach: (input: SignInInput) => Promise<CoachSession>;
  signOutCoach: () => void;
  updateCoachProfile: (input: { displayName: string; email: string }) => Promise<CoachSession>;
  changeCoachPassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  addStudent: (input: NewStudentInput) => StudentProfileData;
  deleteStudent: (studentId: string) => void;
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
  updateClass: (classId: string, input: NewClassInput) => void;
  deleteClass: (classId: string) => void;
  addConditioningExercise: (input: NewLibraryItemInput) => LibraryItem;
  updateConditioningExercise: (exerciseId: string, input: NewLibraryItemInput) => void;
  deleteConditioningExercise: (exerciseId: string) => void;
  addSkillExercise: (input: NewLibraryItemInput) => LibraryItem;
  updateSkillExercise: (exerciseId: string, input: NewLibraryItemInput) => void;
  deleteSkillExercise: (exerciseId: string) => void;
  assignLessonPlanToClass: (input: NewLessonPlanInput) => AssignedLessonPlan;
  updateAssignedLessonPlan: (lessonPlanId: string, input: UpdateLessonPlanInput) => AssignedLessonPlan;
  toggleLessonPlanItem: (kind: "conditioning" | "skill", itemId: string) => void;
  clearLessonPlan: () => void;
};

const listeners = new Set<() => void>();
let cachedState: CoachState = {
  currentCoach: null,
  isHydrating: true,
  hydrationError: null,
  students: [],
  classes: [],
  conditioningExercises: defaultConditioningExercises,
  skillExercises: defaultSkillExercises,
  assignedLessonPlans: [],
  lessonPlan: {
    conditioningIds: [],
    skillIds: [],
  },
};
let initialized = false;
let coachStateUnsubscribe: (() => void) | null = null;

const CoachContext = createContext<CoachStore | null>(null);

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

const createId = (prefix: string) => `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;

const normalizeLessonPlan = (plan: AssignedLessonPlan): AssignedLessonPlan => ({
  ...plan,
  studentIds: plan.studentIds ?? [],
  conditioningIds: plan.conditioningIds ?? [],
  conditioningReps: Object.entries(plan.conditioningReps ?? {}).reduce<Record<string, number>>((current, [itemId, value]) => {
    const normalizedValue = Number(value);

    if (Number.isFinite(normalizedValue) && normalizedValue > 0) {
      current[itemId] = Math.round(normalizedValue);
    }

    return current;
  }, {}),
  skillIds: plan.skillIds ?? [],
  perStudentSkillIds: plan.perStudentSkillIds ?? {},
  outcomeNotes: plan.outcomeNotes ?? "",
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
  ...cachedState,
  ...value,
  conditioningExercises: mergeLibraryItems(defaultConditioningExercises, value?.conditioningExercises ?? cachedState.conditioningExercises),
  skillExercises: mergeLibraryItems(defaultSkillExercises, value?.skillExercises ?? cachedState.skillExercises),
  students: value?.students?.map((student) => normalizeStudent(student)) ?? cachedState.students,
  classes: value?.classes ?? cachedState.classes,
  assignedLessonPlans: value?.assignedLessonPlans?.map((plan) => normalizeLessonPlan(plan)) ?? cachedState.assignedLessonPlans,
  lessonPlan: value?.lessonPlan ?? cachedState.lessonPlan,
  currentCoach: value?.currentCoach ?? cachedState.currentCoach,
  isHydrating: value?.isHydrating ?? cachedState.isHydrating,
  hydrationError: value?.hydrationError ?? cachedState.hydrationError,
});

const toSession = (user: User): CoachSession => {
  const email = user.email?.trim().toLowerCase() ?? `guest-${user.uid}@aerialcoach.local`;

  return {
    id: user.uid,
    email,
    displayName: user.displayName?.trim() || coachNameFromEmail(email),
    isGuest: user.isAnonymous,
  };
};

const coachStateRef = (uid: string) => doc(db, "coachState", uid);

const notify = () => {
  listeners.forEach((listener) => listener());
};

const serializeState = (state: CoachState): PersistedCoachState => ({
  students: state.students,
  classes: state.classes,
  conditioningExercises: state.conditioningExercises,
  skillExercises: state.skillExercises,
  assignedLessonPlans: state.assignedLessonPlans,
  lessonPlan: state.lessonPlan,
  updatedAt: serverTimestamp(),
});

const writeStateToFirestore = async (state: CoachState) => {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  await setDoc(coachStateRef(user.uid), serializeState(state), { merge: true });
};

const persistState = (updater: (current: CoachState) => CoachState) => {
  const nextState = updater(cachedState);
  cachedState = nextState;
  notify();

  void writeStateToFirestore(nextState).catch((error: unknown) => {
    console.error("Failed to sync coach state to Firestore.", error);
  });
};

const ensureInitialized = () => {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  onAuthStateChanged(auth, async (user) => {
    coachStateUnsubscribe?.();
    coachStateUnsubscribe = null;

    if (!user) {
      cachedState = {
        currentCoach: null,
        isHydrating: false,
        hydrationError: null,
        students: [],
        classes: [],
        conditioningExercises: defaultConditioningExercises,
        skillExercises: defaultSkillExercises,
        assignedLessonPlans: [],
        lessonPlan: {
          conditioningIds: [],
          skillIds: [],
        },
      };
      notify();
      return;
    }

    const session = toSession(user);
    cachedState = mergeState({ currentCoach: session, isHydrating: true, hydrationError: null });
    notify();

    const reference = coachStateRef(user.uid);
    try {
      const existing = await getDoc(reference);

      if (!existing.exists()) {
        await setDoc(reference, serializeState(cachedState), { merge: true });
      }

      coachStateUnsubscribe = onSnapshot(
        reference,
        (snapshot) => {
          const data = snapshot.data() as Partial<PersistedCoachState> | undefined;

          cachedState = mergeState({
            currentCoach: toSession(user),
            isHydrating: false,
            hydrationError: null,
            students: data?.students,
            classes: data?.classes,
            conditioningExercises: data?.conditioningExercises,
            skillExercises: data?.skillExercises,
            assignedLessonPlans: data?.assignedLessonPlans,
            lessonPlan: data?.lessonPlan,
          });
          notify();
        },
        (error) => {
          cachedState = mergeState({
            currentCoach: toSession(user),
            isHydrating: false,
            hydrationError: error.message || "Unable to sync workspace data from Firestore.",
          });
          notify();
        },
      );
    } catch (error) {
      cachedState = mergeState({
        currentCoach: toSession(user),
        isHydrating: false,
        hydrationError: error instanceof Error ? error.message : "Unable to initialize Firestore state.",
      });
      notify();
    }
  });
};

const subscribe = (listener: () => void) => {
  ensureInitialized();
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = () => {
  ensureInitialized();
  return cachedState;
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
  const state = useSyncExternalStore(subscribe, getSnapshot, () => cachedState);

  const signInCoach = async ({ email, password, mode }: SignInInput) => {
    if (mode !== "guest" && (!email.trim() || !password.trim())) {
      throw new Error("Enter both an email and password.");
    }

    try {
      if (mode === "guest") {
        const credential = await signInAnonymously(auth);
        return toSession(credential.user);
      }

      if (mode === "register") {
        const sanitizedEmail = email.trim().toLowerCase();
        const credential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password.trim());
        const displayName = coachNameFromEmail(sanitizedEmail);
        await updateProfile(credential.user, { displayName });
        return {
          ...toSession(credential.user),
          displayName,
        };
      }

      const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password.trim());
      return toSession(credential.user);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Unable to sign in.");
    }
  };

  const signOutCoach = () => {
    void signOut(auth).catch((error: unknown) => {
      console.error("Failed to sign out.", error);
    });
  };

  const updateCoachProfile = async ({ displayName, email }: { displayName: string; email: string }) => {
    const nextDisplayName = displayName.trim();
    const nextEmail = email.trim().toLowerCase();

    if (!nextDisplayName || !nextEmail) {
      throw new Error("Display name and email are required.");
    }

    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    if (user.isAnonymous) {
      throw new Error("Guest sessions cannot edit account details.");
    }

    await updateProfile(user, { displayName: nextDisplayName });

    if ((user.email ?? "").toLowerCase() !== nextEmail) {
      await updateEmail(user, nextEmail);
    }

    const updatedSession: CoachSession = {
      ...toSession(user),
      displayName: nextDisplayName,
      email: nextEmail,
    };

    persistState((current) => ({
      ...current,
      currentCoach: updatedSession,
    }));

    return updatedSession;
  };

  const changeCoachPassword = async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
    const existingPassword = currentPassword.trim();
    const nextPassword = newPassword.trim();

    if (!existingPassword || !nextPassword) {
      throw new Error("Current and new password are required.");
    }

    if (nextPassword.length < 8) {
      throw new Error("New password must be at least 8 characters.");
    }

    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    if (user.isAnonymous) {
      throw new Error("Guest sessions cannot change passwords.");
    }

    if (!user.email) {
      throw new Error("Account email is unavailable.");
    }

    const credential = EmailAuthProvider.credential(user.email, existingPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, nextPassword);
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

  const deleteStudent = (studentId: string) => {
    persistState((current) => ({
      ...current,
      students: current.students.filter((student) => student.id !== studentId),
      classes: current.classes.map((classItem) => ({
        ...classItem,
        studentIds: classItem.studentIds.filter((id) => id !== studentId),
      })),
      assignedLessonPlans: current.assignedLessonPlans.map((plan) => {
        const nextPerStudentSkillIds = Object.entries(plan.perStudentSkillIds ?? {}).reduce<Record<string, string[]>>(
          (accumulator, [id, skillIds]) => {
            if (id === studentId) {
              return accumulator;
            }

            accumulator[id] = skillIds;
            return accumulator;
          },
          {},
        );

        return {
          ...plan,
          studentIds: (plan.studentIds ?? []).filter((id) => id !== studentId),
          perStudentSkillIds: nextPerStudentSkillIds,
        };
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

  const updateClass = (classId: string, input: NewClassInput) => {
    const nextStudentIds = unique(input.studentIds);

    persistState((current) => {
      const existingClass = current.classes.find((entry) => entry.id === classId);

      if (!existingClass) {
        return current;
      }

      return {
        ...current,
        classes: current.classes.map((classItem) =>
          classItem.id === classId
            ? {
                ...classItem,
                name: input.name.trim(),
                level: input.level.trim(),
                schedule: input.schedule.trim(),
                location: input.location.trim(),
                focus: input.focus.trim(),
                notes: input.notes.trim(),
                studentIds: nextStudentIds,
              }
            : classItem,
        ),
        students: current.students.map((student) => {
          const hadStudent = existingClass.studentIds.includes(student.id);
          const shouldIncludeStudent = nextStudentIds.includes(student.id);

          if (hadStudent && !shouldIncludeStudent) {
            return {
              ...student,
              classIds: student.classIds.filter((id) => id !== classId),
            };
          }

          if (!hadStudent && shouldIncludeStudent) {
            return {
              ...student,
              classIds: unique([...student.classIds, classId]),
            };
          }

          return student;
        }),
      };
    });
  };

  const deleteClass = (classId: string) => {
    persistState((current) => ({
      ...current,
      classes: current.classes.filter((classItem) => classItem.id !== classId),
      students: current.students.map((student) => ({
        ...student,
        classIds: student.classIds.filter((id) => id !== classId),
      })),
      assignedLessonPlans: current.assignedLessonPlans.filter((plan) => plan.classId !== classId),
    }));
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

  const deleteConditioningExercise = (exerciseId: string) => {
    persistState((current) => ({
      ...current,
      conditioningExercises: current.conditioningExercises.filter((item) => item.id !== exerciseId),
      assignedLessonPlans: current.assignedLessonPlans.map((plan) => {
        const nextConditioningReps = { ...(plan.conditioningReps ?? {}) };
        delete nextConditioningReps[exerciseId];

        return {
          ...plan,
          conditioningIds: (plan.conditioningIds ?? []).filter((id) => id !== exerciseId),
          conditioningReps: nextConditioningReps,
        };
      }),
      lessonPlan: {
        ...current.lessonPlan,
        conditioningIds: current.lessonPlan.conditioningIds.filter((id) => id !== exerciseId),
      },
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

  const deleteSkillExercise = (exerciseId: string) => {
    persistState((current) => ({
      ...current,
      skillExercises: current.skillExercises.filter((item) => item.id !== exerciseId),
      assignedLessonPlans: current.assignedLessonPlans.map((plan) => ({
        ...plan,
        skillIds: (plan.skillIds ?? []).filter((id) => id !== exerciseId),
        perStudentSkillIds: Object.entries(plan.perStudentSkillIds ?? {}).reduce<Record<string, string[]>>(
          (accumulator, [studentId, skillIds]) => {
            const nextSkillIds = (skillIds ?? []).filter((id) => id !== exerciseId);

            if (!nextSkillIds.length) {
              return accumulator;
            }

            accumulator[studentId] = nextSkillIds;
            return accumulator;
          },
          {},
        ),
      })),
      lessonPlan: {
        ...current.lessonPlan,
        skillIds: current.lessonPlan.skillIds.filter((id) => id !== exerciseId),
      },
    }));
  };

  const assignLessonPlanToClass = (input: NewLessonPlanInput) => {
    const title = input.title.trim();
    const classId = input.classId.trim();
    const classDate = input.classDate.trim();
    const notes = input.notes.trim();
    const studentIds = unique(input.studentIds);
    const conditioningIds = unique(input.conditioningIds);
    const conditioningReps = input.conditioningReps ?? {};
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
    const normalizedConditioningReps = conditioningIds.reduce<Record<string, number>>((current, itemId) => {
      const rawReps = Number(conditioningReps[itemId]);

      if (Number.isFinite(rawReps) && rawReps > 0) {
        current[itemId] = Math.round(rawReps);
      }

      return current;
    }, {});
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
      conditioningReps: normalizedConditioningReps,
      skillIds,
      perStudentSkillIds: normalizedPerStudentSkillIds,
      outcomeNotes: "",
      createdAt,
    };

    persistState((current) => ({
      ...current,
      assignedLessonPlans: [plan, ...current.assignedLessonPlans],
    }));

    return plan;
  };

  const updateAssignedLessonPlan = (lessonPlanId: string, input: UpdateLessonPlanInput) => {
    const lessonPlan = getSnapshot().assignedLessonPlans.find((entry) => entry.id === lessonPlanId);

    if (!lessonPlan) {
      throw new Error("Lesson plan could not be found.");
    }

    const title = input.title.trim();
    const classId = input.classId.trim();
    const classDate = input.classDate.trim();
    const notes = input.notes.trim();
    const outcomeNotes = input.outcomeNotes.trim();
    const studentIds = unique(input.studentIds);
    const conditioningIds = unique(input.conditioningIds);
    const conditioningReps = input.conditioningReps ?? {};
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
    const normalizedConditioningReps = conditioningIds.reduce<Record<string, number>>((current, itemId) => {
      const rawReps = Number(conditioningReps[itemId]);

      if (Number.isFinite(rawReps) && rawReps > 0) {
        current[itemId] = Math.round(rawReps);
      }

      return current;
    }, {});
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

    const nextPlan: AssignedLessonPlan = {
      ...lessonPlan,
      title: resolvedTitle,
      classId,
      classDate,
      notes,
      studentIds: lessonScopeStudentIds,
      conditioningIds,
      conditioningReps: normalizedConditioningReps,
      skillIds,
      perStudentSkillIds: normalizedPerStudentSkillIds,
      outcomeNotes,
    };

    persistState((current) => ({
      ...current,
      assignedLessonPlans: current.assignedLessonPlans.map((plan) => (plan.id === lessonPlanId ? nextPlan : plan)),
    }));

    return nextPlan;
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
    deleteStudent,
    updateStudent,
    updateStudentProgress,
    updateStudentProfile,
    addStudentNote,
    addClass,
    updateClass,
    deleteClass,
    addConditioningExercise,
    updateConditioningExercise,
    deleteConditioningExercise,
    addSkillExercise,
    updateSkillExercise,
    deleteSkillExercise,
    assignLessonPlanToClass,
    updateAssignedLessonPlan,
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
