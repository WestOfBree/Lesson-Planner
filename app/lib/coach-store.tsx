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
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  setDoc,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import {
  type AssignedLessonPlan,
  coachNameFromEmail,
  defaultConditioningExercises,
  defaultSkillExercises,
  slugify,
  type CoachClassData,
  type CoachSession,
  type LibraryItem,
  type LessonPlanState,
  type NewClassInput,
  type NewLessonPlanInput,
  type NewLibraryItemInput,
  type NewSkillLibraryItemInput,
  type SkillLibraryItem,
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

type ShareKind = "conditioning" | "skill" | "student";

type PendingShareRequest = {
  id: string;
  senderId: string;
  senderEmail: string;
  senderDisplayName: string;
  recipientId: string;
  kind: ShareKind;
  item: LibraryItem | SkillLibraryItem | StudentProfileData;
  createdAt: string;
  status: "pending";
};

type CoachState = {
  currentCoach: CoachSession | null;
  isHydrating: boolean;
  hydrationError: string | null;
  friends: CoachFriend[];
  incomingFriendRequests: FriendRequest[];
  incomingShares: PendingShareRequest[];
  students: StudentProfileData[];
  classes: CoachClassData[];
  conditioningExercises: LibraryItem[];
  deletedConditioningExerciseIds: string[];
  skillExercises: SkillLibraryItem[];
  deletedSkillExerciseIds: string[];
  assignedLessonPlans: AssignedLessonPlan[];
  lessonPlan: LessonPlanState;
};

type PersistedCoachState = Omit<CoachState, "currentCoach" | "isHydrating" | "hydrationError"> & {
  updatedAt?: unknown;
};

type CoachDirectoryProfile = {
  id: string;
  email: string;
  displayName: string;
};

type CoachFriend = CoachDirectoryProfile & {
  addedAt: string;
};

type FriendRequest = CoachDirectoryProfile & {
  requestedAt: string;
};

type CoachStore = CoachState & {
  signInCoach: (input: SignInInput) => Promise<CoachSession>;
  signOutCoach: () => void;
  updateCoachProfile: (input: { displayName: string; email: string }) => Promise<CoachSession>;
  changeCoachPassword: (input: { currentPassword: string; newPassword: string }) => Promise<void>;
  searchCoachByEmail: (email: string) => Promise<CoachDirectoryProfile | null>;
  sendFriendRequest: (friendId: string) => Promise<void>;
  approveFriendRequest: (requesterId: string) => Promise<void>;
  declineFriendRequest: (requesterId: string) => Promise<void>;
  acceptSharedItem: (shareId: string) => Promise<void>;
  declineSharedItem: (shareId: string) => Promise<void>;
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
  shareConditioningExercise: (exerciseId: string, friendId: string) => Promise<void>;
  addSkillExercise: (input: NewSkillLibraryItemInput) => SkillLibraryItem;
  updateSkillExercise: (exerciseId: string, input: NewSkillLibraryItemInput) => void;
  deleteSkillExercise: (exerciseId: string) => void;
  shareSkillExercise: (exerciseId: string, friendId: string) => Promise<void>;
  transferStudentToCoach: (studentId: string, friendId: string) => Promise<void>;
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
  friends: [],
  incomingFriendRequests: [],
  incomingShares: [],
  students: [],
  classes: [],
  conditioningExercises: defaultConditioningExercises,
  deletedConditioningExerciseIds: [],
  skillExercises: defaultSkillExercises,
  deletedSkillExerciseIds: [],
  assignedLessonPlans: [],
  lessonPlan: {
    conditioningIds: [],
    skillIds: [],
  },
};
let initialized = false;
let coachStateUnsubscribe: (() => void) | null = null;
let friendsUnsubscribe: (() => void) | null = null;
let incomingFriendRequestsUnsubscribe: (() => void) | null = null;
let incomingSharesUnsubscribe: (() => void) | null = null;

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
  perStudentOutcomeNotes: Object.entries(plan.perStudentOutcomeNotes ?? {}).reduce<Record<string, string>>(
    (current, [studentId, note]) => {
      const normalizedNote = String(note ?? "").trim();

      if (!normalizedNote) {
        return current;
      }

      current[studentId] = normalizedNote;
      return current;
    },
    {},
  ),
});

const mergeLibraryItems = <T extends { id: string }>(
  defaults: T[],
  stored: T[] | undefined,
  deletedIds: string[] | undefined,
): T[] => {
  const merged = new Map(defaults.map((item) => [item.id, item]));
  const deletedIdSet = new Set(deletedIds ?? []);

  (stored ?? []).forEach((item) => {
    merged.set(item.id, item);
  });

  return Array.from(merged.values()).filter((item) => !deletedIdSet.has(item.id));
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
  deletedConditioningExerciseIds: value?.deletedConditioningExerciseIds ?? cachedState.deletedConditioningExerciseIds,
  deletedSkillExerciseIds: value?.deletedSkillExerciseIds ?? cachedState.deletedSkillExerciseIds,
  conditioningExercises: mergeLibraryItems(
    defaultConditioningExercises,
    value?.conditioningExercises ?? cachedState.conditioningExercises,
    value?.deletedConditioningExerciseIds ?? cachedState.deletedConditioningExerciseIds,
  ),
  skillExercises: mergeLibraryItems(
    defaultSkillExercises,
    value?.skillExercises ?? cachedState.skillExercises,
    value?.deletedSkillExerciseIds ?? cachedState.deletedSkillExerciseIds,
  ),
  students: value?.students?.map((student) => normalizeStudent(student)) ?? cachedState.students,
  classes: value?.classes ?? cachedState.classes,
  assignedLessonPlans: value?.assignedLessonPlans?.map((plan) => normalizeLessonPlan(plan)) ?? cachedState.assignedLessonPlans,
  lessonPlan: value?.lessonPlan ?? cachedState.lessonPlan,
  currentCoach: value?.currentCoach ?? cachedState.currentCoach,
  incomingFriendRequests: value?.incomingFriendRequests ?? cachedState.incomingFriendRequests,
  incomingShares: value?.incomingShares ?? cachedState.incomingShares,
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
const coachProfileRef = (uid: string) => doc(db, "coachProfiles", uid);
const friendsCollectionRef = (uid: string) => collection(db, "coachProfiles", uid, "friends");
const incomingFriendRequestsCollectionRef = (uid: string) => collection(db, "coachProfiles", uid, "friendRequests");
const incomingFriendRequestRef = (uid: string, requesterId: string) =>
  doc(db, "coachProfiles", uid, "friendRequests", requesterId);
const incomingSharesCollectionRef = (uid: string) => collection(db, "coachProfiles", uid, "incomingShares");
const incomingShareRef = (uid: string, shareId: string) => doc(db, "coachProfiles", uid, "incomingShares", shareId);
const friendRef = (uid: string, friendId: string) => doc(db, "coachProfiles", uid, "friends", friendId);

const notify = () => {
  listeners.forEach((listener) => listener());
};

const serializeState = (state: CoachState): PersistedCoachState => ({
  friends: state.friends,
  incomingFriendRequests: state.incomingFriendRequests,
  incomingShares: state.incomingShares,
  students: state.students,
  classes: state.classes,
  conditioningExercises: state.conditioningExercises,
  deletedConditioningExerciseIds: state.deletedConditioningExerciseIds,
  skillExercises: state.skillExercises,
  deletedSkillExerciseIds: state.deletedSkillExerciseIds,
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

const toIsoDate = (value: unknown) => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
};

const syncCoachProfile = async (session: CoachSession) => {
  await setDoc(
    coachProfileRef(session.id),
    {
      uid: session.id,
      email: session.email,
      displayName: session.displayName,
      isGuest: session.isGuest,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
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
    friendsUnsubscribe?.();
    friendsUnsubscribe = null;
    incomingFriendRequestsUnsubscribe?.();
    incomingFriendRequestsUnsubscribe = null;
    incomingSharesUnsubscribe?.();
    incomingSharesUnsubscribe = null;

    if (!user) {
      cachedState = {
        currentCoach: null,
        isHydrating: false,
        hydrationError: null,
        friends: [],
        incomingFriendRequests: [],
        incomingShares: [],
        students: [],
        classes: [],
        conditioningExercises: defaultConditioningExercises,
        deletedConditioningExerciseIds: [],
        skillExercises: defaultSkillExercises,
        deletedSkillExerciseIds: [],
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

    void syncCoachProfile(session).catch((error: unknown) => {
      console.error("Failed to sync coach profile.", error);
    });

    friendsUnsubscribe = onSnapshot(
      friendsCollectionRef(user.uid),
      (snapshot) => {
        const friends = snapshot.docs
          .map((entry) => {
            const data = entry.data() as {
              uid?: string;
              email?: string;
              displayName?: string;
              addedAt?: unknown;
            };

            const uid = data.uid ?? entry.id;
            const email = (data.email ?? "").trim().toLowerCase();
            const displayName = (data.displayName ?? "").trim() || coachNameFromEmail(email || uid);

            if (!uid || !email) {
              return null;
            }

            return {
              id: uid,
              email,
              displayName,
              addedAt: toIsoDate(data.addedAt),
            } satisfies CoachFriend;
          })
          .filter((friend): friend is CoachFriend => friend !== null)
          .sort((left, right) => right.addedAt.localeCompare(left.addedAt));

        cachedState = mergeState({ friends });
        notify();
      },
      (error) => {
        console.error("Unable to sync friends list.", error);
      },
    );

    incomingFriendRequestsUnsubscribe = onSnapshot(
      incomingFriendRequestsCollectionRef(user.uid),
      (snapshot) => {
        const incomingFriendRequests = snapshot.docs
          .map((entry) => {
            const data = entry.data() as {
              requesterId?: string;
              email?: string;
              displayName?: string;
              requestedAt?: unknown;
            };

            const requesterId = (data.requesterId ?? entry.id).trim();
            const email = (data.email ?? "").trim().toLowerCase();
            const displayName = (data.displayName ?? "").trim() || coachNameFromEmail(email || requesterId);

            if (!requesterId || !email) {
              return null;
            }

            return {
              id: requesterId,
              email,
              displayName,
              requestedAt: toIsoDate(data.requestedAt),
            } satisfies FriendRequest;
          })
          .filter((request): request is FriendRequest => request !== null)
          .sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));

        cachedState = mergeState({ incomingFriendRequests });
        notify();
      },
      (error) => {
        console.error("Unable to sync incoming friend requests.", error);
      },
    );

    incomingSharesUnsubscribe = onSnapshot(
      incomingSharesCollectionRef(user.uid),
      (snapshot) => {
        const incomingShares = snapshot.docs
          .map((entry) => {
            const data = entry.data() as {
              senderId?: string;
              senderEmail?: string;
              senderDisplayName?: string;
              recipientId?: string;
              kind?: ShareKind;
              item?: LibraryItem | SkillLibraryItem;
              createdAt?: unknown;
              status?: "pending";
            };

            const senderId = (data.senderId ?? "").trim();
            const senderEmail = (data.senderEmail ?? "").trim().toLowerCase();
            const senderDisplayName = (data.senderDisplayName ?? "").trim();
            const recipientId = (data.recipientId ?? "").trim();
            const kind = data.kind === "skill" ? "skill" : "conditioning";
            const item = data.item;

            if (!senderId || !recipientId || !item || data.status !== "pending" || (data.kind !== "skill" && data.kind !== "conditioning")) {
              return null;
            }

            return {
              id: entry.id,
              senderId,
              senderEmail,
              senderDisplayName: senderDisplayName || coachNameFromEmail(senderEmail || senderId),
              recipientId,
              kind: kind as "skill" | "conditioning",
              item: item as LibraryItem | SkillLibraryItem,
              createdAt: toIsoDate(data.createdAt),
              status: "pending",
            } satisfies PendingShareRequest;
          })
          .filter((share) => share !== null)
          .sort((left, right) => right.createdAt.localeCompare(left.createdAt)) as PendingShareRequest[];

        cachedState = mergeState({ incomingShares });
        notify();
      },
      (error) => {
        console.error("Unable to sync incoming shared items.", error);
      },
    );

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
            friends: cachedState.friends,
            incomingFriendRequests: cachedState.incomingFriendRequests,
            students: data?.students,
            classes: data?.classes,
            conditioningExercises: data?.conditioningExercises,
            deletedConditioningExerciseIds: data?.deletedConditioningExerciseIds,
            skillExercises: data?.skillExercises,
            deletedSkillExerciseIds: data?.deletedSkillExerciseIds,
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

const normalizeConditioningItem = (input: NewLibraryItemInput, category: string): LibraryItem => ({
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

const normalizeSkillItem = (input: NewSkillLibraryItemInput): SkillLibraryItem => ({
  id: createId("item"),
  slug: slugify(input.title),
  title: input.title,
  category: "Aerial Skill",
  description: input.description,
  difficulty: input.difficulty,
  coachingCues: unique(input.coachingCues),
  lessonUse: input.lessonUse,
  isCustom: true,
});

const readPersistedState = (value: unknown): Partial<PersistedCoachState> => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return value as Partial<PersistedCoachState>;
};

const ensureFriendId = (friendId: string) => {
  const trimmedId = friendId.trim();

  if (!trimmedId) {
    throw new Error("Select a coach first.");
  }

  const friend = cachedState.friends.find((entry) => entry.id === trimmedId);

  if (!friend) {
    throw new Error("That coach is not in your friends list.");
  }

  return friend;
};

const uniqueSlug = (existingItems: { slug: string }[], baseTitle: string) => {
  const baseSlug = slugify(baseTitle) || "shared-item";
  const existing = new Set(existingItems.map((item) => item.slug));

  if (!existing.has(baseSlug)) {
    return baseSlug;
  }

  let nextIndex = 2;

  while (existing.has(`${baseSlug}-${nextIndex}`)) {
    nextIndex += 1;
  }

  return `${baseSlug}-${nextIndex}`;
};

const removeStudentFromState = (state: CoachState, studentId: string): CoachState => ({
  ...state,
  students: state.students.filter((student) => student.id !== studentId),
  classes: state.classes.map((classItem) => ({
    ...classItem,
    studentIds: classItem.studentIds.filter((id) => id !== studentId),
  })),
  assignedLessonPlans: state.assignedLessonPlans.map((plan) => {
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
    const nextPerStudentOutcomeNotes = Object.entries(plan.perStudentOutcomeNotes ?? {}).reduce<Record<string, string>>(
      (accumulator, [id, note]) => {
        if (id === studentId) {
          return accumulator;
        }

        accumulator[id] = note;
        return accumulator;
      },
      {},
    );

    return {
      ...plan,
      studentIds: (plan.studentIds ?? []).filter((id) => id !== studentId),
      perStudentSkillIds: nextPerStudentSkillIds,
      perStudentOutcomeNotes: nextPerStudentOutcomeNotes,
    };
  }),
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

    await syncCoachProfile(updatedSession);

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

  const searchCoachByEmail = async (email: string) => {
    const user = auth.currentUser;
    const normalizedEmail = email.trim().toLowerCase();

    if (!user) {
      throw new Error("No active coach session.");
    }

    if (!normalizedEmail) {
      throw new Error("Enter an email to search.");
    }

    if ((user.email ?? "").toLowerCase() === normalizedEmail) {
      throw new Error("You cannot add yourself as a friend.");
    }

    const snapshot = await getDocs(query(collection(db, "coachProfiles"), where("email", "==", normalizedEmail), limit(1)));

    if (!snapshot.docs.length) {
      return null;
    }

    const data = snapshot.docs[0].data() as { uid?: string; email?: string; displayName?: string };
    const id = data.uid ?? snapshot.docs[0].id;
    const profileEmail = (data.email ?? normalizedEmail).trim().toLowerCase();
    const displayName = (data.displayName ?? "").trim() || coachNameFromEmail(profileEmail);

    if (id === user.uid) {
      throw new Error("You cannot add yourself as a friend.");
    }

    return {
      id,
      email: profileEmail,
      displayName,
    };
  };

  const sendFriendRequest = async (friendId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    if (!friendId || friendId === user.uid) {
      throw new Error("Invalid friend account.");
    }

    const ownProfileSnapshot = await getDoc(coachProfileRef(user.uid));
    const targetProfileSnapshot = await getDoc(coachProfileRef(friendId));

    if (!targetProfileSnapshot.exists()) {
      throw new Error("That coach account could not be found.");
    }

    const ownData = ownProfileSnapshot.data() as { uid?: string; email?: string; displayName?: string } | undefined;
    const targetData = targetProfileSnapshot.data() as { uid?: string; email?: string; displayName?: string };

    const ownEmail = (ownData?.email ?? user.email ?? "").trim().toLowerCase();
    const ownDisplayName = (ownData?.displayName ?? user.displayName ?? "").trim() || coachNameFromEmail(ownEmail);
    const targetUid = (targetData.uid ?? friendId).trim();
    const targetEmail = (targetData.email ?? "").trim().toLowerCase();
    if (!targetUid || !targetEmail || !ownEmail) {
      throw new Error("Unable to resolve coach profile details.");
    }

    const [existingFriendSnapshot, reverseRequestSnapshot] = await Promise.all([
      getDoc(friendRef(user.uid, targetUid)),
      getDoc(incomingFriendRequestRef(user.uid, targetUid)),
    ]);

    if (existingFriendSnapshot.exists()) {
      throw new Error("That coach is already your friend.");
    }

    if (reverseRequestSnapshot.exists()) {
      throw new Error("That coach already requested you. Approve their request in your incoming requests list.");
    }

    await setDoc(
      incomingFriendRequestRef(targetUid, user.uid),
      {
        requesterId: user.uid,
        email: ownEmail,
        displayName: ownDisplayName,
        requestedAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const approveFriendRequest = async (requesterId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const trimmedRequesterId = requesterId.trim();

    if (!trimmedRequesterId || trimmedRequesterId === user.uid) {
      throw new Error("Invalid friend request.");
    }

    const [ownProfileSnapshot, requesterProfileSnapshot, requestSnapshot] = await Promise.all([
      getDoc(coachProfileRef(user.uid)),
      getDoc(coachProfileRef(trimmedRequesterId)),
      getDoc(incomingFriendRequestRef(user.uid, trimmedRequesterId)),
    ]);

    if (!requestSnapshot.exists()) {
      throw new Error("Friend request no longer exists.");
    }

    if (!requesterProfileSnapshot.exists()) {
      throw new Error("Requesting coach account could not be found.");
    }

    const ownData = ownProfileSnapshot.data() as { email?: string; displayName?: string } | undefined;
    const requesterData = requesterProfileSnapshot.data() as { uid?: string; email?: string; displayName?: string };
    const ownEmail = (ownData?.email ?? user.email ?? "").trim().toLowerCase();
    const ownDisplayName = (ownData?.displayName ?? user.displayName ?? "").trim() || coachNameFromEmail(ownEmail);
    const requesterUid = (requesterData.uid ?? trimmedRequesterId).trim();
    const requesterEmail = (requesterData.email ?? "").trim().toLowerCase();
    const requesterDisplayName = (requesterData.displayName ?? "").trim() || coachNameFromEmail(requesterEmail || requesterUid);

    if (!ownEmail || !requesterUid || !requesterEmail) {
      throw new Error("Unable to resolve coach profile details.");
    }

    const batch = writeBatch(db);

    batch.set(
      friendRef(user.uid, requesterUid),
      {
        uid: requesterUid,
        email: requesterEmail,
        displayName: requesterDisplayName,
        addedAt: serverTimestamp(),
      },
      { merge: true },
    );

    batch.set(
      friendRef(requesterUid, user.uid),
      {
        uid: user.uid,
        email: ownEmail,
        displayName: ownDisplayName,
        addedAt: serverTimestamp(),
      },
      { merge: true },
    );

    batch.delete(incomingFriendRequestRef(user.uid, requesterUid));

    await batch.commit();
  };

  const declineFriendRequest = async (requesterId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const trimmedRequesterId = requesterId.trim();

    if (!trimmedRequesterId || trimmedRequesterId === user.uid) {
      throw new Error("Invalid friend request.");
    }

    const batch = writeBatch(db);
    batch.delete(incomingFriendRequestRef(user.uid, trimmedRequesterId));
    await batch.commit();
  };

  const acceptSharedItem = async (shareId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const trimmedShareId = shareId.trim();

    if (!trimmedShareId) {
      throw new Error("Shared item could not be found.");
    }

    const shareSnapshot = await getDoc(incomingShareRef(user.uid, trimmedShareId));

    if (!shareSnapshot.exists()) {
      throw new Error("Shared item could not be found.");
    }

    const shareData = shareSnapshot.data() as {
      kind?: ShareKind;
      item?: LibraryItem | SkillLibraryItem | StudentProfileData;
      recipientId?: string;
      senderId?: string;
      status?: "pending";
    };

    if (shareData.status !== "pending") {
      throw new Error("This shared item is no longer pending review.");
    }

    if (shareData.recipientId && shareData.recipientId !== user.uid) {
      throw new Error("You cannot accept this shared item.");
    }

    if (shareData.kind === "conditioning") {
      const item = shareData.item as LibraryItem | undefined;

      if (!item) {
        throw new Error("The shared conditioning exercise could not be loaded.");
      }

      const targetStateSnapshot = await getDoc(coachStateRef(user.uid));
      const targetState = readPersistedState(targetStateSnapshot.data());
      const currentTargetExercises = mergeLibraryItems(
        defaultConditioningExercises,
        targetState.conditioningExercises,
        targetState.deletedConditioningExerciseIds,
      );
      const acceptedItem: LibraryItem = {
        ...item,
        id: createId("item"),
        slug: uniqueSlug(currentTargetExercises, item.title),
        isCustom: true,
      };

      persistState((current) => ({
        ...current,
        deletedConditioningExerciseIds: current.deletedConditioningExerciseIds.filter((id) => id !== acceptedItem.id),
        conditioningExercises: [acceptedItem, ...current.conditioningExercises],
      }));
    } else if (shareData.kind === "skill") {
      const item = shareData.item as SkillLibraryItem | undefined;

      if (!item) {
        throw new Error("The shared skill could not be loaded.");
      }

      const targetStateSnapshot = await getDoc(coachStateRef(user.uid));
      const targetState = readPersistedState(targetStateSnapshot.data());
      const currentTargetSkills = mergeLibraryItems(
        defaultSkillExercises,
        targetState.skillExercises,
        targetState.deletedSkillExerciseIds,
      );
      const acceptedItem: SkillLibraryItem = {
        ...item,
        id: createId("item"),
        slug: uniqueSlug(currentTargetSkills, item.title),
        isCustom: true,
      };

      persistState((current) => ({
        ...current,
        deletedSkillExerciseIds: current.deletedSkillExerciseIds.filter((id) => id !== acceptedItem.id),
        skillExercises: [acceptedItem, ...current.skillExercises],
      }));
    } else if (shareData.kind === "student") {
      const item = shareData.item as StudentProfileData | undefined;

      if (!item) {
        throw new Error("The shared student profile could not be loaded.");
      }

      const acceptedStudent: StudentProfileData = normalizeStudent({
        ...item,
        id: createId("student"),
        classIds: [],
        lastUpdated: new Date().toISOString(),
      });

      persistState((current) => ({
        ...current,
        students: [acceptedStudent, ...current.students],
      }));
    } else {
      throw new Error("Unsupported shared item type.");
    }

    await deleteDoc(incomingShareRef(user.uid, trimmedShareId));
  };

  const declineSharedItem = async (shareId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const trimmedShareId = shareId.trim();

    if (!trimmedShareId) {
      throw new Error("Shared item could not be found.");
    }

    await deleteDoc(incomingShareRef(user.uid, trimmedShareId));
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
    persistState((current) => removeStudentFromState(current, studentId));
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
    const item = normalizeConditioningItem(input, "Conditioning");

    persistState((current) => ({
      ...current,
      deletedConditioningExerciseIds: current.deletedConditioningExerciseIds.filter((id) => id !== item.id),
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
      deletedConditioningExerciseIds: unique([...current.deletedConditioningExerciseIds, exerciseId]),
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

  const shareConditioningExercise = async (exerciseId: string, friendId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const friend = ensureFriendId(friendId);
    const exercise = cachedState.conditioningExercises.find((item) => item.id === exerciseId);

    if (!exercise) {
      throw new Error("Conditioning exercise could not be found.");
    }

    const senderName = cachedState.currentCoach?.displayName || user.displayName || coachNameFromEmail(user.email ?? "");
    const shareId = createId("share");

    await setDoc(
      incomingShareRef(friend.id, shareId),
      {
        id: shareId,
        senderId: user.uid,
        senderEmail: user.email?.trim().toLowerCase() ?? "",
        senderDisplayName: senderName,
        recipientId: friend.id,
        kind: "conditioning",
        item: exercise,
        status: "pending",
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const addSkillExercise = (input: NewSkillLibraryItemInput) => {
    const item = normalizeSkillItem(input);

    persistState((current) => ({
      ...current,
      deletedSkillExerciseIds: current.deletedSkillExerciseIds.filter((id) => id !== item.id),
      skillExercises: [item, ...current.skillExercises],
    }));

    return item;
  };

  const updateSkillExercise = (exerciseId: string, input: NewSkillLibraryItemInput) => {
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
              coachingCues: unique(input.coachingCues),
              lessonUse: input.lessonUse.trim(),
            }
          : item,
      ),
    }));
  };

  const deleteSkillExercise = (exerciseId: string) => {
    persistState((current) => ({
      ...current,
      deletedSkillExerciseIds: unique([...current.deletedSkillExerciseIds, exerciseId]),
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

  const shareSkillExercise = async (exerciseId: string, friendId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const friend = ensureFriendId(friendId);
    const skill = cachedState.skillExercises.find((item) => item.id === exerciseId);

    if (!skill) {
      throw new Error("Skill could not be found.");
    }

    const senderName = cachedState.currentCoach?.displayName || user.displayName || coachNameFromEmail(user.email ?? "");
    const shareId = createId("share");

    await setDoc(
      incomingShareRef(friend.id, shareId),
      {
        id: shareId,
        senderId: user.uid,
        senderEmail: user.email?.trim().toLowerCase() ?? "",
        senderDisplayName: senderName,
        recipientId: friend.id,
        kind: "skill",
        item: skill,
        status: "pending",
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
  };

  const transferStudentToCoach = async (studentId: string, friendId: string) => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("No active coach session.");
    }

    const friend = ensureFriendId(friendId);
    const student = cachedState.students.find((entry) => entry.id === studentId);

    if (!student) {
      throw new Error("Student could not be found.");
    }

    const senderName = cachedState.currentCoach?.displayName || user.displayName || coachNameFromEmail(user.email ?? "");
    const shareId = createId("share");
    const transferredStudent: StudentProfileData = {
      ...student,
      classIds: [],
      lastUpdated: new Date().toISOString(),
    };

    await setDoc(
      incomingShareRef(friend.id, shareId),
      {
        id: shareId,
        senderId: user.uid,
        senderEmail: user.email?.trim().toLowerCase() ?? "",
        senderDisplayName: senderName,
        recipientId: friend.id,
        kind: "student",
        item: transferredStudent,
        status: "pending",
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
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
    const perStudentOutcomeNotes = input.perStudentOutcomeNotes ?? {};

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
    const normalizedPerStudentOutcomeNotes = Object.entries(perStudentOutcomeNotes).reduce<Record<string, string>>(
      (current, [studentId, note]) => {
        if (!eligibleStudentIds.includes(studentId)) {
          return current;
        }

        const normalizedNote = String(note ?? "").trim();

        if (!normalizedNote) {
          return current;
        }

        current[studentId] = normalizedNote;
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
      perStudentOutcomeNotes: normalizedPerStudentOutcomeNotes,
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
    const perStudentOutcomeNotes = input.perStudentOutcomeNotes ?? {};

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
    const normalizedPerStudentOutcomeNotes = Object.entries(perStudentOutcomeNotes).reduce<Record<string, string>>(
      (current, [studentId, note]) => {
        if (!eligibleStudentIds.includes(studentId)) {
          return current;
        }

        const normalizedNote = String(note ?? "").trim();

        if (!normalizedNote) {
          return current;
        }

        current[studentId] = normalizedNote;
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
      perStudentOutcomeNotes: normalizedPerStudentOutcomeNotes,
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
    searchCoachByEmail,
    sendFriendRequest,
    approveFriendRequest,
    declineFriendRequest,
    acceptSharedItem,
    declineSharedItem,
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
    shareConditioningExercise,
    addSkillExercise,
    updateSkillExercise,
    deleteSkillExercise,
    shareSkillExercise,
    transferStudentToCoach,
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
