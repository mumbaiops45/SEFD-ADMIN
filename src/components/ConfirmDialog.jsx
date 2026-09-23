"use client";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between px-5 pt-5">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
              danger ? "bg-tertiary/10 text-tertiary" : "bg-orange/10 text-orange-deep"
            }`}
          >
            {danger ? "⚠" : "?"}
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md bg-orange p-1.5 text-navy transition-colors hover:bg-orange-deep"
          >
            ✕
          </button>
        </div>

        <div className="px-5 pb-5 pt-3">
          <h2 className="text-base font-semibold text-navy">{title}</h2>
          {message && <p className="mt-1.5 text-sm text-zinc-500">{message}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 bg-zinc-50 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${
              danger ? "bg-tertiary hover:bg-tertiary-deep" : "bg-orange text-navy hover:bg-orange-deep hover:text-white"
            }`}
          >
            {loading ? "Please wait…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
