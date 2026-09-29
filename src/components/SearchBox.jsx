"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";

// Search input with a live suggestion dropdown. Typing (debounced) filters the
// page via onSearch and lists matching items fetched from `endpoint?keyword=`.
export default function SearchBox({ endpoint, dataKey, placeholder, onSearch, renderMeta, extraParams }) {
  const extraKey = JSON.stringify(extraParams || {});
  const [text, setText] = useState("");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const boxRef = useRef(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const keyword = text.trim();
    const t = setTimeout(async () => {
      onSearch(keyword);
      if (!keyword) {
        setItems([]);
        return;
      }
      setSearching(true);
      try {
        const res = await api.get(endpoint, { params: { ...JSON.parse(extraKey), keyword, page: 1, limit: 8 } });
        const list = res?.data?.[dataKey];
        setItems((Array.isArray(list) ? list : []).slice(0, 8));
      } catch {
        setItems([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, endpoint, dataKey, extraKey]);

  useEffect(() => {
    const close = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const pick = (item) => {
    setText(item.name);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <Search
        className={`pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 ${
          searching ? "animate-pulse text-orange" : "text-zinc-400"
        }`}
      />
      <input
        type="search"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        placeholder={placeholder}
        className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-10 text-sm text-navy shadow-sm transition placeholder:text-zinc-400 hover:border-zinc-300 focus:border-orange focus:outline-none focus:ring-4 focus:ring-orange/15 [&::-webkit-search-cancel-button]:hidden"
      />
      {text && (
        <button
          type="button"
          onClick={() => {
            setText("");
            setItems([]);
          }}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-zinc-100 p-1 text-zinc-500 hover:bg-zinc-200 hover:text-navy"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {open && text.trim() && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-xl ring-1 ring-black/5">
          {searching && !items.length ? (
            <p className="px-4 py-3 text-sm text-zinc-500">Searching…</p>
          ) : !items.length ? (
            <p className="px-4 py-3 text-sm text-zinc-500">No matches for “{text.trim()}”</p>
          ) : (
            <>
              <p className="border-b border-zinc-100 bg-zinc-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
                {items.length} suggestion{items.length > 1 ? "s" : ""}
              </p>
              <div className="max-h-72 overflow-y-auto py-1">
                {items.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => pick(item)}
                    className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-orange/10"
                  >
                    <Search className="h-3.5 w-3.5 shrink-0 text-zinc-300 group-hover:text-orange-deep" />
                    <span className="min-w-0 flex-1 truncate font-medium text-navy">{item.name}</span>
                    {renderMeta && (
                      <span className="shrink-0 rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-600">
                        {renderMeta(item)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
