"use client";

export default function DataTable({ columns, rows, idField, onView, onEdit, onDelete }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500">
        No records yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200">
      <table className="w-full text-left text-sm">
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
                <td key={col.key} className="px-4 py-3 text-zinc-700">
                  {col.render ? col.render(row) : String(row[col.key] ?? "")}
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {onView && (
                    <button
                      onClick={() => onView(row)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
                    >
                      View
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => onEdit(row)}
                      className="rounded-md bg-orange/10 px-2.5 py-1 text-xs font-semibold text-orange-deep hover:bg-orange/20"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(row)}
                      className="rounded-md bg-tertiary/10 px-2.5 py-1 text-xs font-semibold text-tertiary hover:bg-tertiary/20"
                    >
                      Delete
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
