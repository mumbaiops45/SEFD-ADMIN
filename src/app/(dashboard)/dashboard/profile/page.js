"use client";

import { useEffect, useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { refreshProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/user/profile");
      const u = res?.data?.user;
      setProfile(u);
      setName(u?.name || "");
      setPhone(u?.phone || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : profile?.image || ""), [file, profile]);
  useEffect(() => () => file && URL.revokeObjectURL(preview), [file, preview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("phone", phone);
      if (file) fd.append("image", file);
      const res = await api.put("/user", fd);
      setSuccess(res?.message || "Profile updated");
      setFile(null);
      load();
      refreshProfile();
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading && !profile) return <p className="text-sm text-zinc-500">Loading…</p>;

  const initial = (profile?.name || profile?.email || "A")[0].toUpperCase();

  const labelCls = "mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-500";
  const fieldCls =
    "w-full rounded-lg border border-zinc-200 bg-orange/5 px-5 py-4 text-base text-navy outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/20";

  return (
    <div className="max-w-5xl">
      <h1 className="mb-4 text-xl font-semibold text-tertiary">My Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 sm:p-9">
        <div className="flex items-center gap-6">
          <label className="relative shrink-0 cursor-pointer" title="Change photo">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="profile"
                className="h-32 w-32 rounded-full border border-orange/20 object-cover"
              />
            ) : (
              <span className="flex h-32 w-32 items-center justify-center rounded-full bg-navy text-4xl font-semibold text-orange">
                {initial}
              </span>
            )}
            <span className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-navy text-white">
              <Camera className="h-4.5 w-4.5" />
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          <div>
            <p className="text-lg font-bold text-navy">Profile photo</p>
            <p className="mt-1 text-sm text-zinc-500">JPG or PNG. Click the photo to change it.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              value={profile?.email || ""}
              disabled
              className={`${fieldCls} cursor-not-allowed bg-orange/10 text-zinc-500`}
            />
          </div>
          <div>
            <label className={labelCls}>Role</label>
            <input
              value={profile?.role ? profile.role[0].toUpperCase() + profile.role.slice(1) : ""}
              disabled
              className={`${fieldCls} cursor-not-allowed bg-orange/10 text-zinc-500`}
            />
          </div>
        </div>

        {error && <p className="rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>}
        {success && <p className="rounded-md bg-green-100 px-3 py-2 text-sm text-green-800">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-gradient-to-b from-orange to-orange-deep px-10 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-sm hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
