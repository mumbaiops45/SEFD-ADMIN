"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";

const slugify = (s) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const columns = [
  {
    key: "image",
    label: "Image",
    render: (row) =>
      row.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.image} alt={row.name} className="h-10 w-10 rounded object-cover" />
      ) : (
        "—"
      ),
  },
  { key: "name", label: "Name" },
  { key: "slug", label: "Slug" },
  { key: "isActive", label: "Active", render: (row) => (row.isActive ? "Yes" : "No") },
];

function CategoryForm({ initial, onCancel, onSubmit }) {
  const [name, setName] = useState(initial?.name || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [file, setFile] = useState(null);
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
      const fd = new FormData();
      fd.append("name", name);
      fd.append("slug", slug);
      fd.append("isActive", String(isActive));
      if (file) fd.append("image", file);
      await onSubmit(fd);
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
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20"
        />
      </div>

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
        <label className="mb-1 block text-sm font-medium text-zinc-700">Image</label>
        {initial?.image && !file && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={initial.image} alt="" className="mb-2 h-16 w-16 rounded object-cover" />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="cat-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300"
        />
        <label htmlFor="cat-active" className="text-sm text-zinc-700">
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

export default function CategoriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/category");
      setRows(res?.data?.category || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (fd) => {
    await api.post("/category", fd);
    setModal(null);
    load();
  };

  const handleUpdate = async (id, fd) => {
    await api.put(`/category/${id}`, fd);
    setModal(null);
    load();
  };

  const handleDelete = async (row) => {
    if (!confirm(`Delete category "${row.name}"? This cannot be undone.`)) return;
    try {
      await api.del(`/category/${row._id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-tertiary">Categories</h1>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-navy hover:bg-orange-deep hover:text-white"
        >
          + Add Category
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

      {modal?.mode === "create" && (
        <Modal title="Add Category" onClose={() => setModal(null)} wide>
          <CategoryForm onCancel={() => setModal(null)} onSubmit={handleCreate} />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit Category" onClose={() => setModal(null)} wide>
          <CategoryForm
            initial={modal.row}
            onCancel={() => setModal(null)}
            onSubmit={(fd) => handleUpdate(modal.row._id, fd)}
          />
        </Modal>
      )}

      {modal?.mode === "view" && (
        <Modal title="Category details" onClose={() => setModal(null)} wide>
          <dl className="space-y-2 text-sm">
            {Object.entries(modal.row).map(([key, value]) => (
              <div key={key} className="flex gap-3 border-b border-zinc-100 py-1.5">
                <dt className="w-36 shrink-0 font-medium text-zinc-500">{key}</dt>
                <dd className="wrap-break-word text-zinc-700">
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}
    </div>
  );
}
