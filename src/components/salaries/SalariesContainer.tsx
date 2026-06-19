"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatSalaryCompact, mapLevelToBadge, mapLevelToColor } from "../../lib/ui-helpers";
import { SalaryWithCompany } from "../../types/salary";
import { PaginatedMeta } from "../../types/api";
import { LOCATIONS, ROLES, LEVELS } from "../../lib/constants";

interface SalariesContainerProps {
  initialData: SalaryWithCompany[];
  metadata: PaginatedMeta;
  pageNum: number;
}

export default function SalariesContainer({ initialData, metadata, pageNum }: SalariesContainerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const company = searchParams.get("company") || "";
  const role = searchParams.get("role") || "";
  const level = searchParams.get("level") || "";
  const location = searchParams.get("location") || "";
  const sort = searchParams.get("sort") || "total_comp_desc";

  const startRecord = initialData.length > 0 ? (pageNum - 1) * 25 + 1 : 0;
  const endRecord = Math.min(pageNum * 25, metadata.total);

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

  function getPageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `${pathname}?${params.toString()}`;
  }

  function handlePageClick(e: React.MouseEvent<HTMLAnchorElement>, page: number) {
    e.preventDefault();
    startTransition(() => {
      router.push(getPageUrl(page));
    });
  }

  // Skeleton Table Row
  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-zinc-100">
      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded-sm w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded-sm w-32"></div></td>
      <td className="px-6 py-4"><div className="h-5 bg-zinc-200 rounded w-16"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded-sm w-20"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded-sm w-12 mx-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-200 rounded-sm w-16 ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-200 rounded-sm w-16 ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-zinc-200 rounded-sm w-16 ml-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 bg-rose-200 rounded-sm w-20 ml-auto"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded-sm w-12 mx-auto"></div></td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* 1. Low-Profile Filter Bar */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {/* Company Search */}
          <div>
            <label htmlFor="filter-company" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Company
            </label>
            <input
              id="filter-company"
              type="text"
              value={company}
              onChange={(e) => updateQuery("company", e.target.value)}
              placeholder="Search company..."
              className="w-full h-9 px-3 text-xs border border-zinc-200 rounded-lg outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder-zinc-400"
            />
          </div>

          {/* Role Select */}
          <div>
            <label htmlFor="filter-role" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Role
            </label>
            <select
              id="filter-role"
              value={role}
              onChange={(e) => updateQuery("role", e.target.value)}
              className="w-full h-9 px-2 text-xs border border-zinc-200 rounded-lg outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all bg-white"
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
            <label htmlFor="filter-level" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Level
            </label>
            <select
              id="filter-level"
              value={level}
              onChange={(e) => updateQuery("level", e.target.value)}
              className="w-full h-9 px-2 text-xs border border-zinc-200 rounded-lg outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all bg-white"
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
            <label htmlFor="filter-location" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Location
            </label>
            <select
              id="filter-location"
              value={location}
              onChange={(e) => updateQuery("location", e.target.value)}
              className="w-full h-9 px-2 text-xs border border-zinc-200 rounded-lg outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all bg-white"
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
            <label htmlFor="filter-sort" className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              id="filter-sort"
              value={sort}
              onChange={(e) => updateQuery("sort", e.target.value)}
              className="w-full h-9 px-2 text-xs border border-zinc-200 rounded-lg outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all bg-white"
            >
              <option value="total_comp_desc">Total Comp (High to Low)</option>
              <option value="total_comp_asc">Total Comp (Low to High)</option>
              <option value="date_desc">Submission Date (Newest)</option>
            </select>
          </div>
        </div>

        {/* Filter State Footer */}
        {(company || role || level || location || sort !== "total_comp_desc" || isPending) && (
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 text-xs">
            <div className="text-zinc-500 font-medium flex items-center gap-2">
              {isPending && (
                <>
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
                  <span>Fetching fresh compensation records...</span>
                </>
              )}
            </div>
            {(company || role || level || location || sort !== "total_comp_desc") && (
              <button
                onClick={handleClearAll}
                className="font-bold text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2. Results Section */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
        {/* Table info header */}
        <div className="px-6 py-3.5 border-b border-zinc-200/60 bg-zinc-50/50 flex justify-between items-center text-xs">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Verified Salary Data
          </span>
          <span className="font-semibold text-zinc-700">
            {isPending ? (
              <span>Updating results...</span>
            ) : initialData.length > 0 ? (
              <span>
                Showing <span className="font-bold text-zinc-800">{startRecord}–{endRecord}</span> of{" "}
                <span className="font-bold text-zinc-800">{metadata.total}</span> records
              </span>
            ) : (
              <span>0 records</span>
            )}
          </span>
        </div>

        {/* Empty State */}
        {!isPending && initialData.length === 0 ? (
          <div className="py-16 px-6 text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 border border-zinc-300 mb-4 text-zinc-500 text-lg">
              🔍
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">No salary records match your filters</h3>
            <p className="text-xs text-zinc-650 leading-relaxed mb-5">
              Try changing your company, level, location, or role filters to browse other compensation bands.
            </p>
            <button
              onClick={handleClearAll}
              className="inline-flex h-8 items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 px-4 text-xs font-bold text-white transition-colors shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            {/* Table wrapper with sticky header capability */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                <thead>
                  <tr className="sticky top-0 bg-white border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider z-10 shadow-[0_1px_0_0_rgba(228,228,231,0.6)]">
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Level</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5 text-center">Experience</th>
                    <th className="px-6 py-3.5 text-right">Base</th>
                    <th className="px-6 py-3.5 text-right">Bonus</th>
                    <th className="px-6 py-3.5 text-right">Stock</th>
                    <th className="px-6 py-3.5 text-right text-zinc-800 font-bold bg-rose-500/[0.01]">Total Comp</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs font-medium text-zinc-600">
                  {isPending
                    ? Array.from({ length: 6 }).map((_, idx) => <SkeletonRow key={idx} />)
                    : initialData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-zinc-50/50 even:bg-zinc-50/[0.1] transition-colors"
                        >
                          {/* Company */}
                          <td className="px-6 py-3.5 font-bold text-zinc-900">
                            <Link
                              href={`/companies/${item.company.slug}`}
                              className="hover:text-rose-600 hover:underline transition-colors"
                            >
                              {item.company.name}
                            </Link>
                          </td>
                          {/* Role */}
                          <td className="px-6 py-3.5 text-zinc-800">{item.role}</td>
                          {/* Level Badge */}
                          <td className="px-6 py-3.5">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${mapLevelToColor(
                                item.level
                              )}`}
                            >
                              {mapLevelToBadge(item.level)}
                            </span>
                          </td>
                          {/* Location */}
                          <td className="px-6 py-3.5 text-zinc-600">{item.location}</td>
                          {/* Experience */}
                          <td className="px-6 py-3.5 text-center font-mono text-zinc-600">
                            {item.experience_years} yrs
                          </td>
                          {/* Base */}
                          <td className="px-6 py-3.5 text-right font-mono text-zinc-800">
                            {formatSalaryCompact(Number(item.base_salary), item.currency)}
                          </td>
                          {/* Bonus */}
                          <td className="px-6 py-3.5 text-right font-mono text-zinc-500">
                            {formatSalaryCompact(Number(item.bonus), item.currency)}
                          </td>
                          {/* Stock */}
                          <td className="px-6 py-3.5 text-right font-mono text-zinc-800">
                            {formatSalaryCompact(Number(item.stock), item.currency)}
                          </td>
                          {/* Total Compensation (Largest visual weight) */}
                          <td className="px-6 py-3.5 text-right font-mono font-black text-rose-600 text-sm bg-rose-500/[0.015]">
                            {formatSalaryCompact(Number(item.total_compensation), item.currency)}
                          </td>
                          {/* Actions */}
                          <td className="px-6 py-3.5 text-center">
                            <Link
                              href={`/compare?s1=${item.id}`}
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline transition-colors"
                            >
                              Compare ⚖️
                            </Link>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {!isPending && metadata.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-zinc-200/85 flex items-center justify-between bg-zinc-50/20 text-xs">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Page {pageNum} of {metadata.totalPages}
                </div>
                <div className="flex gap-2">
                  {pageNum > 1 ? (
                    <Link
                      href={getPageUrl(pageNum - 1)}
                      onClick={(e) => handlePageClick(e, pageNum - 1)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
                    >
                      Prev
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 font-semibold text-zinc-300 cursor-not-allowed"
                    >
                      Prev
                    </button>
                  )}
                  {pageNum < metadata.totalPages ? (
                    <Link
                      href={getPageUrl(pageNum + 1)}
                      onClick={(e) => handlePageClick(e, pageNum + 1)}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors shadow-xs"
                    >
                      Next
                    </Link>
                  ) : (
                    <button
                      disabled
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50/50 px-3 font-semibold text-zinc-300 cursor-not-allowed"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
