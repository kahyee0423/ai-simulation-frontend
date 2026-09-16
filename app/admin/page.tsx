"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import {
  getAllUsers,
  setAllowlistStatus,
  resetUsage,
  UserRecord,
} from "../lib/firestore";
import {
  Users,
  FlaskConical,
  ShieldCheck,
  ShieldX,
  RefreshCw,
  Search,
  LogOut,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  User,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type SortKey = "createdAt" | "usageCount" | "email" | "allowlisted";
type SortDir = "asc" | "desc";

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const isAdmin =
    !!user && ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [authLoading, user, isAdmin, router]);

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users
      .filter(
        (u) =>
          !q ||
          u.email.toLowerCase().includes(q) ||
          u.displayName.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let valA: unknown = a[sortKey];
        let valB: unknown = b[sortKey];
        if (sortKey === "createdAt") {
          // Firestore Timestamp → seconds
          valA = (a.createdAt as { seconds?: number })?.seconds ?? 0;
          valB = (b.createdAt as { seconds?: number })?.seconds ?? 0;
        }
        if (typeof valA === "string" && typeof valB === "string") {
          return sortDir === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        const nA = valA as number;
        const nB = valB as number;
        return sortDir === "asc" ? nA - nB : nB - nA;
      });
  }, [users, search, sortKey, sortDir]);

  const stats = useMemo(
    () => ({
      total: users.filter((u) => u.isRegistered !== false).length,
      simulated: users.filter((u) => u.usageCount > 0).length,
      allowlisted: users.filter((u) => u.allowlisted).length,
      blocked: users.filter((u) => !u.allowlisted).length,
    }),
    [users]
  );

  const handleToggleAllowlist = async (u: UserRecord) => {
    setActionLoading(`allow-${u.uid}`);
    try {
      await setAllowlistStatus(u.uid, u.email, !u.allowlisted);
      setUsers((prev) =>
        prev.map((x) =>
          x.uid === u.uid ? { ...x, allowlisted: !u.allowlisted } : x
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetUsage = async (u: UserRecord) => {
    setActionLoading(`reset-${u.uid}`);
    try {
      await resetUsage(u.uid);
      setUsers((prev) =>
        prev.map((x) =>
          x.uid === u.uid ? { ...x, usageCount: 0, simulationPrompt: null } : x
        )
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (
      sortDir === "asc" ? (
        <ChevronUp className="w-3 h-3 text-indigo-400" />
      ) : (
        <ChevronDown className="w-3 h-3 text-indigo-400" />
      )
    ) : (
      <ChevronDown className="w-3 h-3 text-slate-700" />
    );

  if (authLoading || (!isAdmin && !authLoading)) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-indigo-600/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[400px] bg-purple-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                AI Simulation Lab — User Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="admin-refresh-btn"
              onClick={fetchUsers}
              disabled={fetching}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              id="admin-signout-btn"
              onClick={signOut}
              className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors bg-slate-900 border border-slate-800 hover:border-rose-900/40 rounded-lg px-3 py-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Users",
              value: stats.total,
              icon: Users,
              color: "indigo",
            },
            {
              label: "Simulations Run",
              value: stats.simulated,
              icon: FlaskConical,
              color: "purple",
            },
            {
              label: "Allowlisted",
              value: stats.allowlisted,
              icon: ShieldCheck,
              color: "emerald",
            },
            {
              label: "Blocked",
              value: stats.blocked,
              icon: ShieldX,
              color: "rose",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className={`bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl p-5 flex items-center gap-4`}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center shrink-0`}
              >
                <Icon className={`w-5 h-5 text-${color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white tabular-nums">
                  {value}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
            <h2 className="text-sm font-semibold text-slate-300">
              Registered Users{" "}
              <span className="text-slate-600 font-normal ml-1">
                ({filtered.length})
              </span>
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
              <input
                id="admin-search-input"
                type="text"
                placeholder="Search by email or name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 w-64 transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {[
                    { label: "User", key: "email" as SortKey },
                    { label: "Registered", key: "createdAt" as SortKey },
                    { label: "Usage", key: "usageCount" as SortKey },
                    { label: "Access", key: "allowlisted" as SortKey },
                    { label: "Simulation Prompt", key: null },
                    { label: "Actions", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      onClick={() => key && handleSort(key)}
                      className={`text-left px-5 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap ${
                        key ? "cursor-pointer hover:text-slate-300 select-none" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon k={key} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {fetching ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-400 mx-auto" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-slate-600 text-sm"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => {
                    const createdSeconds = (
                      u.createdAt as { seconds?: number }
                    )?.seconds;
                    const dateStr = createdSeconds
                      ? new Date(createdSeconds * 1000).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "—";

                    return (
                      <tr
                        key={u.uid}
                        className="hover:bg-slate-800/30 transition-colors group"
                      >
                        {/* User */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {u.photoURL ? (
                              <Image
                                src={u.photoURL}
                                alt={u.displayName}
                                width={32}
                                height={32}
                                unoptimized
                                referrerPolicy="no-referrer"
                                className="rounded-full ring-1 ring-slate-700"
                              />
                            ) : (
                              <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-500" />
                              </span>
                            )}
                            <div>
                              <p className="font-medium text-slate-200 text-xs">
                                {u.displayName || "—"}
                              </p>
                              <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1.5 flex-wrap">
                                <span>{u.email}</span>
                                {u.organization && (
                                  <span className="text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20 text-[10px]">
                                    {u.organization}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Registered */}
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {dateStr}
                        </td>

                        {/* Usage */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              u.usageCount > 0
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                : "bg-slate-800/60 text-slate-500 border border-slate-700/50"
                            }`}
                          >
                            {u.usageCount > 0 ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : null}
                            {u.usageCount} / 1
                          </span>
                        </td>

                        {/* Access */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              u.allowlisted
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {u.allowlisted ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <XCircle className="w-3 h-3" />
                            )}
                            {u.allowlisted ? "Allowed" : "Blocked"}
                          </span>
                        </td>

                        {/* Simulation Prompt */}
                        <td className="px-5 py-4 max-w-xs">
                          {u.simulationPrompt ? (
                            <p
                              className="text-slate-400 text-[11px] leading-relaxed line-clamp-2 max-w-[260px]"
                              title={u.simulationPrompt}
                            >
                              {u.simulationPrompt}
                            </p>
                          ) : (
                            <span className="text-slate-700 text-[11px]">
                              No simulation yet
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* Toggle allowlist */}
                            <button
                              id={`admin-toggle-allowlist-${u.uid}`}
                              onClick={() => handleToggleAllowlist(u)}
                              disabled={actionLoading === `allow-${u.uid}`}
                              title={
                                u.allowlisted
                                  ? "Remove from allowlist"
                                  : "Add to allowlist"
                              }
                              className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
                                u.allowlisted
                                  ? "bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10"
                                  : "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {actionLoading === `allow-${u.uid}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : u.allowlisted ? (
                                <ShieldX className="w-3 h-3" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              {u.allowlisted ? "Block" : "Allow"}
                            </button>

                            {/* Reset usage */}
                            <button
                              id={`admin-reset-usage-${u.uid}`}
                              onClick={() => handleResetUsage(u)}
                              disabled={
                                actionLoading === `reset-${u.uid}` ||
                                u.usageCount === 0
                              }
                              title="Reset usage count"
                              className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border bg-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              {actionLoading === `reset-${u.uid}` ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <RotateCcw className="w-3 h-3" />
                              )}
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
