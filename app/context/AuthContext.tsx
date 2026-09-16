"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  User,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import {
  createOrUpdateUserRecord,
  getUserRecord,
  registerUserRecord,
  isAllowlisted,
  UserRecord,
} from "../lib/firestore";

interface AuthContextValue {
  user: User | null;
  userRecord: UserRecord | null;
  isRegistered: boolean | null; // null = still loading
  allowlisted: boolean | null; // null = still loading
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  registerUser: (extra?: { displayName?: string; organization?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRecord: (currentUser?: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRecord, setUserRecord] = useState<UserRecord | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  const [allowlisted, setAllowlisted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserRecord = async (currentUser?: User | null) => {
    const target = currentUser !== undefined ? currentUser : user;
    if (!target) {
      setUserRecord(null);
      setIsRegistered(null);
      setAllowlisted(null);
      return;
    }
    const record = await getUserRecord(target.uid);
    const allowed = await isAllowlisted(target.email ?? "", record);
    setUserRecord(record);
    setIsRegistered(record ? !!record.isRegistered : false);
    setAllowlisted(allowed);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await createOrUpdateUserRecord(firebaseUser);
        await refreshUserRecord(firebaseUser);
      } else {
        setUserRecord(null);
        setIsRegistered(null);
        setAllowlisted(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleProvider);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (extra?: { displayName?: string; organization?: string }) => {
    if (!user) throw new Error("No user to register");
    await registerUserRecord(user, extra);
    await refreshUserRecord(user);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserRecord(null);
    setIsRegistered(null);
    setAllowlisted(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userRecord,
        isRegistered,
        allowlisted,
        loading,
        signInWithGoogle,
        registerUser,
        signOut,
        refreshUserRecord,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
