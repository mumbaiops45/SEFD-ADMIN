"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";

export default function DataTable({ columns, rows, idField, onView, onEdit, onDelete }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
        No records yet.
      </div>
    );
  }

  return (
    <div className="card-table-wrap overflow-x-auto rounded-lg border border-zinc-200">
      <table className="card-table w-full text-left text-sm">
        <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.map((row) => (
            <tr key={row[idField]} className="hover:bg-zinc-50">
              {columns.map((col) => (
                <td key={col.key} data-label={col.label} className="px-4 py-3 text-zinc-700">
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
              <td data-label="Actions" className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(row)}
                      title="View"
                      aria-label="View"
                      className="rounded-md p-1.5 text-zinc-600 hover:bg-zinc-100"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      title="Edit"
                      aria-label="Edit"
                      className="rounded-md bg-orange/10 p-1.5 text-orange-deep hover:bg-orange/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      title="Delete"
                      aria-label="Delete"
                      className="rounded-md bg-tertiary/10 p-1.5 text-tertiary hover:bg-tertiary/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
