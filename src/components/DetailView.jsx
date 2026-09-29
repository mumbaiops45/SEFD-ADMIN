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

const isImageUrl = (v) =>
  typeof v === "string" && /^https?:\/\/\S+\.(png|jpe?g|webp|gif|avif|svg)(\?\S*)?$/i.test(v);

export default function DetailView({ data }) {
  const entries = Object.entries(data || {}).filter(([key]) => !HIDDEN_KEYS.has(key));

  return (
    <dl className="divide-y divide-zinc-100 overflow-hidden rounded-md border border-zinc-200 text-sm">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-1 gap-1 px-3 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
          <dt className="font-medium text-zinc-500">{formatKey(key)}</dt>
          <dd className="min-w-0 break-all text-zinc-700">
            {isImageUrl(value) ? (
              <div className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={value}
                  alt={formatKey(key)}
                  className="h-24 w-24 rounded-md border border-zinc-200 object-cover"
                />
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-orange-deep underline-offset-2 hover:underline"
                >
                  {value}
                </a>
              </div>
            ) : (
              formatValue(value)
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
