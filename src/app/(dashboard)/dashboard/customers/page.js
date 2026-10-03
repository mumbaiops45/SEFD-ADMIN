"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import OrdersPanel from "@/components/OrdersPanel";
import { formatDate, Pager } from "@/lib/orders";

const LIMIT = 10;

function Avatar({ user, className }) {
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.image} alt={user.name || "Customer"} className={`shrink-0 rounded-full object-cover ${className}`} />
    );
  }
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full bg-navy/10 font-bold uppercase text-navy ${className}`}>
      {(user.name || user.email || "?").charAt(0)}
    </span>
  );
}

function CustomerDetail({ customer, onBack }) {
  const profile = [
    ["Name", customer.name],
    ["Email", customer.email],
    ["Phone", customer.phone],
    ["Blocked", customer.isBlock ? "Yes" : "No"],
    ["Joined", formatDate(customer.createdAt)],
    ["User ID", customer._id],
  ];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" /> Customers
        </button>
        <h1 className="text-xl font-semibold text-tertiary">{customer.name || customer.email || "Customer"}</h1>
      </div>

      <div className="mb-6 overflow-hidden rounded-lg border border-zinc-200 text-sm">
        <div className="bg-zinc-50 px-4 py-2 text-xs font-medium uppercase text-zinc-500">Profile</div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
          <Avatar user={customer} className="h-24 w-24 text-3xl" />
          <dl className="grid min-w-0 flex-1 grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            {profile.map(([label, value]) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-zinc-500">{label}</dt>
                <dd className="break-all font-medium text-navy">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <OrdersPanel userId={customer._id} />
    </div>
  );
}

export default function CustomersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/user", { params: { page, limit: LIMIT } });
      setRows(res?.data?.user || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  if (selected) {
    return <CustomerDetail key={selected._id} customer={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-tertiary">Customers</h1>
      </div>

      {error && <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
          No customers found.
        </div>
      ) : (
        <div className="card-table-wrap overflow-x-auto rounded-lg border border-zinc-200">
          <table className="card-table w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Blocked</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((u) => (
                <tr key={u._id} onClick={() => setSelected(u)} className="cursor-pointer hover:bg-zinc-50">
                  <td data-label="Name" className="px-4 py-3 font-medium text-navy">
                    <div className="flex items-center gap-3">
                      <Avatar user={u} className="h-9 w-9 text-sm" />
                      {u.name || "—"}
                    </div>
                  </td>
                  <td data-label="Email" className="px-4 py-3 text-zinc-700">{u.email || "—"}</td>
                  <td data-label="Phone" className="px-4 py-3 text-zinc-700">{u.phone || "—"}</td>
                  <td data-label="Blocked" className="px-4 py-3 text-zinc-700">{u.isBlock ? "Yes" : "No"}</td>
                  <td data-label="Joined" className="px-4 py-3 text-xs text-zinc-500">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} setPage={setPage} hasNext={rows.length === LIMIT} loading={loading} />
    </div>
  );
}
