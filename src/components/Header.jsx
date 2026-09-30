"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Header({ onMenu }) {
  const { user, logout, profile } = useAuth();
  const displayName = profile?.name || user?.email || "Admin";
  const initial = displayName[0]?.toUpperCase() || "A";

  return (
    <header className="flex h-20 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
      <button onClick={onMenu} className="rounded-md p-2 text-navy hover:bg-zinc-100 md:invisible" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <Link href="/dashboard/profile" className="flex min-w-0 items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-zinc-100">
          {profile?.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.image} alt={displayName} className="h-9 w-9 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-xs font-semibold text-orange">
              {initial}
            </span>
          )}
          <span className="hidden min-w-0 leading-tight sm:block">
            <span className="block truncate text-sm font-semibold text-navy">{displayName}</span>
            {profile?.name && user?.email && (
              <span className="block truncate text-xs text-zinc-500">{user.email}</span>
            )}
          </span>
        </Link>
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
