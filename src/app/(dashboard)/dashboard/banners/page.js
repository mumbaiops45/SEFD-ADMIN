"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { api } from "@/lib/api";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { formatDate } from "@/lib/orders";

const BANNER_TYPES = ["Hero", "MIDDLE_BANNER"];
const TYPE_LABELS = { Hero: "Hero", MIDDLE_BANNER: "Middle Banner" };

const inputCls =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20";

// CTA links are site paths only: "shop", "https://site.com/shop" → "/shop".
const toPath = (value) => {
  const v = value.trim().replace(/^https?:\/\/[^/]+/i, "");
  return `/${v.replace(/^\/+/, "")}`;
};

const columns = [
  {
    key: "url",
    label: "Image",
    render: (row) =>
      row.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.url} alt={row.title1 || "banner"} className="h-12 w-24 rounded object-cover" />
      ) : (
        "—"
      ),
  },
  { key: "type", label: "Type", render: (row) => TYPE_LABELS[row.type] || row.type },
  { key: "order", label: "Order" },
  {
    key: "title1",
    label: "Title",
    render: (row) => [row.title1, row.title2].filter(Boolean).join(" · ") || "—",
  },
  {
    key: "ctaText",
    label: "Button",
    render: (row) =>
      row.ctaText ? (
        <span title={row.ctaUrl}>
          {row.ctaText}
          {row.ctaUrl && <span className="block text-xs text-zinc-500">{row.ctaUrl}</span>}
        </span>
      ) : (
        "—"
      ),
  },
  {
    key: "isActive",
    label: "Active",
    render: (row) => (
      <span
        className={`rounded px-2 py-0.5 text-[11px] font-bold ${
          row.isActive ? "bg-green-100 text-green-800" : "bg-zinc-100 text-zinc-600"
        }`}
      >
        {row.isActive ? "Active" : "Hidden"}
      </span>
    ),
  },
];

// Live preview: image with the titles/description overlaid in their colors
function BannerPreview({ src, title1, color1, title2, color2, description, descriptionColor, ctaText }) {
  return (
    <div className="relative aspect-[3/1] w-full overflow-hidden rounded-md bg-zinc-800">
      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 flex flex-col justify-center gap-1 bg-black/25 p-4">
        {title1 && (
          <p className="text-lg font-bold leading-tight sm:text-2xl" style={{ color: color1 }}>
            {title1}
          </p>
        )}
        {title2 && (
          <p className="text-base font-semibold leading-tight sm:text-xl" style={{ color: color2 }}>
            {title2}
          </p>
        )}
        {description && (
          <p className="max-w-md text-xs sm:text-sm" style={{ color: descriptionColor }}>
            {description}
          </p>
        )}
        {ctaText && (
          <span className="mt-2 inline-block w-fit rounded-md bg-orange px-4 py-1.5 text-xs font-semibold text-navy sm:text-sm">
            {ctaText}
          </span>
        )}
        {!src && !title1 && !title2 && !description && (
          <p className="text-center text-sm text-white/60">Preview appears here</p>
        )}
      </div>
    </div>
  );
}

const PRESET_COLORS = [
  "#ffffff",
  "#000000",
  "#221a5e",
  "#f59621",
  "#d9568b",
  "#ffd166",
  "#16a34a",
  "#dc2626",
  "#2563eb",
  "#9ca3af",
];

function ColorChooser({ label, color, onColor }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-xs font-medium text-zinc-500">{label} color:</span>
      {PRESET_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onColor(c)}
          title={c}
          aria-label={`${label} color ${c}`}
          className={`h-6 w-6 rounded-full border border-zinc-300 ${
            color.toLowerCase() === c ? "ring-2 ring-orange ring-offset-1" : ""
          }`}
          style={{ background: c }}
        />
      ))}
      <input
        type="color"
        value={color}
        onChange={(e) => onColor(e.target.value)}
        title="Pick any color"
        className="h-7 w-9 cursor-pointer rounded border border-zinc-300 bg-white p-0.5"
      />
      <input
        key={color}
        defaultValue={color}
        onChange={(e) => {
          if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onColor(e.target.value);
        }}
        maxLength={7}
        className="w-20 rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs"
      />
    </div>
  );
}

function TextWithColor({ label, value, onChange, color, onColor, textarea }) {
  const Field = textarea ? "textarea" : "input";
  return (
    <div className="rounded-md border border-zinc-200 p-3">
      <label className="mb-1 block text-sm font-medium text-zinc-700">{label}</label>
      <Field
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={textarea ? 2 : undefined}
        className={inputCls}
        style={{ color: color === "#ffffff" ? undefined : color }}
      />
      <ColorChooser label={label} color={color} onColor={onColor} />
    </div>
  );
}

function BannerForm({ initial, nextOrderFor, onCancel, onSubmit }) {
  const editing = !!initial;
  const [type, setType] = useState(initial?.type || "Hero");
  const [order, setOrder] = useState(String(initial?.order ?? nextOrderFor("Hero")));
  const [title1, setTitle1] = useState(initial?.title1 || "");
  const [color1, setColor1] = useState(initial?.color1 || "#ffffff");
  const [title2, setTitle2] = useState(initial?.title2 || "");
  const [color2, setColor2] = useState(initial?.color2 || "#ffffff");
  const [description, setDescription] = useState(initial?.description || "");
  const [descriptionColor, setDescriptionColor] = useState(initial?.descriptionColor || "#ffffff");
  const [ctaText, setCtaText] = useState(initial?.ctaText || "");
  const [ctaUrl, setCtaUrl] = useState(initial?.ctaUrl || "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [file, setFile] = useState(null);
  const [mobileFile, setMobileFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : initial?.url || ""), [file, initial]);
  useEffect(() => () => file && URL.revokeObjectURL(preview), [file, preview]);
  const mobilePreview = useMemo(
    () => (mobileFile ? URL.createObjectURL(mobileFile) : initial?.mobileUrl || ""),
    [mobileFile, initial]
  );
  useEffect(() => () => mobileFile && URL.revokeObjectURL(mobilePreview), [mobileFile, mobilePreview]);

  const handleType = (t) => {
    setType(t);
    if (!editing) setOrder(String(nextOrderFor(t)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editing && !file) {
      setError("Please choose a banner image");
      return;
    }
    if (!editing && !mobileFile) {
      setError("Please choose a mobile banner image");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("type", type);
      fd.append("order", order);
      fd.append("title1", title1);
      fd.append("color1", color1);
      fd.append("title2", title2);
      fd.append("color2", color2);
      fd.append("description", description);
      fd.append("descriptionColor", descriptionColor);
      fd.append("ctaText", ctaText);
      fd.append("ctaUrl", ctaUrl.trim() ? toPath(ctaUrl) : "");
      fd.append("isActive", String(isActive));
      if (file) fd.append("image", file);
      if (mobileFile) fd.append("mobileImage", mobileFile);
      await onSubmit(fd);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <BannerPreview
        src={preview}
        title1={title1}
        color1={color1}
        title2={title2}
        color2={color2}
        description={description}
        descriptionColor={descriptionColor}
        ctaText={ctaText}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Type <span className="text-tertiary">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => handleType(e.target.value)}
            disabled={editing}
            className={`${inputCls} disabled:bg-zinc-100`}
          >
            {BANNER_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Order <span className="text-tertiary">*</span>
          </label>
          <input
            required
            type="number"
            min="1"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className={inputCls}
          />
          <p className="mt-1 text-xs text-zinc-500">
            {editing
              ? "Changing order shifts the other banners of this type."
              : "New banners must be last in order for their type."}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Image {!editing && <span className="text-tertiary">*</span>}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-orange/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-deep hover:file:bg-orange/20"
        />
        {editing && <p className="mt-1 text-xs text-zinc-500">Leave empty to keep the current image.</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700">
          Mobile Image {!editing && <span className="text-tertiary">*</span>}
        </label>
        <div className="flex items-start gap-3">
          {mobilePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mobilePreview}
              alt="mobile preview"
              className="h-32 w-20 shrink-0 rounded-md border border-zinc-200 object-cover"
            />
          )}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-orange/10 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-orange-deep hover:file:bg-orange/20"
            />
            {editing && (
              <p className="mt-1 text-xs text-zinc-500">Leave empty to keep the current mobile image.</p>
            )}
          </div>
        </div>
      </div>

      <TextWithColor label="Title 1" value={title1} onChange={setTitle1} color={color1} onColor={setColor1} />
      <TextWithColor label="Title 2" value={title2} onChange={setTitle2} color={color2} onColor={setColor2} />
      <TextWithColor
        label="Description"
        value={description}
        onChange={setDescription}
        color={descriptionColor}
        onColor={setDescriptionColor}
        textarea
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Button Text</label>
          <input
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
            placeholder="e.g. Shop Now"
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">Button Link (page path)</label>
          <div className="flex items-stretch">
            <span className="flex items-center rounded-l-md border border-r-0 border-zinc-300 bg-zinc-50 px-3 text-sm text-zinc-500">
              /
            </span>
            <input
              value={ctaUrl.replace(/^\/+/, "")}
              onChange={(e) => setCtaUrl(e.target.value)}
              onBlur={() => setCtaUrl((v) => (v.trim() ? toPath(v) : ""))}
              placeholder="shop"
              className={`${inputCls} rounded-l-none`}
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Only the part after the domain, e.g. <b>shop</b> or <b>shop?category=jute-products</b>.
          </p>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-orange"
        />
        Active (show on website)
      </label>

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

export default function BannersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [modal, setModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/Banner");
      const payload = res?.data?.banner;
      const list = Array.isArray(payload) ? payload : payload ? [payload] : [];
      list.sort((a, b) => a.type.localeCompare(b.type) || a.order - b.order);
      setRows(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const nextOrderFor = (type) =>
    Math.max(0, ...rows.filter((r) => r.type === type).map((r) => r.order)) + 1;

  const visible = typeFilter ? rows.filter((r) => r.type === typeFilter) : rows;

  const handleCreate = async (fd) => {
    await api.post("/Banner", fd);
    setModal(null);
    load();
  };

  const handleUpdate = async (id, fd) => {
    await api.put(`/Banner/${id}`, fd);
    setModal(null);
    load();
  };

  const confirmDeleteBanner = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.del(`/Banner/${confirmDelete._id}`);
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
        <h1 className="text-xl font-semibold text-tertiary">Banners</h1>
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1">
            {["", ...BANNER_TYPES].map((t) => (
              <button
                key={t || "all"}
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
                  typeFilter === t ? "bg-orange text-navy shadow-sm" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {t ? TYPE_LABELS[t] : "All"}
              </button>
            ))}
          </div>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="rounded-md bg-orange px-4 py-2 text-sm font-semibold text-navy hover:bg-orange-deep hover:text-white"
          >
            + Add Banner
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <DataTable
          columns={columns}
          rows={visible}
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
        <Modal title="Add Banner" onClose={() => setModal(null)} wide>
          <BannerForm nextOrderFor={nextOrderFor} onCancel={() => setModal(null)} onSubmit={handleCreate} />
        </Modal>
      )}

      {modal?.mode === "edit" && (
        <Modal title="Edit Banner" onClose={() => setModal(null)} wide>
          <BannerForm
            initial={modal.row}
            nextOrderFor={nextOrderFor}
            onCancel={() => setModal(null)}
            onSubmit={(fd) => handleUpdate(modal.row._id, fd)}
          />
        </Modal>
      )}

      {modal?.mode === "view" && (
        <Modal title="Banner details" onClose={() => setModal(null)} wide>
          <div className="space-y-4">
            <BannerPreview src={modal.row.url} {...modal.row} />
            <dl className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-200 text-sm">
              {[
                ["id", modal.row._id],
                ["type", TYPE_LABELS[modal.row.type] || modal.row.type],
                ["order", modal.row.order],
                ["title1", modal.row.title1, modal.row.color1],
                ["title2", modal.row.title2, modal.row.color2],
                ["description", modal.row.description, modal.row.descriptionColor],
                ["ctaText", modal.row.ctaText],
                ["ctaUrl", modal.row.ctaUrl],
                ["isActive", modal.row.isActive ? "Yes" : "No"],
                ["url", modal.row.url],
                ["mobileUrl", modal.row.mobileUrl],
                ["createdAt", formatDate(modal.row.createdAt)],
                ["updatedAt", formatDate(modal.row.updatedAt)],
              ].map(([key, value, color]) => (
                <div key={key} className="grid grid-cols-3 gap-3 px-3 py-2">
                  <dt className="font-mono text-xs text-zinc-500">{key}</dt>
                  <dd className="col-span-2 flex items-start gap-2 break-all font-medium text-navy">
                    {color && (
                      <span
                        className="mt-0.5 inline-flex shrink-0 items-center gap-1 font-mono text-xs text-zinc-500"
                        title="Text color"
                      >
                        <span className="h-3.5 w-3.5 rounded border border-zinc-300" style={{ background: color }} />
                        {color}
                      </span>
                    )}
                    <span>{value === "" || value == null ? "—" : value}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete banner?"
        message={
          confirmDelete
            ? `Delete ${TYPE_LABELS[confirmDelete.type]} banner #${confirmDelete.order}? Banners after it move up one place.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={confirmDeleteBanner}
      />
    </div>
  );
}
