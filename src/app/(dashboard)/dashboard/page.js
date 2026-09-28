"use client";

import { useEffect, useState, useCallback } from "react";
import { IndianRupee, ShoppingBag, Users, UserPlus, AlertTriangle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatMoney } from "@/lib/orders";

function StatTile({ icon: Icon, label, value, hint }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase text-zinc-500">
        <Icon className="h-4 w-4 text-orange-deep" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-navy">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-navy">{title}</h2>
      {subtitle && <p className="mb-3 text-xs text-zinc-500">{subtitle}</p>}
      {children}
    </section>
  );
}

const Empty = ({ text }) => <p className="py-6 text-center text-sm text-zinc-500">{text}</p>;

// Single-series horizontal bar chart: one hue, value labels in text ink, hover tooltip
function TopProductsChart({ rows }) {
  const [hover, setHover] = useState(null);
  if (!rows.length) return <Empty text="No paid orders yet." />;
  const max = Math.max(...rows.map((r) => r.quantity), 1);

  return (
    <ul className="space-y-2.5">
      {rows.map((p, i) => (
        <li
          key={p._id}
          className="relative"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(null)}
        >
          <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-medium text-navy">{p.name}</span>
            <span className="shrink-0 font-semibold text-zinc-700">{p.quantity} sold</span>
          </div>
          <div className="h-2.5 w-full rounded bg-zinc-100">
            <div
              className={`h-2.5 rounded-r bg-navy transition-opacity ${
                hover !== null && hover !== i ? "opacity-40" : ""
              }`}
              style={{ width: `${(p.quantity / max) * 100}%` }}
            />
          </div>
          {hover === i && (
            <div className="pointer-events-none absolute right-0 top-full z-10 mt-1 rounded-md bg-navy px-2.5 py-1.5 text-xs text-white shadow-lg">
              <div className="font-semibold">{p.name}</div>
              <div className="text-white/70">SKU: {p.sku}</div>
              <div>Units sold: {p.quantity}</div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/dashboard");
      setData(res?.data || null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const d = data || {};
  const topProducts = d.topSellingProducts || [];
  const topCustomers = d.topCustomers || [];
  const lowStock = d.lowStockProducts || [];
  const aov = d.totalOrders ? d.revenue / d.totalOrders : 0;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-tertiary">Dashboard</h1>
          <p className="text-sm text-zinc-500">
            Welcome{user?.email ? `, ${user.email}` : ""}. Figures count paid orders only.
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      {loading && !data ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              icon={IndianRupee}
              label="Revenue"
              value={formatMoney(d.revenue)}
              hint={`Avg. order ${formatMoney(Math.round(aov))}`}
            />
            <StatTile icon={ShoppingBag} label="Paid Orders" value={d.totalOrders ?? 0} />
            <StatTile icon={Users} label="Total Customers" value={d.totalUsers ?? 0} />
            <StatTile icon={UserPlus} label="New Customers Today" value={d.newUsersToday ?? 0} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Panel title="Top Selling Products" subtitle="Units sold in paid orders (top 10)">
              <TopProductsChart rows={topProducts} />
            </Panel>

            <Panel title="Low Stock" subtitle="Active products with 10 or fewer in stock">
              {!lowStock.length ? (
                <Empty text="All products are well stocked." />
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {lowStock.map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-navy">{p.name}</div>
                        <div className="font-mono text-xs text-zinc-500">{p.sku}</div>
                      </div>
                      <span
                        className={`flex shrink-0 items-center gap-1 rounded px-2 py-0.5 text-xs font-bold ${
                          p.stock === 0 ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>

          <Panel title="Top Customers" subtitle="By total spent on paid orders (top 10)">
            {!topCustomers.length ? (
              <Empty text="No paying customers yet." />
            ) : (
              <div className="card-table-wrap overflow-x-auto rounded-lg border border-zinc-200">
                <table className="card-table w-full text-left text-sm">
                  <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">User ID</th>
                      <th className="px-4 py-3 text-right font-medium">Orders</th>
                      <th className="px-4 py-3 text-right font-medium">Total Spent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {topCustomers.map((c, i) => (
                      <tr key={c._id} className="hover:bg-zinc-50">
                        <td data-label="#" className="px-4 py-3 text-zinc-500">{i + 1}</td>
                        <td data-label="Name" className="px-4 py-3 font-medium text-navy">{c.name || "—"}</td>
                        <td data-label="Email" className="px-4 py-3 text-zinc-700">{c.email || "—"}</td>
                        <td data-label="User ID" className="px-4 py-3 font-mono text-xs text-zinc-600">{c._id}</td>
                        <td data-label="Orders" className="px-4 py-3 text-right text-zinc-700">{c.totalOrders}</td>
                        <td data-label="Total Spent" className="px-4 py-3 text-right font-bold text-navy">
                          {formatMoney(c.totalSpent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      )}
    </div>
  );
}
