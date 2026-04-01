import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export default function Table({
  columns,
  data,
  searchable = true,
  pageSize = 8,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState(null);

  /* ---------------- SEARCH ---------------- */
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      row.some((cell) =>
        String(cell).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, data]);

  /* ---------------- SORT ---------------- */
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.index] < b[sortConfig.index])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.index] > b[sortConfig.index])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleSort = (index) => {
    setSortConfig((prev) =>
      prev?.index === index
        ? { index, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { index, direction: "asc" }
    );
  };

  /* ---------------- STATUS BADGE ---------------- */
  const renderCell = (cell) => {
    if (typeof cell === "string") {
      if (cell.toLowerCase() === "active")
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
            Active
          </span>
        );
      if (cell.toLowerCase() === "inactive")
        return (
          <span className="px-3 py-1 rounded-full text-xs bg-red-100 text-red-700">
            Inactive
          </span>
        );
    }
    return cell;
  };

  return (
    <div className="bg-white dark:bg-[#0f0f0f] rounded-xl shadow-lg border border-gray-200 dark:border-[#1f1f1f]">

      {/* -------- TOP BAR -------- */}
      {searchable && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#1f1f1f]">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64 px-4 py-2 rounded-md bg-gray-100 dark:bg-[#1a1a1a]
                       text-sm text-gray-700 dark:text-gray-300
                       outline-none focus:ring-2 focus:ring-red-500"
          />

          <span className="text-sm text-gray-500 dark:text-gray-400">
            Total Records: {filteredData.length}
          </span>
        </div>
      )}

      {/* -------- TABLE -------- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#111827] sticky top-0">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  onClick={() => handleSort(i)}
                  className="px-5 py-4 text-left font-semibold uppercase tracking-wider
                             text-gray-700 dark:text-gray-300 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-1">
                    {col}
                    {sortConfig?.index === i &&
                      (sortConfig.direction === "asc" ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      ))}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-200 dark:border-[#1f1f1f]
                             even:bg-gray-50 dark:even:bg-[#121212]
                             hover:bg-gray-100 dark:hover:bg-[#1a1a1a]
                             transition"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="px-5 py-4 text-gray-700 dark:text-gray-300"
                    >
                      {renderCell(cell)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* -------- PAGINATION -------- */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-gray-200 dark:border-[#1f1f1f]">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Page {page} of {totalPages}
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-md text-sm bg-gray-100 dark:bg-[#1a1a1a]
                       disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-md text-sm bg-gray-100 dark:bg-[#1a1a1a]
                       disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
