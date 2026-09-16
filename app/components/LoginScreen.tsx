"use client";

import { useAuth } from "../context/AuthContext";
import { FlaskConical, Sparkles, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginScreen() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex items-center justify-center relative">
      {/* Ambient background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[140px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-10 shadow-2xl shadow-black/40 flex flex-col items-center gap-8">
          
          {/* Logo */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
                <FlaskConical className="w-9 h-9 text-indigo-400" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </span>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                AI Simulation Lab
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed max-w-xs">
                Sign in with your Google account to access your simulations.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-600 uppercase tracking-widest font-medium">
              Authentication
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Sign-in Button */}
          <button
            id="google-signin-btn"
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl px-6 py-3.5 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-sm group"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loading ? "Signing in…" : "Sign In with Google"}
          </button>

          {/* Registration Navigation */}
          <div className="w-full flex flex-col items-center gap-3 pt-4 border-t border-slate-800/70">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Not registered yet?</span>
              <span className="text-slate-600">•</span>
              <span className="text-indigo-400 font-medium">1 free simulation</span>
            </div>
            <Link
              href="/register"
              id="goto-register-btn"
              className="w-full flex items-center justify-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 hover:text-white border border-indigo-500/30 hover:border-indigo-500/60 font-semibold rounded-xl px-5 py-3 transition-all duration-200 text-sm group shadow-lg shadow-indigo-950/40"
            >
              <UserPlus className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>Register for Access</span>
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform ml-auto" />
            </Link>
          </div>

          {/* Footer note */}
          <p className="text-[11px] text-slate-600 text-center leading-relaxed">
            Only registered users can access the simulation suite.
          </p>
        </div>

        {/* Subtle bottom glow */}
        <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
      </div>
    </div>
  );
}
