"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  Download,
  ExternalLink,
  Code,
  Clock,
  Building2,
  Sparkles,
  Eye,
  X,
  Activity,
  Cpu,
  Check,
  Copy,
  Server,
  Filter,
  FileText,
  Layers,
  BarChart3,
  Globe2,
  ArrowRight,
  Terminal,
  Zap,
} from "lucide-react";

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

type AdminTab = "overview" | "users" | "telemetry" | "analytics";
type SortKey = "createdAt" | "usageCount" | "email" | "organization" | "allowlisted";
type SortDir = "asc" | "desc";
type FilterTab = "all" | "simulated" | "pending" | "allowlisted" | "blocked";

interface BackendStatus {
  online: boolean;
  checking: boolean;
  latency: number | null;
  version: string | null;
  pipeline: string[];
}

interface SimulationResultDetails {
  code?: string;
  report?: string;
  statistical_summary?: string;
  validation_report?: string;
  language?: string;
  simulation_spec?: string;
  hypothesis_analysis?: string;
  output?: string;
  error?: string | null;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();

  // Navigation state
  const [activeSection, setActiveSection] = useState<AdminTab>("overview");

  // Data states
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [activeUserFilter, setActiveUserFilter] = useState<FilterTab>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Backend Health State
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    online: false,
    checking: true,
    latency: null,
    version: null,
    pipeline: [],
  });

  const isAdmin =
    !!user && ADMIN_EMAILS.includes((user.email ?? "").toLowerCase());

  // Redirect non-admins
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [authLoading, user, isAdmin, router]);

  const checkBackendHealth = useCallback(async () => {
    setBackendStatus((prev) => ({ ...prev, checking: true }));
    const t0 = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/`, {
        method: "GET",
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        const data = await res.json();
        const latency = Math.round(performance.now() - t0);
        setBackendStatus({
          online: true,
          checking: false,
          latency,
          version: data.message || "v2.2 Universal Engine",
          pipeline: Array.isArray(data.pipeline) ? data.pipeline : [],
        });
      } else {
        setBackendStatus({
          online: false,
          checking: false,
          latency: null,
          version: null,
          pipeline: [],
        });
      }
    } catch {
      setBackendStatus({
        online: false,
        checking: false,
        latency: null,
        version: null,
        pipeline: [],
      });
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setFetching(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
      setLastUpdated(new Date());
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      checkBackendHealth();
    }
  }, [isAdmin, fetchUsers, checkBackendHealth]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleToggleAllowlist = async (u: UserRecord) => {
    setActionLoading(`allow-${u.uid}`);
    try {
      await setAllowlistStatus(u.uid, u.email, !u.allowlisted);
      const updated = { ...u, allowlisted: !u.allowlisted };
      setUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? updated : x))
      );
      if (selectedUser?.uid === u.uid) {
        setSelectedUser(updated);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetUsage = async (u: UserRecord) => {
    setActionLoading(`reset-${u.uid}`);
    try {
      await resetUsage(u.uid);
      const updated = {
        ...u,
        usageCount: 0,
        simulationPrompt: null,
        simulationResult: null,
      };
      setUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? updated : x))
      );
      if (selectedUser?.uid === u.uid) {
        setSelectedUser(updated);
      }
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

  // Demographics metrics
  const demographics = useMemo(() => {
    const orgMap: Record<string, number> = {};
    const domainMap: Record<string, number> = {};
    let totalSimulations = 0;

    users.forEach((u) => {
      totalSimulations += u.usageCount || 0;

      const org = (u.organization || "Independent / Academic").trim();
      orgMap[org] = (orgMap[org] || 0) + 1;

      const emailParts = u.email.split("@");
      const domain = emailParts[1] ? `@${emailParts[1]}` : "@other";
      domainMap[domain] = (domainMap[domain] || 0) + 1;
    });

    const topOrgs = Object.entries(orgMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const topDomains = Object.entries(domainMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return { topOrgs, topDomains, totalSimulations };
  }, [users]);

  // General KPIs
  const stats = useMemo(() => {
    const total = users.length;
    const simulated = users.filter((u) => (u.usageCount || 0) > 0).length;
    const pending = total - simulated;
    const allowlisted = users.filter((u) => u.allowlisted).length;
    const blocked = users.filter((u) => !u.allowlisted).length;
    const adoptionRate = total > 0 ? Math.round((simulated / total) * 100) : 0;

    return {
      total,
      simulated,
      pending,
      allowlisted,
      blocked,
      adoptionRate,
      totalSimulations: demographics.totalSimulations,
    };
  }, [users, demographics.totalSimulations]);

  // Filtered and Sorted Users
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return users
      .filter((u) => {
        // Tab Filter
        if (activeUserFilter === "simulated" && (u.usageCount || 0) === 0) return false;
        if (activeUserFilter === "pending" && (u.usageCount || 0) > 0) return false;
        if (activeUserFilter === "allowlisted" && !u.allowlisted) return false;
        if (activeUserFilter === "blocked" && u.allowlisted) return false;

        // Search Filter
        if (!q) return true;
        const emailMatch = (u.email || "").toLowerCase().includes(q);
        const nameMatch = (u.displayName || "").toLowerCase().includes(q);
        const orgMatch = (u.organization || "").toLowerCase().includes(q);
        const promptMatch = (u.simulationPrompt || "").toLowerCase().includes(q);
        const uidMatch = (u.uid || "").toLowerCase().includes(q);

        return emailMatch || nameMatch || orgMatch || promptMatch || uidMatch;
      })
      .sort((a, b) => {
        let valA: unknown = a[sortKey];
        let valB: unknown = b[sortKey];

        if (sortKey === "createdAt") {
          valA = (a.createdAt as { seconds?: number })?.seconds ?? 0;
          valB = (b.createdAt as { seconds?: number })?.seconds ?? 0;
        }

        if (typeof valA === "string" && typeof valB === "string") {
          return sortDir === "asc"
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }

        const nA = (valA as number) ?? 0;
        const nB = (valB as number) ?? 0;
        return sortDir === "asc" ? nA - nB : nB - nA;
      });
  }, [users, search, activeUserFilter, sortKey, sortDir]);

  // Recent Simulation Prompts feed
  const recentSimulations = useMemo(() => {
    return users
      .filter((u) => u.simulationPrompt)
      .slice(0, 6);
  }, [users]);

  // Export Users to CSV
  const exportToCSV = () => {
    const headers = [
      "UID",
      "Display Name",
      "Email",
      "Organization",
      "Registered Date",
      "Usage Count",
      "Access Status",
      "Simulation Prompt",
    ];

    const rows = users.map((u) => {
      const seconds = (u.createdAt as { seconds?: number })?.seconds;
      const dateStr = seconds ? new Date(seconds * 1000).toISOString() : "";
      return [
        `"${u.uid || ""}"`,
        `"${(u.displayName || "").replace(/"/g, '""')}"`,
        `"${u.email || ""}"`,
        `"${(u.organization || "").replace(/"/g, '""')}"`,
        `"${dateStr}"`,
        u.usageCount || 0,
        u.allowlisted ? "Allowed" : "Blocked",
        `"${(u.simulationPrompt || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `ai_simulation_laboratory_users_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTimestamp = (ts: unknown): string => {
    if (!ts) return "—";
    if (typeof ts === "object" && ts !== null && "seconds" in ts) {
      return new Date((ts as { seconds: number }).seconds * 1000).toLocaleString(
        undefined,
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }
    return "—";
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/3 w-[700px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-1/4 w-[600px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* =========================================================================
          LEFT SIDEBAR TAB PANEL
      ========================================================================= */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-slate-900/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col justify-between p-4 md:p-6 z-20 md:sticky md:top-0 md:h-screen">
        {/* Brand & Status */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-inner shadow-indigo-500/20">
              <Cpu className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">
                AI Simulation Lab
              </h1>
              <span className="inline-block text-[10px] text-indigo-400 font-semibold uppercase tracking-wider mt-1">
                Control Room
              </span>
            </div>
          </div>

          {/* Engine Status Card in Sidebar */}
          <div
            onClick={checkBackendHealth}
            className="cursor-pointer bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 transition-all"
            title="Click to re-ping simulation server"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    backendStatus.checking
                      ? "bg-amber-400 animate-pulse"
                      : backendStatus.online
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "bg-rose-500"
                  }`}
                />
                <span className="text-xs font-medium text-slate-300">
                  {backendStatus.checking
                    ? "Connecting…"
                    : backendStatus.online
                    ? "Engine Online"
                    : "Engine Offline"}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {backendStatus.latency !== null ? `${backendStatus.latency}ms` : "—"}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 font-mono truncate">
              {API_BASE_URL.replace(/https?:\/\//, "")}
            </p>
          </div>

          {/* Navigation Tabs Menu */}
          <nav className="space-y-1.5 pt-2">
            {[
              {
                id: "overview" as AdminTab,
                label: "Overview",
                icon: BarChart3,
                badge: null,
              },
              {
                id: "users" as AdminTab,
                label: "Users & Quotas",
                icon: Users,
                badge: stats.total,
              },
              {
                id: "telemetry" as AdminTab,
                label: "Agent Pipeline Health",
                icon: Activity,
                badge: "8 Nodes",
              },
              {
                id: "analytics" as AdminTab,
                label: "Affiliations & Trends",
                icon: Building2,
                badge: `${demographics.topOrgs.length}`,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-400 border border-slate-700/50"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Admin Profile & Lab Link */}
        <div className="space-y-3 pt-6 border-t border-slate-800/80 mt-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.displayName || "System Admin"}
              </p>
              <p className="text-[10px] text-slate-500 font-mono truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link
              href="/"
              className="flex items-center justify-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-lg py-2 transition-colors font-medium"
            >
              <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
              Lab
            </Link>

            <button
              onClick={signOut}
              className="flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 bg-slate-800/60 border border-slate-800 hover:border-rose-900/40 rounded-lg py-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          RIGHT MAIN CONTENT AREA
      ========================================================================= */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 z-10 overflow-y-auto">
        {/* Top Header Row in Main Panel */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono uppercase">Control Room</span>
              <span className="text-slate-700">/</span>
              <h2 className="text-lg font-bold text-white tracking-tight capitalize">
                {activeSection === "overview" && "Executive Dashboard & Telemetry"}
                {activeSection === "users" && "Researcher Directory & Quota Management"}
                {activeSection === "telemetry" && "LangGraph Multi-Agent Architecture"}
                {activeSection === "analytics" && "Demographics & Research Trends"}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {activeSection === "overview" && "High-level platform activity, conversion rates, and simulation feeds"}
              {activeSection === "users" && "Manage allowlisted accounts, reset simulation quotas, and inspect prompts"}
              {activeSection === "telemetry" && "Real-time health verification of the 8 LangGraph simulation nodes"}
              {activeSection === "analytics" && "Organizational distribution, institutional domains, and adoption metrics"}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Sync Timestamp */}
            {lastUpdated && (
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline-block">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {/* Refresh Button */}
            <button
              onClick={() => {
                fetchUsers();
                checkBackendHealth();
              }}
              disabled={fetching}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-slate-400 ${
                  fetching ? "animate-spin text-indigo-400" : ""
                }`}
              />
              Refresh
            </button>

            {/* Export CSV Button */}
            <button
              onClick={exportToCSV}
              disabled={users.length === 0}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* =======================================================================
            TAB 1: OVERVIEW & KPIS
        ======================================================================= */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {/* 5 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Total Users</p>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-3 tabular-nums tracking-tight">
                  {stats.total}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Platform accounts</p>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Simulations Run</p>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-3 tabular-nums tracking-tight">
                  {stats.simulated}
                </p>
                <div className="flex items-center gap-1.5 mt-1 text-[11px]">
                  <span className="text-purple-400 font-medium">{stats.adoptionRate}% rate</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">{stats.totalSimulations} runs</span>
                </div>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Pending Run</p>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-white mt-3 tabular-nums tracking-tight">
                  {stats.pending}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Researchers with 0 runs</p>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Allowlisted</p>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-400 mt-3 tabular-nums tracking-tight">
                  {stats.allowlisted}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Active lab access</p>
              </div>

              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-400">Blocked Access</p>
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <ShieldX className="w-4 h-4 text-rose-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-rose-400 mt-3 tabular-nums tracking-tight">
                  {stats.blocked}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">Restricted accounts</p>
              </div>
            </div>

            {/* Quick Action Navigation Banners */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => setActiveSection("users")}
                className="cursor-pointer bg-slate-900/70 border border-slate-800/80 hover:border-indigo-500/40 rounded-2xl p-5 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                      Manage Researchers & Quotas
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      View {users.length} accounts, reset quotas, and inspect prompts
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
              </div>

              <div
                onClick={() => setActiveSection("telemetry")}
                className="cursor-pointer bg-slate-900/70 border border-slate-800/80 hover:border-purple-500/40 rounded-2xl p-5 transition-all group flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                      Multi-Agent Pipeline Health
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      8 LangGraph nodes active with {backendStatus.latency || "—"}ms latency
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Recent Simulation Experiments Feed */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-semibold text-white">
                    Recent Scientific Experiment Queries
                  </h3>
                </div>
                <button
                  onClick={() => setActiveSection("users")}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  View all in ledger <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {recentSimulations.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs italic">
                  No simulations executed across the laboratory yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {recentSimulations.map((u) => (
                    <div
                      key={u.uid}
                      onClick={() => setSelectedUser(u)}
                      className="cursor-pointer bg-slate-950/70 border border-slate-800/80 hover:border-indigo-500/40 rounded-xl p-4 transition-all hover:shadow-md hover:shadow-indigo-500/5 group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-2">
                          <span className="font-medium text-slate-300 truncate max-w-[140px]">
                            {u.displayName || u.email.split("@")[0]}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            Run
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed italic group-hover:text-slate-200 transition-colors">
                          &ldquo;{u.simulationPrompt}&rdquo;
                        </p>
                      </div>
                      <div className="mt-4 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                        <span>{formatTimestamp(u.createdAt)}</span>
                        <span className="text-indigo-400 flex items-center gap-1">
                          Inspect <Eye className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 2: RESEARCHERS & QUOTAS LEDGER
        ======================================================================= */}
        {activeSection === "users" && (
          <div className="bg-slate-900/80 backdrop-blur border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* Table Controls */}
            <div className="p-4 sm:p-6 border-b border-slate-800/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Researcher Ledger & Quota Operations
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Search researchers, monitor quota limits, and inspect simulation execution artifacts
                  </p>
                </div>

                {/* Omni Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    id="admin-search-input"
                    type="text"
                    placeholder="Search name, email, org, prompt, UID…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-80 transition-all shadow-inner"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                {[
                  { key: "all", label: "All Users", count: stats.total },
                  { key: "simulated", label: "Simulations Run", count: stats.simulated },
                  { key: "pending", label: "Pending Run", count: stats.pending },
                  { key: "allowlisted", label: "Allowlisted", count: stats.allowlisted },
                  { key: "blocked", label: "Blocked", count: stats.blocked },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setActiveUserFilter(key as FilterTab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                      activeUserFilter === key
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                        : "bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/60"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        activeUserFilter === key
                          ? "bg-white/20 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800/70 bg-slate-950/40">
                    {[
                      { label: "Researcher", key: "email" as SortKey },
                      { label: "Organization", key: "organization" as SortKey },
                      { label: "Registered", key: "createdAt" as SortKey },
                      { label: "Quota / Usage", key: "usageCount" as SortKey },
                      { label: "Access Status", key: "allowlisted" as SortKey },
                      { label: "Simulation Prompt", key: null },
                      { label: "Actions", key: null },
                    ].map(({ label, key }) => (
                      <th
                        key={label}
                        onClick={() => key && handleSort(key)}
                        className={`text-left px-5 py-3.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap ${
                          key ? "cursor-pointer hover:text-slate-200 select-none" : ""
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
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
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mx-auto" />
                        <p className="text-xs text-slate-500 mt-2">Loading user database…</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-16 text-center text-slate-500 text-sm"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Filter className="w-5 h-5 text-slate-600" />
                          <p>No researchers matched the search criteria.</p>
                        </div>
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
                          {/* Researcher */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <Image
                                  src={u.photoURL}
                                  alt={u.displayName || u.email}
                                  width={32}
                                  height={32}
                                  unoptimized
                                  referrerPolicy="no-referrer"
                                  className="rounded-full ring-1 ring-slate-700"
                                />
                              ) : (
                                <span className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                                  <User className="w-4 h-4 text-slate-400" />
                                </span>
                              )}
                              <div>
                                <p className="font-medium text-slate-200 text-xs">
                                  {u.displayName || "Anonymous User"}
                                </p>
                                <p className="text-slate-400 text-[11px] font-mono mt-0.5">
                                  {u.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Organization */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            {u.organization ? (
                              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                                <Building2 className="w-3 h-3 text-indigo-400" />
                                {u.organization}
                              </span>
                            ) : (
                              <span className="text-slate-600 text-[11px]">Academic / General</span>
                            )}
                          </td>

                          {/* Registered */}
                          <td className="px-5 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                            {dateStr}
                          </td>

                          {/* Quota / Usage */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                                (u.usageCount || 0) > 0
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-slate-800/80 text-slate-400 border border-slate-700/60"
                              }`}
                            >
                              {(u.usageCount || 0) > 0 ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3 text-slate-500" />
                              )}
                              {u.usageCount || 0} / 1
                            </span>
                          </td>

                          {/* Access Status */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
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
                              <div className="flex items-center gap-2">
                                <p
                                  className="text-slate-300 text-[11px] leading-relaxed line-clamp-2 max-w-[220px]"
                                  title={u.simulationPrompt}
                                >
                                  {u.simulationPrompt}
                                </p>
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  title="Inspect full prompt and results"
                                  className="text-indigo-400 hover:text-indigo-300 shrink-0 p-1 hover:bg-slate-800 rounded transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-[11px] italic">
                                No simulation run yet
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {/* Inspect */}
                              <button
                                onClick={() => setSelectedUser(u)}
                                title="Inspect user and simulation details"
                                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-300 hover:text-white transition-all"
                              >
                                <Eye className="w-3 h-3 text-indigo-400" />
                                Inspect
                              </button>

                              {/* Toggle allowlist */}
                              <button
                                id={`admin-toggle-allowlist-${u.uid}`}
                                onClick={() => handleToggleAllowlist(u)}
                                disabled={actionLoading === `allow-${u.uid}`}
                                title={
                                  u.allowlisted
                                    ? "Restrict access for this user"
                                    : "Grant access to this user"
                                }
                                className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border transition-all disabled:opacity-50 ${
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
                                  (u.usageCount || 0) === 0
                                }
                                title="Reset simulation quota to allow another run"
                                className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border bg-indigo-500/5 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing {filtered.length} of {users.length} total researchers
              </span>
              <span className="font-mono text-[11px]">
                Quota Limit: 1 simulation per registered researcher
              </span>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 3: AGENT PIPELINE & ENGINE TELEMETRY
        ======================================================================= */}
        {activeSection === "telemetry" && (
          <div className="space-y-6">
            {/* Live Engine Diagnostic Card */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Server className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      FastAPI Simulation Worker Health
                    </h3>
                    <p className="text-xs text-slate-400">
                      {backendStatus.online ? backendStatus.version : "Unreachable or connection refused"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={checkBackendHealth}
                    className="flex items-center gap-1.5 text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${backendStatus.checking ? "animate-spin" : ""}`} />
                    Ping Server
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Connection State
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        backendStatus.online ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white">
                      {backendStatus.online ? "Connected & Healthy" : "Offline"}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Roundtrip Latency
                  </span>
                  <span className="text-sm font-semibold text-emerald-400 font-mono mt-1 block">
                    {backendStatus.latency !== null ? `${backendStatus.latency} ms` : "Timeout"}
                  </span>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                    Base Endpoint URL
                  </span>
                  <span className="text-xs font-mono text-slate-300 mt-1 block truncate">
                    {API_BASE_URL}
                  </span>
                </div>
              </div>
            </div>

            {/* 8-Node Multi-Agent Architecture */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    LangGraph 8-Node Autonomous Pipeline
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orchestrated state graph execution nodes active in backend
                  </p>
                </div>
                <span className="text-xs text-emerald-400 font-mono font-medium px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  8/8 Nodes Ready
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                {[
                  {
                    num: "01",
                    name: "scenario_parser",
                    title: "Mathematical Spec Parser",
                    desc: "Translates natural language scenario into system variables, distributions, constraints and bounds.",
                  },
                  {
                    num: "02",
                    name: "hypothesis_updater",
                    title: "Bayesian Prior Tracker",
                    desc: "Formulates prior probability belief table P(Hi) and computes posterior updates P(Hi|D).",
                  },
                  {
                    num: "03",
                    name: "planner",
                    title: "Simulation Architect",
                    desc: "Designs causal branches and selects optimal simulation paradigm (discrete-event, agent, ODE).",
                  },
                  {
                    num: "04",
                    name: "critic",
                    title: "Methodology Auditor",
                    desc: "Pre-execution critic checking seed isolation, metric separation, and stochastic validity.",
                  },
                  {
                    num: "05",
                    name: "executor",
                    title: "Sandboxed Subprocess",
                    desc: "Runs dynamic Python code inside isolated environment with strict execution timeouts.",
                  },
                  {
                    num: "06",
                    name: "validator",
                    title: "10-Point Consistency Check",
                    desc: "Pure-Python mathematical sanity verification ensuring zero division, non-negative variance.",
                  },
                  {
                    num: "07",
                    name: "stats",
                    title: "Confidence Intervals & Risk",
                    desc: "Computes 95% confidence intervals, empirical distributions, and constraint breach rates.",
                  },
                  {
                    num: "08",
                    name: "analyst",
                    title: "20-Section Scientific Paper",
                    desc: "Synthesizes publication-grade research report with LaTeX math and actionable findings.",
                  },
                ].map((node) => (
                  <div
                    key={node.name}
                    className="bg-slate-950/60 border border-slate-800/80 hover:border-indigo-500/30 rounded-xl p-4 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-bold text-indigo-400">
                          {node.num}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                      </div>
                      <p className="text-xs font-mono font-semibold text-slate-200 mt-2">
                        {node.name}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {node.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        {node.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Engine Simulation Paradigms */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Active Simulation Modeling Capabilities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/70">
                  <span className="font-semibold text-indigo-300 block">Discrete-Event Simulation</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Process-based queues and resource contention modeled via SimPy & event scheduling.
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/70">
                  <span className="font-semibold text-purple-300 block">Monte Carlo Trials</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    High-throughput vectorized stochastic sampling with NumPy default_rng isolation.
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/70">
                  <span className="font-semibold text-emerald-300 block">Differential Systems</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Continuous dynamics solved with SciPy numerical integration and ODE solvers.
                  </p>
                </div>
                <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/70">
                  <span className="font-semibold text-cyan-300 block">Network & Graph Topology</span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Complex network cascades, graph routing, and percolation analysis via NetworkX.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================================
            TAB 4: DEMOGRAPHICS & ANALYTICS
        ======================================================================= */}
        {activeSection === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organizations Breakdown */}
              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Researcher Organizations & Institutions
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Affiliation breakdown across registered accounts
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {demographics.topOrgs.length === 0 ? (
                    <p className="text-xs text-slate-500 py-6 text-center">No organizations recorded yet</p>
                  ) : (
                    demographics.topOrgs.map(([org, count]) => {
                      const pct = Math.round((count / (users.length || 1)) * 100);
                      return (
                        <div key={org} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-medium truncate max-w-[280px]" title={org}>
                              {org}
                            </span>
                            <span className="text-slate-400 text-[11px] tabular-nums font-mono">
                              {count} researchers ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.max(pct, 4)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Email Domains Distribution */}
              <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Globe2 className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Primary Email Domains
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Distribution of institutional and public mail domains
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {demographics.topDomains.map(([dom, count]) => {
                    const pct = Math.round((count / (users.length || 1)) * 100);
                    return (
                      <div key={dom} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-mono">{dom}</span>
                          <span className="text-slate-400 text-[11px] tabular-nums font-mono">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(pct, 4)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Platform Utilization Summary */}
            <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
              <h3 className="text-sm font-semibold text-white mb-3">
                Laboratory Quota Conversion Funnel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-2xl font-bold text-white tabular-nums">{stats.total}</span>
                  <span className="text-xs text-slate-400 block mt-1">Total Registered</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-2xl font-bold text-indigo-400 tabular-nums">{stats.simulated}</span>
                  <span className="text-xs text-slate-400 block mt-1">Executed Simulations ({stats.adoptionRate}%)</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-2xl font-bold text-emerald-400 tabular-nums">{stats.allowlisted}</span>
                  <span className="text-xs text-slate-400 block mt-1">Allowlisted Accounts</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          DETAILED USER & SIMULATION INSPECTION MODAL (GLOBAL ACROSS ALL TABS)
      ========================================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">
                      {selectedUser.displayName || "Anonymous Researcher"}
                    </h3>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        selectedUser.allowlisted
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {selectedUser.allowlisted ? "Allowed" : "Blocked"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {selectedUser.email}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 font-mono">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans">
                    Organization
                  </span>
                  <span className="text-slate-200 mt-1 block">
                    {selectedUser.organization || "Independent"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans">
                    Usage Quota
                  </span>
                  <span className="text-slate-200 mt-1 block">
                    {selectedUser.usageCount || 0} / 1 Runs
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans">
                    Registered At
                  </span>
                  <span className="text-slate-200 mt-1 block text-[11px]">
                    {formatTimestamp(selectedUser.createdAt)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-500 block font-sans">
                    User UID
                  </span>
                  <button
                    onClick={() => copyToClipboard(selectedUser.uid, "uid")}
                    className="text-indigo-400 hover:underline mt-1 flex items-center gap-1 truncate max-w-[120px]"
                    title="Click to copy UID"
                  >
                    <span className="truncate">{selectedUser.uid}</span>
                    {copiedText === "uid" ? (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* Simulation Scenario Prompt */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                    Simulation Prompt Submitted
                  </span>
                  {selectedUser.simulationPrompt && (
                    <button
                      onClick={() =>
                        copyToClipboard(selectedUser.simulationPrompt || "", "prompt")
                      }
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedText === "prompt" ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy Prompt
                    </button>
                  )}
                </div>

                {selectedUser.simulationPrompt ? (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {selectedUser.simulationPrompt}
                  </div>
                ) : (
                  <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-500 italic">
                    This researcher has not run any simulations yet.
                  </div>
                )}
              </div>

              {/* Simulation Result Artifacts (If available in Firestore) */}
              {Boolean(selectedUser.simulationResult) && (
                <div className="space-y-4 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      Simulation Execution Artifacts
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                      Recorded Run
                    </span>
                  </div>

                  {(() => {
                    const res = selectedUser.simulationResult as SimulationResultDetails;
                    return (
                      <div className="space-y-3">
                        {res.language && (
                          <div className="text-[11px] text-slate-400">
                            Language detected:{" "}
                            <span className="text-indigo-300 font-medium">{res.language}</span>
                          </div>
                        )}

                        {res.code && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 mb-1">
                              Generated Python Engine Code:
                            </p>
                            <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono overflow-x-auto text-emerald-300/90 max-h-48 leading-tight">
                              {res.code}
                            </pre>
                          </div>
                        )}

                        {res.validation_report && (
                          <div>
                            <p className="text-[11px] font-semibold text-slate-400 mb-1">
                              Validation Audit:
                            </p>
                            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-32 overflow-y-auto">
                              {res.validation_report}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAllowlist(selectedUser)}
                  disabled={actionLoading === `allow-${selectedUser.uid}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                    selectedUser.allowlisted
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                  }`}
                >
                  {selectedUser.allowlisted ? (
                    <ShieldX className="w-3.5 h-3.5" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  {selectedUser.allowlisted ? "Block Researcher" : "Grant Allowlist"}
                </button>

                <button
                  onClick={() => handleResetUsage(selectedUser)}
                  disabled={
                    actionLoading === `reset-${selectedUser.uid}` ||
                    (selectedUser.usageCount || 0) === 0
                  }
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center gap-1.5 disabled:opacity-40"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Simulation Quota
                </button>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
