"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Loader2, FlaskConical, UserPlus } from "lucide-react";
import LoginScreen from "../components/LoginScreen";
import AccessDeniedScreen from "../components/AccessDeniedScreen";
import UsageLimitScreen from "../components/UsageLimitScreen";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, userRecord, isRegistered, allowlisted, loading } = useAuth();

  //Automatically navigate unregistered users to /register
  useEffect(() => {
    if (!loading && user && isRegistered === false) {
      router.push("/register");
    }
  }, [loading, user, isRegistered, router]);

  //Auth state still loading
  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FlaskConical className="w-7 h-7 text-indigo-400" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
          </span>
        </div>
        <p className="text-slate-500 text-sm tracking-wide">Authenticating…</p>
      </div>
    );
  }

  //Not signed in
  if (!user) {
    return <LoginScreen />;
  }

  //Signed in but not registered -> redirect to registration
  if (isRegistered === false) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
          <UserPlus className="w-8 h-8 text-indigo-400 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Registration Required</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Your account is signed in, but not yet registered in AI Simulation Lab. Redirecting to registration…
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl px-5 py-2.5 text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <span>Complete Registration Now</span>
        </Link>
      </div>
    );
  }

  // 4. Signed in and registered, but blocked by admin
  if (allowlisted === false) {
    return <AccessDeniedScreen />;
  }

  // 5. State still resolving
  if (allowlisted === null || isRegistered === null) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  // 6. All good — render simulation lab
  return <>{children}</>;
}
