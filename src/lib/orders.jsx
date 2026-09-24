export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

export const PAYMENT_STATUSES = ["UNPAID", "PAID", "REFUNDED"];

// Unique, human-readable order number derived from the Mongo _id
export const orderNumber = (order) => `#ORD-${String(order?._id || "").slice(-8).toUpperCase()}`;

export const formatLabel = (s) => (s ? s.replace(/_/g, " ") : "—");

export const formatMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export const formatDate = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const STATUS_STYLES = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-indigo-100 text-indigo-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  UNPAID: "bg-zinc-100 text-zinc-700",
  PAID: "bg-green-100 text-green-800",
  REFUNDED: "bg-orange/15 text-orange-deep",
};

export function StatusBadge({ value }) {
  return (
    <span className={`rounded px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLES[value] || "bg-zinc-100"}`}>
      {formatLabel(value)}
    </span>
  );
}

export function extractOrders(res) {
  const payload = res?.data?.order ?? res?.data?.orders;
  return Array.isArray(payload) ? payload : payload ? [payload] : [];
}

export function Pager({ page, setPage, hasNext, loading }) {
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button
        disabled={page === 1 || loading}
        onClick={() => setPage((p) => p - 1)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:opacity-40"
      >
        Prev
      </button>
      <span className="text-zinc-600">Page {page}</span>
      <button
        disabled={!hasNext || loading}
        onClick={() => setPage((p) => p + 1)}
        className="rounded-md border border-zinc-300 px-3 py-1.5 disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
