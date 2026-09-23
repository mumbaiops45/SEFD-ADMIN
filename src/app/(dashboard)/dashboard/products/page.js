"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import DetailView from "@/components/DetailView";
import ProductMediaManager from "@/components/ProductMediaManager";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function ProductForm({ initial, categories, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [sku, setSku] = useState(initial?.sku || "");
  const [category, setCategory] = useState(initial?.category?._id || initial?.category || "");
  const [price, setPrice] = useState(initial?.price ?? "");
  const [stock, setStock] = useState(initial?.stock ?? "");
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription || "");
  const [longDescription, setLongDescription] = useState(initial?.longDescription || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (v) => {
    setName(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSubmit({
        name,
        slug,
        sku,
        category,
        price: price === "" ? undefined : Number(price),
        stock: stock === "" ? undefined : Number(stock),
        shortDescription,
        longDescription,
        isActive,
      });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Name <span className="text-tertiary">*</span>
          </label>
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            SKU <span className="text-tertiary">*</span>
          </label>
          <input
            required
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Slug <span className="text-tertiary">*</span>
          </label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Category <span className="text-tertiary">*</span>
          </label>
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          >
            <option value="" disabled>
              Select…
            </option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Price (₹) <span className="text-tertiary">*</span>
          </label>
          <input
            type="number"
            step="any"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Stock <span className="text-tertiary">*</span>
          </label>
          <input
            type="number"
            required
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Short description</label>
        <textarea
          rows={2}
          value={shortDescription}
          onChange={(e) => setShortDescription(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">Long description</label>
        <textarea
          rows={4}
          value={longDescription}
          onChange={(e) => setLongDescription(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="prod-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <label htmlFor="prod-active" className="text-sm text-zinc-700">
          Active
        </label>
      </div>

      {error && <p className="text-sm text-tertiary">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-navy hover:bg-orange-deep hover:text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : initial ? "Save changes" : "Create"}
        </button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categoryMap = useMemo(() => {
    const m = {};
    for (const c of categories) m[c._id] = c.name;
    return m;
  }, [categories]);

  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "sku", label: "SKU" },
      {
        key: "category",
        label: "Category",
        render: (row) => categoryMap[row.category?._id || row.category] || "—",
      },
      { key: "price", label: "Price" },
      { key: "stock", label: "Stock" },
      { key: "isActive", label: "Active", render: (row) => (row.isActive ? "Yes" : "No") },
    ],
    [categoryMap]
  );

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const load = useCallback(async (pageNum) => {
    setLoading(true);
    setError("");
    try {
      const [productRes, categoryRes] = await Promise.all([
        api.get(`/product?page=${pageNum}&limit=${PAGE_SIZE}`),
        api.get("/category"),
      ]);
      setRows(productRes?.data?.product || []);
      setCategories(categoryRes?.data?.category || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleCreate = async (payload) => {
    const res = await api.post("/product", payload);
    const created = res?.data?.product;
    load(page);
    if (created?._id) {
      setModal({ mode: "edit", row: created });
    } else {
      setModal(null);
    }
  };

  const handleUpdate = async (id, payload) => {
    await api.put(`/product/${id}`, payload);
    setModal(null);
    load(page);
  };

  const handleDelete = (row) => {
    setError("");
    setConfirmDelete(row);
  };

  const confirmDeleteProduct = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      const mediaRes = await api.get(`/productMedia/${confirmDelete._id}`);
      const media = mediaRes?.data?.productMedia || [];
      await Promise.all(media.map((m) => api.del(`/productMedia/${m._id}`)));
      await api.del(`/product/${confirmDelete._id}`);
      setConfirmDelete(null);
      if (rows.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        load(page);
      }
    } catch (err) {
      setError(err.message);
      setConfirmDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-tertiary">Products</h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-navy hover:bg-orange-deep hover:text-white"
        >
          + Add Product
        </button>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">
          {error}
        </p>
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
          onDelete={handleDelete}
        />
      )}

      {!loading && (
        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-zinc-500">Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={rows.length < PAGE_SIZE}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {modal?.mode === "create" && (
        <Modal title="Add Product" onClose={() => setModal(null)} wide>
          <ProductForm categories={categories} onCancel={() => setModal(null)} onSubmit={handleCreate} />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit Product" onClose={() => setModal(null)} wide>
          <div className="space-y-6">
            <ProductForm
              initial={modal.row}
              categories={categories}
              onCancel={() => setModal(null)}
              onSubmit={(payload) => handleUpdate(modal.row._id, payload)}
            />
            <ProductMediaManager productId={modal.row._id} />
          </div>
        </Modal>
      )}

      {modal?.mode === "view" && (
        <Modal title="Product details" onClose={() => setModal(null)} wide>
          <DetailView data={modal.row} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete product?"
        message={
          confirmDelete
            ? `Delete product "${confirmDelete.name}"? This also deletes all of its images and cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteProduct}
      />
    </div>
  );
}
