import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
  increment,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";
import type { User } from "firebase/auth";

export interface UserRecord {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  usageCount: number;
  simulationPrompt: string | null;
  simulationResult?: unknown;
  allowlisted: boolean;
  isRegistered?: boolean;
  organization?: string;
  createdAt: unknown;
  lastLoginAt: unknown;
  registeredAt?: unknown;
}

// ─── User Record ────────────────────────────────────────────────────────────

export async function getUserRecord(uid: string): Promise<UserRecord | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as UserRecord) : null;
  } catch (err) {
    console.error("Failed to get user record:", err);
    return null;
  }
}

export async function createOrUpdateUserRecord(user: User): Promise<void> {
  try {
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // First login — record initial un-registered user presence
      await setDoc(ref, {
        uid: user.uid,
        email: user.email ?? "",
        displayName: user.displayName ?? "",
        photoURL: user.photoURL ?? "",
        usageCount: 0,
        simulationPrompt: null,
        allowlisted: false,
        isRegistered: false,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Subsequent login — just update lastLoginAt and basic profile
      await updateDoc(ref, {
        lastLoginAt: serverTimestamp(),
        displayName: user.displayName ?? snap.data().displayName,
        photoURL: user.photoURL ?? snap.data().photoURL,
      });
    }
  } catch (err) {
    console.error("Failed to create/update user record:", err);
  }
}

export async function registerUserRecord(
  user: User,
  extra?: { displayName?: string; organization?: string }
): Promise<void> {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  const now = serverTimestamp();

  const isExisting = snap.exists();
  const existingData = isExisting ? snap.data() : {};

  await setDoc(
    ref,
    {
      uid: user.uid,
      email: user.email ?? "",
      displayName: extra?.displayName || user.displayName || existingData.displayName || "",
      photoURL: user.photoURL ?? existingData.photoURL ?? "",
      organization: extra?.organization || existingData.organization || "",
      isRegistered: true,
      allowlisted: true,
      usageCount: existingData.usageCount ?? 0,
      simulationPrompt: existingData.simulationPrompt ?? null,
      createdAt: existingData.createdAt ?? now,
      lastLoginAt: now,
      registeredAt: now,
    },
    { merge: true }
  );
}

// ─── Allowlist ───────────────────────────────────────────────────────────────

export async function isAllowlisted(email: string, userRecord?: UserRecord | null): Promise<boolean> {
  // If user is registered and not explicitly blocked
  if (userRecord && userRecord.isRegistered && userRecord.allowlisted !== false) {
    return true;
  }

  // Gracefully check allowlist collection if configured
  try {
    const ref = doc(db, "allowlist", email.toLowerCase());
    const snap = await getDoc(ref);
    if (snap.exists()) return true;
  } catch (err) {
    // Graceful fallback for permission/rules errors
    console.warn("Allowlist check warning (ignorable if using registration):", err);
  }

  return userRecord ? (!!userRecord.isRegistered && userRecord.allowlisted !== false) : false;
}

export async function setAllowlistStatus(
  uid: string,
  email: string,
  allowed: boolean
): Promise<void> {
  // Update the allowlist collection if possible
  try {
    const listRef = doc(db, "allowlist", email.toLowerCase());
    if (allowed) {
      await setDoc(listRef, { email: email.toLowerCase(), addedAt: serverTimestamp() });
    } else {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(listRef);
    }
  } catch (err) {
    console.warn("Allowlist collection update omitted:", err);
  }
  // Mirror on user doc
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { allowlisted: allowed });
}

// ─── Usage / Simulation ──────────────────────────────────────────────────────

export async function recordSimulation(
  uid: string,
  prompt: string,
  result?: unknown
): Promise<void> {
  try {
    const ref = doc(db, "users", uid);
    const dataToUpdate: Record<string, unknown> = {
      usageCount: increment(1),
      simulationPrompt: prompt,
    };
    if (result !== undefined) {
      dataToUpdate.simulationResult = result;
    }
    await updateDoc(ref, dataToUpdate);
  } catch (err) {
    console.error("Failed to record simulation in Firestore:", err);
  }
}

export async function resetUsage(uid: string): Promise<void> {
  const ref = doc(db, "users", uid);
  await updateDoc(ref, {
    usageCount: 0,
    simulationPrompt: null,
    simulationResult: null,
  });
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<UserRecord[]> {
  try {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as UserRecord);
  } catch (err) {
    console.error("Failed to get all users:", err);
    return [];
  }
}
