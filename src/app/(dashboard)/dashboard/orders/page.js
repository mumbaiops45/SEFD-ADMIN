"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Eye } from "lucide-react";
import Modal from "@/components/Modal";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  orderNumber,
  userIdOf,
  formatLabel,
  formatMoney,
  formatDate,
  StatusBadge,
  extractOrders,
  Pager,
} from "@/lib/orders";

const LIMIT = 10;
const selectCls = "rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-navy";

export default function OrdersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = { page, limit: LIMIT };
      if (status) params.status = status;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      const res = await api.get("/order", { params });
      setRows(extractOrders(res));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, status, paymentStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (order, newStatus) => {
    setSaving(true);
    setError("");
    try {
      const res = await api.put(`/order/${order._id}/admin`, { status: newStatus });
      const updated = res?.data?.order;
      if (updated) {
        setRows((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
        setModal(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-tertiary">Orders</h1>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="">All order status</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className={selectCls}
          >
            <option value="">All payment status</option>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {formatLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
          No orders found.
        </div>
      ) : (
        <div className="card-table-wrap overflow-x-auto rounded-lg border border-zinc-200">
          <table className="card-table w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">Order No.</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((o) => (
                <tr key={o._id} className="hover:bg-zinc-50">
                  <td data-label="Order No." className="px-4 py-3 font-mono font-bold text-navy">{orderNumber(o)}</td>
                  <td data-label="Customer" className="px-4 py-3 text-zinc-700">
                    <div className="font-medium text-navy">{o.shippingAddress?.name || "—"}</div>
                    <div className="text-xs text-zinc-500">{o.shippingAddress?.phone}</div>
                  </td>
                  <td data-label="Items" className="px-4 py-3 text-zinc-700">
                    {o.items?.reduce((n, it) => n + it.quantity, 0) || 0}
                  </td>
                  <td data-label="Total" className="px-4 py-3 font-bold text-navy">{formatMoney(o.total)}</td>
                  <td data-label="Status" className="px-4 py-3">
                    <StatusBadge value={o.status} />
                  </td>
                  <td data-label="Payment" className="px-4 py-3">
                    <StatusBadge value={o.paymentStatus} />
                  </td>
                  <td data-label="Date" className="px-4 py-3 text-xs text-zinc-500">{formatDate(o.createdAt)}</td>
                  <td data-label="Actions" className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setModal(o)}
                        title="View"
                        aria-label="View"
                        className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pager page={page} setPage={setPage} hasNext={rows.length === LIMIT} loading={loading} />

      {modal && (
        <Modal title={`Order ${orderNumber(modal)}`} onClose={() => setModal(null)} wide>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md bg-navy/5 p-3 text-sm">
            <div>
              <span className="block text-xs font-medium text-zinc-500">Order Status</span>
              <select
                value={modal.status}
                disabled={saving}
                onChange={(e) => updateStatus(modal, e.target.value)}
                className={`${selectCls} mt-1 py-1`}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {formatLabel(s)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <span className="block text-xs font-medium text-zinc-500">Payment</span>
              <StatusBadge value={modal.paymentStatus} />
            </div>
            <div>
              <span className="block text-xs font-medium text-zinc-500">Razorpay Order ID</span>
              <span className="font-mono text-xs text-navy">{modal.razorpayOrderId || "—"}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-zinc-500">Razorpay Payment ID</span>
              <span className="font-mono text-xs text-navy">{modal.razorpayPaymentId || "—"}</span>
            </div>
          </div>

          <div className="mb-4 overflow-hidden rounded-md border border-zinc-200 text-sm">
            <div className="bg-zinc-50 px-3 py-2 text-xs font-medium uppercase text-zinc-500">
              Customer &amp; Shipping Address
            </div>
            <dl className="divide-y divide-zinc-100">
              {[
                ["orderId", modal._id],
                ["userId", userIdOf(modal)],
                ["name", modal.shippingAddress?.name],
                ["phone", modal.shippingAddress?.phone],
                ["email", modal.shippingAddress?.email],
                ["address", modal.shippingAddress?.address],
                ["landmark", modal.shippingAddress?.landmark],
                ["city", modal.shippingAddress?.city],
                ["state", modal.shippingAddress?.state],
                ["pincode", modal.shippingAddress?.pincode],
                ["country", modal.shippingAddress?.country],
              ].map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-3 px-3 py-2">
                  <dt className="font-mono text-xs text-zinc-500">{key}</dt>
                  <dd className="col-span-2 break-all font-medium text-navy">{value || "—"}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="card-table-wrap overflow-hidden rounded-md border border-zinc-200">
            <table className="card-table w-full text-left text-sm">
              <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Product</th>
                  <th className="px-3 py-2 font-medium">SKU</th>
                  <th className="px-3 py-2 font-medium">Price</th>
                  <th className="px-3 py-2 font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {modal.items?.map((it, i) => (
                  <tr key={i}>
                    <td data-label="Product" className="px-3 py-2 font-bold text-navy">{it.name}</td>
                    <td data-label="SKU" className="px-3 py-2 font-mono text-xs text-zinc-600">{it.sku}</td>
                    <td data-label="Price" className="px-3 py-2 text-zinc-700">{formatMoney(it.price)}</td>
                    <td data-label="Qty" className="px-3 py-2">
                      <span className="rounded bg-orange px-2 py-0.5 text-xs font-bold text-navy">
                        {it.quantity}
                      </span>
                    </td>
                    <td data-label="Subtotal" className="px-3 py-2 font-bold text-navy">
                      {formatMoney(it.price * it.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 space-y-1 text-right text-sm">
            <div className="text-zinc-600">Subtotal: {formatMoney(modal.subTotal)}</div>
            <div className="text-zinc-600">Shipping: {formatMoney(modal.shippingFee)}</div>
            <div className="text-base font-bold text-navy">Total: {formatMoney(modal.total)}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}
