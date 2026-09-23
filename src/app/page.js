"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const FEATURES = ["Product catalog with images", "Category management", "Admin-only access control"];

export default function LoginPage() {
  const { login, user, ready } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col overflow-hidden md:flex-row">
      {/* Left brand panel — secondary theme color */}
      <div className="relative hidden flex-1 flex-col justify-center overflow-hidden bg-navy px-12 py-10 text-white md:flex lg:px-20">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-navy-soft/60 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative">
          <div className="mb-10 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange text-lg font-bold text-navy">
              S
            </span>
            <span className="text-xl font-semibold tracking-tight">SFED Admin</span>
          </div>

          <span className="mb-6 inline-block w-fit rounded-full border border-orange/40 bg-orange/10 px-3 py-1 text-xs font-semibold tracking-wide text-orange-soft">
            STORE MANAGEMENT
          </span>

          <h1 className="max-w-lg text-4xl font-bold leading-[1.15] text-white lg:text-5xl">
            Manage your store from{" "}
            <span className="text-tertiary-soft">one beautiful place</span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
            Everything your team needs to run the storefront — products, categories and
            users — in a single fast admin panel.
          </p>

          <ul className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-white/80">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange/20 text-orange-soft">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.4 7.4a1 1 0 0 1-1.4 0L3.3 9.5a1 1 0 1 1 1.4-1.4l3.9 3.9 6.7-6.7a1 1 0 0 1 1.4 0Z" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right sign-in panel */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-white px-6 py-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-3 md:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange text-base font-bold text-navy">
              S
            </span>
            <span className="text-lg font-semibold tracking-tight text-navy">SFED Admin</span>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl shadow-zinc-200/50"
          >
            <h2 className="mb-1 text-2xl font-bold text-tertiary">Welcome back</h2>
            <p className="mb-7 text-sm text-zinc-500">Sign in with your admin account to continue</p>

            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Email</label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sfed.com"
              className="mb-4 w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/20"
            />

            <label className="mb-1.5 block text-sm font-medium text-zinc-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mb-5 w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-orange focus:ring-2 focus:ring-orange/20"
            />

            {error && (
              <p className="mb-4 rounded-lg border border-tertiary/30 bg-tertiary/10 px-3.5 py-2.5 text-sm text-tertiary-deep">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange px-4 py-2.5 text-sm font-semibold text-navy shadow-sm transition-colors hover:bg-orange-deep hover:text-white disabled:opacity-50"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <p className="mt-5 text-center text-xs text-zinc-400">Admin access only.</p>
          </form>
        </div>
      </div>
    </div>
  );
}
