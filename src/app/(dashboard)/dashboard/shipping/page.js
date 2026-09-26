"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatMoney, formatDate } from "@/lib/orders";

const inputCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20";

const rangeLabel = (row) =>
  row.maxOrderValue === undefined || row.maxOrderValue === null
    ? `${formatMoney(row.minOrderValue)} and above`
    : `${formatMoney(row.minOrderValue)} – ${formatMoney(row.maxOrderValue)}`;

const columns = [
  { key: "name", label: "Name" },
  { key: "minOrderValue", label: "Min Order", render: (row) => formatMoney(row.minOrderValue) },
  {
    key: "maxOrderValue",
    label: "Max Order",
    render: (row) => (row.maxOrderValue == null ? "No limit" : formatMoney(row.maxOrderValue)),
  },
  {
    key: "shippingFee",
    label: "Shipping Fee",
    render: (row) => (
      <span className="font-bold text-navy">
        {row.shippingFee === 0 ? "FREE" : formatMoney(row.shippingFee)}
      </span>
    ),
  },
];

function ShippingForm({ initial, defaultMin, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [minOrderValue, setMin] = useState(String(initial?.minOrderValue ?? defaultMin ?? 0));
  const [maxOrderValue, setMax] = useState(
    initial?.maxOrderValue == null ? "" : String(initial.maxOrderValue)
  );
  const [shippingFee, setFee] = useState(String(initial?.shippingFee ?? ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        name,
        minOrderValue: Number(minOrderValue),
        // empty max = open-ended range ("and above")
        maxOrderValue: maxOrderValue === "" ? undefined : Number(maxOrderValue),
        shippingFee: Number(shippingFee),
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Name <span className="text-tertiary">*</span>
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Standard shipping"
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Min Order Value (₹) <span className="text-tertiary">*</span>
          </label>
          <input
            required
            type="number"
            min="0"
            value={minOrderValue}
            onChange={(e) => setMin(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Max Order Value (₹)</label>
          <input
            type="number"
            min="0"
            value={maxOrderValue}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Empty = no limit"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Shipping Fee (₹) <span className="text-tertiary">*</span>
        </label>
        <input
          required
          type="number"
          min="0"
          value={shippingFee}
          onChange={(e) => setFee(e.target.value)}
          placeholder="0 = free shipping"
          className={inputCls}
        />
      </div>

      <p className="rounded-md bg-navy/5 px-3 py-2 text-xs text-zinc-600">
        The first range must start at ₹0. Each new range must start exactly ₹1 above the previous
        range&apos;s max. Leave Max empty only on the last range.
      </p>

      {error && (
        <p className="rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-navy hover:bg-orange-deep hover:text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default function ShippingPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/shipping", { params: { page: 1, limit: 100 } });
      const payload = res?.data?.shipping;
      setRows(Array.isArray(payload) ? payload : payload ? [payload] : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const last = rows[rows.length - 1];
  const nextMin = last ? (last.maxOrderValue == null ? undefined : last.maxOrderValue + 1) : 0;

  const handleCreate = async (body) => {
    await api.post("/shipping", body);
    setModal(null);
    load();
  };

  const handleUpdate = async (id, body) => {
    await api.put(`/shipping/${id}`, body);
    setModal(null);
    load();
  };

  const confirmDeleteShipping = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.del(`/shipping/${confirmDelete._id}`);
      setConfirmDelete(null);
      load();
    } catch (err) {
      setError(err.message);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-tertiary">Shipping Fees</h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-navy hover:bg-orange-deep hover:text-white"
        >
          + Add Shipping Range
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          idField="_id"
          onView={(row) => setModal({ mode: "view", row })}
          onEdit={(row) => setModal({ mode: "edit", row })}
          onDelete={(row) => {
            setError("");
            setConfirmDelete(row);
          }}
        />
      )}

      {modal?.mode === "create" && (
        <Modal title="Add Shipping Range" onClose={() => setModal(null)} wide>
          <ShippingForm
            defaultMin={nextMin}
            onCancel={() => setModal(null)}
            onSubmit={handleCreate}
          />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit Shipping Range" onClose={() => setModal(null)} wide>
          <ShippingForm
            initial={modal.row}
            onCancel={() => setModal(null)}
            onSubmit={(body) => handleUpdate(modal.row._id, body)}
          />
        </Modal>
      )}

      {modal?.mode === "view" && (
        <Modal title="Shipping details" onClose={() => setModal(null)} wide>
          <dl className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-200 text-sm">
            {[
              ["id", modal.row._id],
              ["name", modal.row.name],
              ["orderRange", rangeLabel(modal.row)],
              ["minOrderValue", formatMoney(modal.row.minOrderValue)],
              ["maxOrderValue", modal.row.maxOrderValue == null ? "No limit" : formatMoney(modal.row.maxOrderValue)],
              ["shippingFee", formatMoney(modal.row.shippingFee)],
              ["createdAt", formatDate(modal.row.createdAt)],
              ["updatedAt", formatDate(modal.row.updatedAt)],
            ].map(([key, value]) => (
              <div key={key} className="grid grid-cols-3 gap-3 px-3 py-2">
                <dt className="font-mono text-xs text-zinc-500">{key}</dt>
                <dd className="col-span-2 break-all font-medium text-navy">{value}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete shipping range?"
        message={
          confirmDelete
            ? `Delete "${confirmDelete.name}" (${rangeLabel(confirmDelete)})? The neighbouring range will be stretched to cover the gap.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteShipping}
      />
    </div>
  );
}
