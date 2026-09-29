"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Eye, Lock, AlertTriangle } from "lucide-react";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
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
  const [pendingStatus, setPendingStatus] = useState(null);
  const [confirmStatus, setConfirmStatus] = useState(null);
  const [statusError, setStatusError] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);

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

  const openOrder = (order) => {
    setPendingStatus(null);
    setStatusError("");
    setModal(order);
  };

  const cancelStatusChange = () => {
    setConfirmStatus(null);
    setPendingStatus(null);
  };

  const updateStatus = async (order, newStatus) => {
    setSaving(true);
    setStatusError("");
    try {
      const res = await api.put(`/order/${order._id}/admin`, { status: newStatus });
      const updated = res?.data?.order;
      if (updated) {
        setRows((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
        setModal(updated);
      }
      setPendingStatus(null);
    } catch (err) {
      setStatusError(err.message);
    } finally {
      setSaving(false);
      setConfirmStatus(null);
      setPendingStatus(null);
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
                    {new Set(o.items?.map((it) => String(it.product))).size}
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
                        onClick={() => openOrder(o)}
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
              {modal.status === "DELIVERED" ? (
                <div className="mt-1 flex items-center gap-2">
                  <StatusBadge value="DELIVERED" />
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Lock className="h-3.5 w-3.5" /> Locked — delivered orders can&apos;t change
                  </span>
                </div>
              ) : (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <select
                    value={pendingStatus ?? modal.status}
                    disabled={saving}
                    onChange={(e) => {
                      if (e.target.value === modal.status) return;
                      setPendingStatus(e.target.value);
                      setConfirmStatus(e.target.value);
                      setAcknowledged(false);
                    }}
                    className={`${selectCls} py-1`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {formatLabel(s)}
                      </option>
                    ))}
                  </select>
                  {saving && <span className="text-xs text-zinc-500">Saving…</span>}
                </div>
              )}
              {statusError && <p className="mt-1 text-xs text-tertiary">{statusError}</p>}
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

      {/* Normal status change */}
      <ConfirmDialog
        open={!!confirmStatus && !!modal && confirmStatus !== "DELIVERED"}
        danger={false}
        title="Change order status?"
        message={
          modal && confirmStatus
            ? `Are you sure you want to change the status from ${formatLabel(modal.status)} to ${formatLabel(confirmStatus)}?`
            : ""
        }
        confirmLabel="Yes, change status"
        loading={saving}
        onCancel={cancelStatusChange}
        onConfirm={() => updateStatus(modal, confirmStatus)}
      />

      {/* DELIVERED: special, important alert */}
      {confirmStatus === "DELIVERED" && modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl ring-4 ring-red-500/30">
            <div className="flex flex-col items-center gap-2 bg-red-600 px-5 py-5 text-center text-white">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <AlertTriangle className="h-8 w-8" />
              </span>
              <h2 className="text-lg font-bold uppercase tracking-wide">Important — Final Action</h2>
              <p className="text-sm text-white/90">Mark this order as DELIVERED?</p>
            </div>
            <div className="space-y-3 px-5 py-4 text-sm text-zinc-700">
              <div className="flex items-center justify-center gap-2">
                <StatusBadge value={modal.status} />
                <span className="text-zinc-400">→</span>
                <StatusBadge value="DELIVERED" />
              </div>
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-800">
                Once an order is marked <b>DELIVERED</b>, its status is <b>locked permanently</b>.
                You will <b>NOT</b> be able to change it again.
              </p>
              <p className="break-all text-xs text-zinc-500">Order: {orderNumber(modal)}</p>
              <label className="flex items-start gap-2 rounded-md bg-zinc-50 px-3 py-2">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-600"
                />
                <span>I understand this cannot be undone.</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3">
              <button
                type="button"
                onClick={cancelStatusChange}
                disabled={saving}
                className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => updateStatus(modal, "DELIVERED")}
                disabled={!acknowledged || saving}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                {saving ? "Please wait…" : "Yes, mark delivered"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
