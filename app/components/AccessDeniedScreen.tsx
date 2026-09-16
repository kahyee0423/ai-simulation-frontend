"use client";

import { useAuth } from "../context/AuthContext";
import { ShieldX, LogOut, Mail, UserPlus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AccessDeniedScreen() {
  const { user, signOut } = useAuth();

  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-950 flex items-center justify-center relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-rose-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-rose-900/40 rounded-3xl p-10 shadow-2xl shadow-black/40 flex flex-col items-center gap-7">

          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldX className="w-9 h-9 text-rose-400" />
          </div>

          {/* Text */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Access Restricted
            </h1>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-xs">
              Your account is not registered yet or access has been paused. Please register for access or contact your administrator.
            </p>
          </div>

          {/* Email badge */}
          {user?.email && (
            <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-400">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
          )}

          {/* Register Action */}
          <Link
            href="/register"
            id="access-denied-register-btn"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl px-5 py-3 transition-all duration-200 text-sm shadow-lg shadow-indigo-600/20 group"
          >
            <UserPlus className="w-4 h-4" />
            <span>Go to Registration</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Sign out */}
          <button
            id="access-denied-signout-btn"
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-rose-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-rose-500/5 border border-transparent hover:border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
