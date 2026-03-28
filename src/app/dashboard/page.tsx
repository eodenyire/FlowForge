"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import type { PublicUser } from "@/lib/types";

interface CompanyInfo {
  id: string;
  name: string;
  description: string;
  industry: string;
  size: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setCompany(data.company);

      if (!data.user.companyId) {
        router.push("/company-setup");
        return;
      }
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-400 text-sm">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="text-xl font-bold text-white tracking-tight"
            >
              Flow<span className="text-indigo-400">Forge</span>
            </Link>
            <nav className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-white font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/processor-groups"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Processors
              </Link>
              <Link
                href="/connections"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Connections
              </Link>
              <Link
                href="/workflows"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Workflows
              </Link>
              <Link
                href="/data"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Data
              </Link>
              <Link
                href="/team"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Team
              </Link>
              <Link
                href="/profile"
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">
              {user?.name} ({user?.role})
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-neutral-400 text-sm">
            {company
              ? `${company.name} - Manage your data pipelines and team`
              : "Set up your company to get started"}
          </p>
        </div>

        {/* Company info */}
        {company && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Company Profile
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoField label="Name" value={company.name} />
              <InfoField label="Industry" value={company.industry || "Not set"} />
              <InfoField label="Size" value={company.size || "Not set"} />
              <InfoField
                label="Description"
                value={company.description || "Not set"}
              />
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <ActionCard
            href="/flows"
            title="Flow Editor"
            description="Create and manage visual data pipelines"
            icon="pipeline"
            color="blue"
          />
          <ActionCard
            href="/workflows"
            title="Workflow Library"
            description="Browse pre-built ETL workflow templates"
            icon="templates"
            color="indigo"
          />
          <ActionCard
            href="/team"
            title="Team Management"
            description="Invite and manage data engineers"
            icon="team"
            color="emerald"
          />
          <ActionCard
            href="/databases"
            title="Database Connections"
            description="Configure database adapters"
            icon="database"
            color="amber"
          />
          <ActionCard
            href="/data"
            title="Data Browser"
            description="Browse files, outputs, and tables"
            icon="files"
            color="purple"
          />
          <ActionCard
            href="/flows"
            title="New Flow"
            description="Start building a new data pipeline"
            icon="plus"
            color="cyan"
          />
        </div>

        {/* User info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Account Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoField label="Name" value={user?.name || ""} />
            <InfoField label="Email" value={user?.email || ""} />
            <InfoField label="Role" value={user?.role || ""} />
            <InfoField
              label="Member Since"
              value={
                user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : ""
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-sm text-neutral-200">{value || "-"}</p>
    </div>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon,
  color,
}: {
  href: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}) {
  const icons: Record<string, string> = {
    pipeline: "\u2192",
    templates: "\u26A1",
    team: "\u263A",
    database: "\u{1F5C4}",
    files: "\u{1F4C1}",
    plus: "+",
  };
  const bgHover: Record<string, string> = {
    blue: "hover:bg-blue-950/30 hover:border-blue-800/50",
    indigo: "hover:bg-indigo-950/30 hover:border-indigo-800/50",
    emerald: "hover:bg-emerald-950/30 hover:border-emerald-800/50",
    amber: "hover:bg-amber-950/30 hover:border-amber-800/50",
    purple: "hover:bg-purple-950/30 hover:border-purple-800/50",
    cyan: "hover:bg-cyan-950/30 hover:border-cyan-800/50",
  };

  return (
    <Link
      href={href}
      className={`block bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 transition-all ${bgHover[color] || ""}`}
    >
      <div className="text-2xl mb-2">{icons[icon] || "\u2192"}</div>
      <h3 className="text-sm font-semibold text-neutral-200 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500">{description}</p>
    </Link>
  );
}
