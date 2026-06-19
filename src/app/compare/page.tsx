import { Metadata } from "next";
import Link from "next/link";
import { getComparison } from "../../lib/queries/compare";
import { getSalaries } from "../../lib/queries/salaries";
import { formatSalaryCompact, mapLevelToBadge } from "../../lib/ui-helpers";
import { generateSeoMetadata } from "../../lib/seo";

interface PageProps {
  searchParams: Promise<{
    s1?: string;
    s2?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Salary Comparison Engine",
    description: "Compare total compensation, base salaries, bonuses, and equity side-by-side. View detailed deltas and find the higher paying packages.",
    path: "/compare",
  });
}

function getNormalizedUSD(amount: number, currency: string): number {
  switch (currency) {
    case "INR":
      return amount / 85;
    case "GBP":
      return amount * 1.25;
    case "EUR":
      return amount * 1.08;
    case "USD":
    default:
      return amount;
  }
}

export default async function ComparePage(props: PageProps) {
  const searchParams = await props.searchParams;
  const s1Id = searchParams.s1;
  const s2Id = searchParams.s2;

  // Fetch comparison details if both IDs are present
  const comparison = s1Id && s2Id ? await getComparison(s1Id, s2Id) : null;

  // Fetch list of recent salaries to allow the user to select them for comparison
  const { data: recentSalaries } = await getSalaries({ limit: 15 });

  // Helper to generate the URL for setting/clearing s1 and s2
  function getSelectionUrl(id: string, slot: "s1" | "s2") {
    const params = new URLSearchParams();
    if (slot === "s1") {
      params.set("s1", id);
      if (s2Id) params.set("s2", s2Id);
    } else {
      if (s1Id) params.set("s1", s1Id);
      params.set("s2", id);
    }
    return `/compare?${params.toString()}`;
  }

  // Determine the winner (using normalized USD values for comparison if currencies differ)
  let s1Winner = false;
  let s2Winner = false;
  if (comparison) {
    const s1Val = getNormalizedUSD(Number(comparison.salary1.total_compensation), comparison.salary1.currency);
    const s2Val = getNormalizedUSD(Number(comparison.salary2.total_compensation), comparison.salary2.currency);
    if (s1Val > s2Val) s1Winner = true;
    if (s2Val > s1Val) s2Winner = true;
  }

  // Delta helpers
  function renderDelta(value: number, currency: string, isBig: boolean = false) {
    if (value > 0) {
      return (
        <span className={`text-emerald-600 font-bold font-mono ${isBig ? "text-xl" : "text-sm"}`}>
          +{formatSalaryCompact(value, currency)}
        </span>
      );
    } else if (value < 0) {
      return (
        <span className={`text-rose-600 font-bold font-mono ${isBig ? "text-xl" : "text-sm"}`}>
          -{formatSalaryCompact(Math.abs(value), currency)}
        </span>
      );
    }
    return <span className="text-zinc-400 font-medium font-mono">--</span>;
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
              <Link href="/salaries" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">
                Salaries
              </Link>
              <Link href="/compare" className="text-sm font-semibold text-zinc-900 border-b-2 border-rose-500 pt-1 pb-1">
                Compare
              </Link>
            </nav>
          </div>
          <div>
            <Link
              href="/salaries"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Browse Salaries
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">Salary Comparison Engine</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Compare two offer packages side-by-side to analyze deltas in base salary, bonus, and stock.
          </p>
        </div>

        {/* Top select status banners */}
        {(!s1Id || !s2Id) && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-8 text-sm text-rose-800 flex items-center gap-3">
            <span className="text-base">💡</span>
            <span>
              {!s1Id && !s2Id
                ? "Select two salary records from the list below to begin comparison."
                : !s1Id
                ? "Select a first salary record (Slot 1) to compare."
                : "Select a second salary record (Slot 2) to complete comparison."}
            </span>
          </div>
        )}

        {/* Side-by-side Comparison View */}
        {comparison && (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8 items-start">
            {/* Record 1 Card */}
            <div className={`lg:col-span-3 bg-white border rounded-2xl p-6 shadow-sm relative transition ${s1Winner ? "border-rose-300 ring-2 ring-rose-500/20" : "border-zinc-200"}`}>
              {s1Winner && (
                <span className="absolute -top-3 left-6 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  🏆 Higher Compensation
                </span>
              )}
              
              <div className="mb-6">
                <Link href={`/companies/${comparison.salary1.company.slug}`} className="text-2xl font-black text-zinc-900 hover:text-rose-500 hover:underline">
                  {comparison.salary1.company.name}
                </Link>
                <p className="text-base font-bold text-zinc-600 mt-1">{comparison.salary1.role}</p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-800">
                    {mapLevelToBadge(comparison.salary1.level)}
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-zinc-50 text-zinc-500 border border-zinc-200">
                    {comparison.salary1.location}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Total Compensation
                  </span>
                  <div className="text-3xl font-black text-rose-500 font-mono">
                    {formatSalaryCompact(Number(comparison.salary1.total_compensation), comparison.salary1.currency)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Base Salary</span>
                    <span className="text-sm font-semibold text-zinc-800 font-mono">
                      {formatSalaryCompact(Number(comparison.salary1.base_salary), comparison.salary1.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bonus</span>
                    <span className="text-sm font-semibold text-zinc-800 font-mono">
                      {formatSalaryCompact(Number(comparison.salary1.bonus), comparison.salary1.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Stock / Yr</span>
                    <span className="text-sm font-semibold text-zinc-800 font-mono">
                      {formatSalaryCompact(Number(comparison.salary1.stock), comparison.salary1.currency)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Experience</span>
                  <span className="text-sm font-semibold text-zinc-700">{comparison.salary1.experience_years} Years</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between">
                <Link href={`/compare?s2=${s2Id || ""}`} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition">
                  Remove record
                </Link>
              </div>
            </div>

            {/* Delta Column */}
            <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center gap-6 self-stretch min-h-[300px]">
              <div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block mb-1">
                  Deltas
                </span>
                <span className="text-xs text-zinc-400 block mb-3 font-semibold">(S1 minus S2)</span>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Total Comp</span>
                  {renderDelta(comparison.delta.total_compensation, comparison.salary1.currency, true)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Base Salary</span>
                  {renderDelta(comparison.delta.base_salary, comparison.salary1.currency)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Bonus</span>
                  {renderDelta(comparison.delta.bonus, comparison.salary1.currency)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Stock / Yr</span>
                  {renderDelta(comparison.delta.stock, comparison.salary1.currency)}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Exp Delta</span>
                  <span className="text-sm font-semibold font-mono text-zinc-700">
                    {comparison.delta.experience_years > 0 ? `+${comparison.delta.experience_years}` : comparison.delta.experience_years} yrs
                  </span>
                </div>
              </div>
            </div>

            {/* Record 2 Card */}
            <div className={`lg:col-span-3 bg-white border rounded-2xl p-6 shadow-sm relative transition ${s2Winner ? "border-rose-300 ring-2 ring-rose-500/20" : "border-zinc-200"}`}>
              {s2Winner && (
                <span className="absolute -top-3 left-6 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                  🏆 Higher Compensation
                </span>
              )}
              
              <div className="mb-6">
                <Link href={`/companies/${comparison.salary2.company.slug}`} className="text-2xl font-black text-zinc-900 hover:text-rose-500 hover:underline">
                  {comparison.salary2.company.name}
                </Link>
                <p className="text-base font-bold text-zinc-600 mt-1">{comparison.salary2.role}</p>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-zinc-100 text-zinc-800">
                    {mapLevelToBadge(comparison.salary2.level)}
                  </span>
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-zinc-50 text-zinc-500 border border-zinc-200">
                    {comparison.salary2.location}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Total Compensation
                  </span>
                  <div className="text-3xl font-black text-rose-500 font-mono">
                    {formatSalaryCompact(Number(comparison.salary2.total_compensation), comparison.salary2.currency)}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Base Salary</span>
                    <span className="text-sm font-semibold text-zinc-800 font-mono">
                      {formatSalaryCompact(Number(comparison.salary2.base_salary), comparison.salary2.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Bonus</span>
                    <span className="text-sm font-semibold text-zinc-800 font-mono">
                      {formatSalaryCompact(Number(comparison.salary2.bonus), comparison.salary2.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Stock / Yr</span>
                    <span className="text-sm font-semibold text-zinc-800 font-mono">
                      {formatSalaryCompact(Number(comparison.salary2.stock), comparison.salary2.currency)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Experience</span>
                  <span className="text-sm font-semibold text-zinc-700">{comparison.salary2.experience_years} Years</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 flex justify-between">
                <Link href={`/compare?s1=${s1Id || ""}`} className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition">
                  Remove record
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Selection Area */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
              Select verified records to compare
            </h2>
          </div>
          <div className="divide-y divide-zinc-100 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                  <th className="px-6 py-3">Company</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Level</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3 text-right">Total Comp</th>
                  <th className="px-6 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs font-semibold">
                {recentSalaries.map((s) => (
                  <tr key={s.id} className="hover:bg-zinc-50/30 transition-colors">
                    <td className="px-6 py-3.5 text-zinc-950 font-bold">{s.company.name}</td>
                    <td className="px-6 py-3.5 text-zinc-600">{s.role}</td>
                    <td className="px-6 py-3.5 text-zinc-500">{mapLevelToBadge(s.level)}</td>
                    <td className="px-6 py-3.5 text-zinc-400">{s.location}</td>
                    <td className="px-6 py-3.5 text-right font-mono text-rose-500 font-bold">
                      {formatSalaryCompact(Number(s.total_compensation), s.currency)}
                    </td>
                    <td className="px-6 py-3.5 text-center flex items-center justify-center gap-4">
                      {s1Id === s.id ? (
                        <span className="text-[10px] text-zinc-400 border border-zinc-200 rounded px-2 py-0.5 bg-zinc-50">
                          Selected S1
                        </span>
                      ) : (
                        <Link
                          href={getSelectionUrl(s.id, "s1")}
                          className="text-[10px] text-rose-500 hover:text-white border border-rose-200 hover:bg-rose-500 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          Select S1
                        </Link>
                      )}
                      {s2Id === s.id ? (
                        <span className="text-[10px] text-zinc-400 border border-zinc-200 rounded px-2 py-0.5 bg-zinc-50">
                          Selected S2
                        </span>
                      ) : (
                        <Link
                          href={getSelectionUrl(s.id, "s2")}
                          className="text-[10px] text-zinc-700 hover:text-white border border-zinc-300 hover:bg-zinc-700 px-2 py-0.5 rounded transition cursor-pointer"
                        >
                          Select S2
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
