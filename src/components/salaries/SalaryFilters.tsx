"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { LOCATIONS, ROLES, LEVELS } from "../../lib/constants";
import { mapLevelToBadge } from "../../lib/ui-helpers";

export default function SalaryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const company = searchParams.get("company") || "";
  const role = searchParams.get("role") || "";
  const level = searchParams.get("level") || "";
  const location = searchParams.get("location") || "";
  const sort = searchParams.get("sort") || "total_comp_desc";

  function updateQuery(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset to page 1 on filter change
    
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  function handleClearAll() {
    startTransition(() => {
      router.push(pathname);
    });
  }

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Company Search */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Company
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => updateQuery("company", e.target.value)}
            placeholder="Search company..."
            className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
          />
        </div>

        {/* Role Select */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => updateQuery("role", e.target.value)}
            className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition bg-white"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Level Select */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Level
          </label>
          <select
            value={level}
            onChange={(e) => updateQuery("level", e.target.value)}
            className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition bg-white"
          >
            <option value="">All Levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {mapLevelToBadge(l)}
              </option>
            ))}
          </select>
        </div>

        {/* Location Select */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Location
          </label>
          <select
            value={location}
            onChange={(e) => updateQuery("location", e.target.value)}
            className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition bg-white"
          >
            <option value="">All Locations</option>
            {LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div>
          <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
            Sort By
          </label>
          <select
            value={sort}
            onChange={(e) => updateQuery("sort", e.target.value)}
            className="w-full h-10 px-3 text-sm border border-zinc-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition bg-white"
          >
            <option value="total_comp_desc">Total Comp (High to Low)</option>
            <option value="total_comp_asc">Total Comp (Low to High)</option>
            <option value="date_desc">Submission Date (Newest)</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100">
        <div className="text-sm text-zinc-400">
          {isPending ? "Filtering data..." : ""}
        </div>
        {(company || role || level || location || sort !== "total_comp_desc") && (
          <button
            onClick={handleClearAll}
            className="text-sm font-semibold text-rose-500 hover:text-rose-600 cursor-pointer transition"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
