"use client";

export default function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-2 sm:p-4">
      <div
        className={`max-h-[90vh] w-full ${
          wide ? "max-w-2xl" : "max-w-md"
        } overflow-y-auto rounded-lg bg-white shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3">
          <h2 className="text-base font-semibold text-tertiary">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md bg-orange p-1.5 text-navy transition-colors hover:bg-orange-deep"
          >
            ✕
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}
