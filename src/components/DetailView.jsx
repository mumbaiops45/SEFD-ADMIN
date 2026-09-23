"use client";

const HIDDEN_KEYS = new Set(["_id", "__v", "createdAt", "updatedAt"]);

const formatKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export default function DetailView({ data }) {
  const entries = Object.entries(data || {}).filter(([key]) => !HIDDEN_KEYS.has(key));

  return (
    <dl className="space-y-2 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="flex gap-3 border-b border-zinc-100 py-1.5 last:border-0">
          <dt className="w-36 shrink-0 font-medium text-zinc-500">{formatKey(key)}</dt>
          <dd className="wrap-break-word text-zinc-700">{formatValue(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
