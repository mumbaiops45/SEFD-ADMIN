"use client";

import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() || "A";

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-semibold text-orange">
            {initial}
          </span>
          <span className="text-sm text-zinc-600">{user?.email}</span>
        </div>
        <button
          onClick={logout}
          className="rounded-lg bg-orange px-3.5 py-1.5 text-sm font-medium text-navy transition-colors hover:bg-orange-deep hover:text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
