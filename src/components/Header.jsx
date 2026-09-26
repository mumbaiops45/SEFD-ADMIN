"use client";

import { useAuth } from "@/context/AuthContext";

export default function Header({ onMenu }) {
  const { user, logout } = useAuth();
  const initial = user?.email?.[0]?.toUpperCase() || "A";

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
      <button onClick={onMenu} className="rounded-md p-2 text-navy hover:bg-zinc-100 md:invisible" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-orange">
            {initial}
          </span>
          <span className="hidden truncate text-sm text-zinc-600 sm:inline">{user?.email}</span>
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
