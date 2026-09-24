"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import {
  PAYMENT_STATUSES,
  orderNumber,
  formatLabel,
  formatMoney,
  formatDate,
  StatusBadge,
  extractOrders,
  Pager,
} from "@/lib/orders";

const LIMIT = 10;

export default function PaymentsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (paymentStatus) params.paymentStatus = paymentStatus;
      const res = await api.get("/order", { params });
      setRows(extractOrders(res));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, paymentStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const pageTotal = rows.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-tertiary">Payments</h1>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-navy"
        >
          <option value="">All payment status</option>
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {formatLabel(s)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 inline-block rounded-lg bg-navy px-4 py-3 text-white">
        <span className="block text-xs text-white/60">Amount on this page</span>
        <span className="text-lg font-bold">{formatMoney(pageTotal)}</span>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
          No payments found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order No.</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Razorpay Order ID</th>
                <th className="px-4 py-3 font-medium">Razorpay Payment ID</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Order Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((o) => (
                <tr key={o._id} className="hover:bg-zinc-50">
                  <td className="px-4 py-3 font-mono font-bold text-navy">{orderNumber(o)}</td>
                  <td className="px-4 py-3 text-zinc-700">{o.shippingAddress?.name || "—"}</td>
                  <td className="px-4 py-3 font-bold text-navy">{formatMoney(o.total)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                    {o.razorpayOrderId || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                    {o.razorpayPaymentId || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={o.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={o.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(o.updatedAt)}</td>
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
