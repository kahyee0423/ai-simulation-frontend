"use client";

import { useAuth } from "../context/AuthContext";
import { LogOut, ChevronDown, User, Shield } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function UserBadge() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAdmin = !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        id="user-badge-btn"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-2 py-1.5 transition-all group"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? "User"}
            width={22}
            height={22}
            unoptimized
            referrerPolicy="no-referrer"
            className="rounded-full ring-1 ring-indigo-500/30"
          />
        ) : (
          <span className="w-[22px] h-[22px] rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <User className="w-3 h-3 text-indigo-400" />
          </span>
        )}
        <span className="text-xs text-slate-400 max-w-[120px] truncate hidden sm:block group-hover:text-slate-200 transition-colors">
          {user.displayName ?? user.email}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-600 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-800">
            <p className="text-xs font-medium text-slate-300 truncate">
              {user.displayName}
            </p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Admin link (only visible to admin users) */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all text-left border-b border-slate-800"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {/* Sign out */}
          <button
            id="user-badge-signout-btn"
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 transition-all text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
