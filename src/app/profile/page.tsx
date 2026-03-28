"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  companyId: string | null;
  role: string;
  title: string;
  department: string;
  specializations: string[];
  bio: string;
  phone: string;
  location: string;
  yearsExperience: number;
  preferredLanguages: string[];
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    title: "",
    department: "",
    specializations: "",
    bio: "",
    phone: "",
    location: "",
    yearsExperience: 0,
    preferredLanguages: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem("auth_token");

  const loadProfile = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setProfile(data.profile);
      setForm({
        name: data.profile.name || "",
        title: data.profile.title || "",
        department: data.profile.department || "",
        specializations: (data.profile.specializations || []).join(", "),
        bio: data.profile.bio || "",
        phone: data.profile.phone || "",
        location: data.profile.location || "",
        yearsExperience: data.profile.yearsExperience || 0,
        preferredLanguages: (data.profile.preferredLanguages || []).join(", "),
      });
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          name: form.name,
          title: form.title,
          department: form.department,
          specializations: form.specializations
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          bio: form.bio,
          phone: form.phone,
          location: form.location,
          yearsExperience: Number(form.yearsExperience),
          preferredLanguages: form.preferredLanguages
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile(data.profile);
        setEditing(false);
        setMessage("Profile updated successfully");
      }
    } catch {
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    const token = getToken();
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
        <div className="text-neutral-400 text-sm">Loading profile...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950">
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
              <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-white transition-colors">Dashboard</Link>
              <Link href="/processor-groups" className="text-sm text-neutral-400 hover:text-white transition-colors">Processors</Link>
              <Link href="/connections" className="text-sm text-neutral-400 hover:text-white transition-colors">Connections</Link>
              <Link href="/team" className="text-sm text-neutral-400 hover:text-white transition-colors">Team</Link>
              <Link href="/profile" className="text-sm text-white font-medium">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">{profile?.name}</span>
            <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Engineer Profile
            </h1>
            <p className="text-neutral-400 text-sm">
              Manage your professional profile and specializations
            </p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className="bg-emerald-950/30 border border-emerald-800 rounded-lg px-4 py-3 mb-6">
            <p className="text-sm text-emerald-300">{message}</p>
          </div>
        )}

        {/* Profile avatar and basic info */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-950 border-2 border-indigo-800/50 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-indigo-400">
                {profile?.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
                    <InputField label="Job Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Senior Data Engineer" />
                    <InputField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Data Engineering" />
                    <InputField label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="Nairobi, Kenya" />
                    <InputField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+254 700 000 000" type="text" />
                    <InputField label="Years of Experience" value={String(form.yearsExperience)} onChange={(v) => setForm({ ...form, yearsExperience: Number(v) })} type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 resize-none" placeholder="Tell us about your experience and interests in data engineering..." />
                  </div>
                  <InputField label="Specializations (comma separated)" value={form.specializations} onChange={(v) => setForm({ ...form, specializations: v })} placeholder="ETL, Data Pipelines, Apache NiFi, SQL" />
                  <InputField label="Preferred Languages (comma separated)" value={form.preferredLanguages} onChange={(v) => setForm({ ...form, preferredLanguages: v })} placeholder="Python, SQL, Scala, Java" />
                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={saving} className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50">
                      {saving ? "Saving..." : "Save Profile"}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="px-6 py-2.5 bg-neutral-800 text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
                  <p className="text-indigo-400 text-sm font-medium mt-1">
                    {profile?.title || "Data Engineer"} {profile?.department ? `\u00B7 ${profile.department}` : ""}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-sm text-neutral-400">
                    {profile?.location && <span>{"\u{1F4CD}"} {profile.location}</span>}
                    {profile?.phone && <span>{"\u{1F4DE}"} {profile.phone}</span>}
                    <span>{"\u{1F4E7}"} {profile?.email}</span>
                  </div>
                  {profile?.bio && (
                    <p className="text-neutral-300 text-sm mt-4">{profile.bio}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details cards */}
        {!editing && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoCard
              title="Role & Access"
              items={[
                { label: "Role", value: profile?.role === "admin" ? "Administrator" : profile?.role === "engineer" ? "Data Engineer" : "Viewer" },
                { label: "Years Experience", value: String(profile?.yearsExperience || 0) },
                { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-" },
              ]}
            />
            <InfoCard
              title="Specializations"
              items={
                (profile?.specializations || []).length > 0
                  ? (profile?.specializations || []).map((s) => ({
                      label: "",
                      value: s,
                    }))
                  : [{ label: "", value: "No specializations added yet" }]
              }
              isTagList
            />
            <InfoCard
              title="Preferred Languages"
              items={
                (profile?.preferredLanguages || []).length > 0
                  ? (profile?.preferredLanguages || []).map((l) => ({
                      label: "",
                      value: l,
                    }))
                  : [{ label: "", value: "No languages added yet" }]
              }
              isTagList
            />
          </div>
        )}
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </div>
  );
}

function InfoCard({
  title,
  items,
  isTagList,
}: {
  title: string;
  items: { label: string; value: string }[];
  isTagList?: boolean;
}) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>
      {isTagList ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-indigo-950/50 border border-indigo-800/50 rounded-full text-xs text-indigo-400"
            >
              {item.value}
            </span>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">{item.label}</span>
              <span className="text-sm text-neutral-200">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
