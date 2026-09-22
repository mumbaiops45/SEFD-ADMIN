"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";

export default function ProductMediaManager({ productId }) {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [isPrimary, setIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/productMedia/${productId}`);
      setMedia(res?.data?.productMedia || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("product", productId);
      fd.append("image", file);
      fd.append("isPrimary", String(isPrimary));
      fd.append("sortOrder", String(media.length));
      await api.post("/productMedia", fd);
      setFile(null);
      setIsPrimary(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (item) => {
    try {
      const fd = new FormData();
      fd.append("isPrimary", "true");
      await api.put(`/productMedia/${item._id}`, fd);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.del(`/productMedia/${item._id}`);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="rounded-md border border-zinc-200 p-4">
      <h3 className="mb-3 text-sm font-semibold text-tertiary">Product images</h3>

      {error && <p className="mb-3 text-sm text-tertiary">{error}</p>}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : media.length === 0 ? (
        <p className="mb-3 text-sm text-zinc-500">No images yet.</p>
      ) : (
        <div className="mb-4 flex flex-wrap gap-3">
          {media.map((item) => (
            <div
              key={item._id}
              className="relative w-24 overflow-hidden rounded-md border border-zinc-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="h-24 w-24 object-cover" />
              {item.isPrimary && (
                <span className="absolute left-1 top-1 rounded bg-orange px-1.5 py-0.5 text-[10px] font-medium text-white">
                  Primary
                </span>
              )}
              <div className="flex divide-x divide-zinc-200 border-t border-zinc-200 text-[11px]">
                {!item.isPrimary && (
                  <button
                    onClick={() => handleSetPrimary(item)}
                    className="flex-1 py-1 font-medium text-navy hover:bg-navy/5"
                  >
                    Make primary
                  </button>
                )}
                <button
                  onClick={() => handleDelete(item)}
                  className="flex-1 py-1 font-medium text-tertiary hover:bg-tertiary/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleUpload} className="flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="text-sm"
        />
        <label className="flex items-center gap-1.5 text-xs text-zinc-600">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-zinc-300"
          />
          Set as primary
        </label>
        <button
          type="submit"
          disabled={!file || uploading}
          className="rounded-md bg-orange px-3 py-1.5 text-xs font-semibold text-navy hover:bg-orange-deep hover:text-white disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Add image"}
        </button>
      </form>
    </div>
  );
}
