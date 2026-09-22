"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-2 text-xl font-semibold text-tertiary">
        Welcome{user?.email ? `, ${user.email}` : ""}
      </h1>
      <p className="text-sm text-zinc-500">
        Use the tabs on the left to manage products (with their images), categories and users.
      </p>
    </div>
  );
}
