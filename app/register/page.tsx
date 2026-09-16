"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import {
  FlaskConical,
  Sparkles,
  UserCheck,
  Building,
  User as UserIcon,
  ArrowRight,
  Loader2,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  Layers,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const {
    user,
    isRegistered,
    loading: authLoading,
    signInWithGoogle,
    registerUser,
    signOut,
  } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [organization, setOrganization] = useState("");
  const [useCase, setUseCase] = useState("Academic & Scientific Research");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Sync displayName from authenticated user if available
  useEffect(() => {
    if (user?.displayName && !displayName) {
      setDisplayName(user.displayName);
    }
  }, [user, displayName]);

  // If already registered, automatically redirect to main app
  useEffect(() => {
    if (!authLoading && user && isRegistered === true) {
      router.replace("/");
    }
  }, [authLoading, user, isRegistered, router]);

  // Handle registration submission for authenticated user
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmedName = displayName.trim();
    const trimmedOrg = organization.trim();
    const trimmedDomain = useCase.trim();

    if (!trimmedName) {
      setErrorMsg("Full Name is required.");
      return;
    }
    if (!trimmedOrg) {
      setErrorMsg("Organization / Affiliation is required.");
      return;
    }
    if (!trimmedDomain) {
      setErrorMsg("Research Domain is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await registerUser({
        displayName: trimmedName,
        organization: `${trimmedOrg} • ${trimmedDomain}`,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 900);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Registration failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // One-click Google sign in to unlock registration form
  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await signInWithGoogle();
      // Once signed in, user state updates and the required fields form displays
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(
        err instanceof Error ? err.message : "Google authentication failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 gap-3">
        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
        <p className="text-slate-500 text-xs">Checking authorization…</p>
      </div>
    );
  }

  // If already registered and redirecting
  if (user && isRegistered === true) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 gap-3 text-center px-4">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-lg font-bold text-white">Already Registered</h2>
        <p className="text-xs text-slate-400">Taking you directly to the AI Simulation Lab…</p>
        <Loader2 className="w-4 h-4 text-indigo-400 animate-spin mt-1" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center p-3 relative">
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Compact Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/50 flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-md">
                <FlaskConical className="w-5 h-5 text-indigo-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
              </span>
            </div>

            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">
                Register for Access
              </h1>
              <p className="text-[11px] text-slate-400 mt-1">
                AI Simulation Lab • 1 usage grant per account
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-3 py-2 px-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 text-[11px] text-center leading-tight">
              {errorMsg}
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="mb-3 py-2 px-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-emerald-300 text-[11px]">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Registration completed! Entering simulation lab…</span>
            </div>
          )}

          {/* Scenario A: User is authenticated, filling required fields */}
          {user ? (
            <form onSubmit={handleCompleteRegistration} className="space-y-3">
              {/* Linked Google Account strip */}
              <div className="bg-slate-800/50 border border-slate-700/60 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt="Avatar"
                      width={28}
                      height={28}
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="w-7 h-7 rounded-full border border-indigo-500/30 shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-white truncate leading-none">
                      {user.displayName || "Google Account"}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate leading-none mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={signOut}
                  title="Switch Google account"
                  className="text-slate-400 hover:text-rose-400 p-1.5 rounded-md hover:bg-slate-700/40 transition-colors shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Required Input 1: Full Name */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Full Name / Display Name <span className="text-rose-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alan Turing"
                    className="w-full bg-slate-800/70 border border-slate-700/70 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Required Input 2: Organization / University */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Organization / University / Affiliation <span className="text-rose-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. University, Tech Lab, Independent"
                    className="w-full bg-slate-800/70 border border-slate-700/70 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Required Input 3: Research Domain */}
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Research Domain / Primary Interest <span className="text-rose-400 font-bold">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    required
                    value={useCase}
                    onChange={(e) => setUseCase(e.target.value)}
                    className="w-full bg-slate-800/70 border border-slate-700/70 focus:border-indigo-500 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white outline-none transition-colors cursor-pointer"
                  >
                    <option value="Academic & Scientific Research">Academic & Scientific Research</option>
                    <option value="Agentic AI & LLM Systems">Agentic AI & LLM Systems</option>
                    <option value="Physics & Engineering Simulation">Physics & Engineering Simulation</option>
                    <option value="Robotics & Autonomous Systems">Robotics & Autonomous Systems</option>
                    <option value="Bioinformatics & Healthcare">Bioinformatics & Healthcare</option>
                    <option value="Personal Exploration">Personal Exploration & Prototyping</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || success}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold rounded-xl px-4 py-2.5 transition-all text-xs shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed group mt-1"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Completing Registration…</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Complete Registration & Launch Lab</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform ml-0.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Scenario B: Unauthenticated visitor -> Connect Google Account */
            <div className="space-y-4">
              {/* Highlight benefits */}
              <div className="bg-slate-800/40 border border-slate-800/80 rounded-xl p-3 space-y-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Interactive simulation engine with live code execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>1 free full simulation run per registered account</span>
                </div>
                <div className="flex items-center gap-2">
                  <FlaskConical className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Automated research report, charts & hypothesis synthesis</span>
                </div>
              </div>

              {/* Google Sign In & Register Button */}
              <button
                id="register-google-btn"
                onClick={handleGoogleSignIn}
                disabled={submitting || success}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-50 text-slate-900 font-semibold rounded-xl px-4 py-2.5 transition-all shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 text-xs group"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span>Continue with Google to Register</span>
              </button>
            </div>
          )}

          {/* Navigation back to Sign In */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-400">
              Already have an account?{" "}
              <Link
                href="/"
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 ml-1"
              >
                Sign In
              </Link>
            </p>
          </div>

        </div>

        {/* Bottom subtle glow */}
        <div className="absolute inset-x-6 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      </div>
    </div>
  );
}
