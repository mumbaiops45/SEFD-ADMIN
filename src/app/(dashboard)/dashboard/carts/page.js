"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Eye } from "lucide-react";
import Modal from "@/components/Modal";

function ItemsPreview({ items }) {
  if (!items?.length) return <span className="text-zinc-400">Empty cart</span>;
  return (
    <div className="flex max-w-sm flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span
          key={it._id || i}
          className="inline-flex items-center gap-1 rounded-md bg-navy/5 px-2 py-1 text-xs text-navy"
        >
          <span className="font-bold">{it.product?.name || "Unknown product"}</span>
          <span className="rounded bg-orange px-1.5 py-0.5 text-[11px] font-bold text-navy">
            × {it.quantity}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function CartsPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/cart/admin");
      const payload = res?.data?.carts ?? res?.data?.cart;
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

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-tertiary">Abandoned Cart</h1>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-tertiary/10 px-3 py-2 text-sm text-tertiary">{error}</p>
      )}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
          No carts yet.
        </div>
      ) : (
        <div className="card-table-wrap overflow-x-auto rounded-lg border border-zinc-200">
          <table className="card-table w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Mobile Number</th>
                <th className="px-4 py-3 font-medium">Cart Items</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((cart) => (
                <tr key={cart._id} className="hover:bg-zinc-50">
                  <td data-label="User" className="px-4 py-3 font-medium text-navy">{cart.user?.name || "—"}</td>
                  <td data-label="Mobile Number" className="px-4 py-3 text-zinc-700">{cart.user?.phone || "—"}</td>
                  <td data-label="Cart Items" className="px-4 py-3 text-zinc-700">
                    <ItemsPreview items={cart.items} />
                  </td>
                  <td data-label="Actions" className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setModal(cart)}
                        title="View"
                        aria-label="View"
                        className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal title={`${modal.user?.name || "User"}'s cart`} onClose={() => setModal(null)} wide>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-md bg-navy/5 p-3 text-sm">
            <div>
              <span className="block text-xs font-medium text-zinc-500">Name</span>
              <span className="font-bold text-navy">{modal.user?.name || "—"}</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-zinc-500">Mobile Number</span>
              <span className="font-bold text-navy">{modal.user?.phone || "—"}</span>
            </div>
          </div>

          {!modal.items?.length ? (
            <p className="text-sm text-zinc-500">This cart is empty.</p>
          ) : (
            <div className="card-table-wrap overflow-hidden rounded-md border border-zinc-200">
              <table className="card-table w-full text-left text-sm">
                <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Product</th>
                    <th className="px-3 py-2 font-medium">Price</th>
                    <th className="px-3 py-2 font-medium">Qty</th>
                    <th className="px-3 py-2 font-medium">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {modal.items.map((it, i) => (
                    <tr key={it._id || i}>
                      <td data-label="Product" className="px-3 py-2 font-bold text-navy">
                        {it.product?.name || "Unknown product"}
                      </td>
                      <td data-label="Price" className="px-3 py-2 text-zinc-700">₹{it.product?.price ?? "—"}</td>
                      <td data-label="Qty" className="px-3 py-2">
                        <span className="rounded bg-orange px-2 py-0.5 text-xs font-bold text-navy">
                          {it.quantity}
                        </span>
                      </td>
                      <td data-label="Subtotal" className="px-3 py-2 font-bold text-navy">
                        {it.product?.price ? `₹${it.product.price * it.quantity}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
