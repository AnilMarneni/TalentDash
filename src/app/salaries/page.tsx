import { Metadata } from "next";
import Link from "next/link";
import { getSalaries } from "../../lib/queries/salaries";
import SalaryFilters from "../../components/salaries/SalaryFilters";
import { formatSalaryCompact, mapLevelToBadge, mapLevelToColor } from "../../lib/ui-helpers";
import { generateSeoMetadata } from "../../lib/seo";

export const revalidate = 300; // ISR revalidate every 5 minutes (300 seconds)

interface PageProps {
  searchParams: Promise<{
    company?: string;
    role?: string;
    level?: string;
    location?: string;
    sort?: string;
    page?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParams = await props.searchParams;
  return generateSeoMetadata({
    title: "Salary Intelligence Browser",
    description: "Browse verified, structured tech salaries across leading companies. Filter by role, level, location, and compare total compensation bands.",
    path: "/salaries",
  });
}

export default async function SalariesPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const pageNum = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const limit = 25;

  const { metadata, data } = await getSalaries({
    company: searchParams.company,
    role: searchParams.role,
    level: searchParams.level,
    location: searchParams.location,
    sort: searchParams.sort,
    page: pageNum,
    limit,
  });

  const startRecord = data.length > 0 ? (pageNum - 1) * limit + 1 : 0;
  const endRecord = Math.min(pageNum * limit, metadata.total);

  // Pagination navigation helper
  function getPageUrl(page: number) {
    const params = new URLSearchParams();
    if (searchParams.company) params.set("company", searchParams.company);
    if (searchParams.role) params.set("role", searchParams.role);
    if (searchParams.level) params.set("level", searchParams.level);
    if (searchParams.location) params.set("location", searchParams.location);
    if (searchParams.sort) params.set("sort", searchParams.sort);
    params.set("page", String(page));
    return `/salaries?${params.toString()}`;
  }

  return (
    <div className="flex-1 bg-zinc-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/salaries" className="text-xl font-bold tracking-tight text-zinc-950 flex items-center gap-1">
              <span className="text-rose-500">Talent</span>
              <span>Dash</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/salaries" className="text-sm font-semibold text-zinc-900 border-b-2 border-rose-500 pt-1 pb-1">
                Salaries
              </Link>
              <Link href="/compare" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">
                Compare
              </Link>
            </nav>
          </div>
          <div>
            <Link
              href="/compare"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-4 text-xs font-semibold text-white hover:bg-zinc-800 transition shadow-sm"
            >
              Compare Tool
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Salary Intelligence</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Real-time, structured, comparable career compensation insights.
          </p>
        </div>

        {/* Filters */}
        <SalaryFilters />

        {/* Results Info & Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          {data.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-zinc-500">No salary records found matching current filters.</p>
              <Link href="/salaries" className="text-xs font-semibold text-rose-500 hover:text-rose-600 mt-2 inline-block">
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              {/* Header Details */}
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Verified Salaries
                </span>
                <span className="text-sm font-medium text-zinc-600">
                  Showing {startRecord}–{endRecord} of {metadata.total} records
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-50/50">
                      <th className="px-6 py-4">Company</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Level</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4 text-center">Exp (Yrs)</th>
                      <th className="px-6 py-4 text-right">Base Salary</th>
                      <th className="px-6 py-4 text-right">Stock</th>
                      <th className="px-6 py-4 text-right">Total Comp</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-sm">
                    {data.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                        {/* Company Link */}
                        <td className="px-6 py-4 font-semibold text-zinc-950">
                          <Link href={`/companies/${item.company.slug}`} className="hover:text-rose-500 hover:underline">
                            {item.company.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-zinc-600 font-medium">{item.role}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${mapLevelToColor(item.level)}`}>
                            {mapLevelToBadge(item.level)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-medium">{item.location}</td>
                        <td className="px-6 py-4 text-center text-zinc-600">{item.experience_years}</td>
                        <td className="px-6 py-4 text-right text-zinc-600 font-mono">
                          {formatSalaryCompact(Number(item.base_salary), item.currency)}
                        </td>
                        <td className="px-6 py-4 text-right text-zinc-600 font-mono">
                          {formatSalaryCompact(Number(item.stock), item.currency)}
                        </td>
                        {/* Dominant Total Comp */}
                        <td className="px-6 py-4 text-right font-bold text-base text-rose-500 font-mono">
                          {formatSalaryCompact(Number(item.total_compensation), item.currency)}
                        </td>
                        {/* Action Link to Compare */}
                        <td className="px-6 py-4 text-center">
                          <Link
                            href={`/compare?s1=${item.id}`}
                            className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline"
                          >
                            Compare
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {metadata.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                  <div className="text-xs text-zinc-400 font-semibold">
                    Page {pageNum} of {metadata.totalPages}
                  </div>
                  <div className="flex gap-2">
                    {pageNum > 1 ? (
                      <Link
                        href={getPageUrl(pageNum - 1)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-sm"
                      >
                        Previous
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 px-4 text-xs font-semibold text-zinc-300 cursor-not-allowed"
                      >
                        Previous
                      </button>
                    )}
                    {pageNum < metadata.totalPages ? (
                      <Link
                        href={getPageUrl(pageNum + 1)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-sm"
                      >
                        Next
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 px-4 text-xs font-semibold text-zinc-300 cursor-not-allowed"
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
      </main>
    </div>
  );
}
