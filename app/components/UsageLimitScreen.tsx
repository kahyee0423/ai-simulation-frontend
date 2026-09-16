"use client";

import { useAuth } from "../context/AuthContext";
import { FlaskConical, CheckCircle2, LogOut } from "lucide-react";

export default function UsageLimitScreen() {
  const { user, userRecord, signOut } = useAuth();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex items-center justify-center relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-10 shadow-2xl shadow-black/40 flex flex-col items-center gap-7">

          {/* Icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
              <FlaskConical className="w-9 h-9 text-indigo-400" />
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
          </div>

          {/* Text */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Simulation Complete
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs">
              You have already used your simulation. Each account is entitled
              to one simulation run.
            </p>
          </div>

          {/* Prompt summary */}
          {userRecord?.simulationPrompt && (
            <div className="w-full bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4">
              <p className="text-[11px] text-slate-500 uppercase tracking-widest font-medium mb-2">
                Your simulation
              </p>
              <p className="text-sm text-slate-300 leading-relaxed line-clamp-4">
                {userRecord.simulationPrompt}
              </p>
            </div>
          )}

          {/* User email */}
          {user?.email && (
            <p className="text-xs text-slate-600 truncate max-w-full">{user.email}</p>
          )}

          {/* Sign out */}
          <button
            id="usage-limit-signout-btn"
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700/50"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
