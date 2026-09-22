"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.8">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.8">
      <path d="M3.5 7.5 12 3l8.5 4.5-8.5 4.5-8.5-4.5Z" />
      <path d="M3.5 7.5v9L12 21l8.5-4.5v-9" />
      <path d="M12 12v9" />
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.8">
      <path d="M11.3 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6.3c0 .4.16.78.44 1.06l8.7 8.7c.6.6 1.55.6 2.15 0l6.3-6.3c.6-.6.6-1.55 0-2.15l-8.7-8.7a1.5 1.5 0 0 0-1.09-.41Z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M2.8 20c.8-3.4 3.3-5.3 6.2-5.3s5.4 1.9 6.2 5.3" />
      <path d="M16 4.3c1.6.4 2.8 1.9 2.8 3.7 0 1.8-1.2 3.3-2.8 3.7" />
      <path d="M19 14.9c1.9.5 3.3 2 3.9 4.1" />
    </svg>
  ),
};

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/products", label: "Products", icon: "products" },
  { href: "/dashboard/categories", label: "Categories", icon: "categories" },
  { href: "/dashboard/users", label: "Users", icon: "users" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-60 shrink-0 flex-col bg-navy text-white">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange text-sm font-bold text-navy">
          S
        </span>
        <span className="text-lg font-semibold tracking-tight">SFED Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map((item) => {
          const active =
            item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-orange text-navy shadow-sm" : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {ICONS[item.icon]}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-4 text-xs text-white/40">SFED Store · Admin</div>
    </aside>
  );
}
