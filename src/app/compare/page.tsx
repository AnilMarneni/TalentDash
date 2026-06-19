import { Metadata } from "next";
import Link from "next/link";
import { getComparison } from "../../lib/queries/compare";
import { getSalaries } from "../../lib/queries/salaries";
import { formatSalaryCompact, mapLevelToBadge, mapLevelToColor } from "../../lib/ui-helpers";
import { generateSeoMetadata } from "../../lib/seo";

interface PageProps {
  searchParams: Promise<{
    s1?: string;
    s2?: string;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
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
  try {
    const searchParams = await props.searchParams;
    const s1Id = searchParams.s1;
    const s2Id = searchParams.s2;

    const comparison = s1Id && s2Id ? await getComparison(s1Id, s2Id) : null;
    const { data: recentSalaries } = await getSalaries({ limit: 15 });

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

    let s1Winner = false;
    let s2Winner = false;
    if (comparison) {
      const s1Val = getNormalizedUSD(Number(comparison.salary1.total_compensation), comparison.salary1.currency);
      const s2Val = getNormalizedUSD(Number(comparison.salary2.total_compensation), comparison.salary2.currency);
      if (s1Val > s2Val) s1Winner = true;
      if (s2Val > s1Val) s2Winner = true;
    }

    function renderDelta(value: number, currency: string, isBig: boolean = false) {
      if (value > 0) {
        return (
          <span className={`inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded font-mono font-bold ${isBig ? "text-base" : "text-xs"}`}>
            +{formatSalaryCompact(value, currency)}
          </span>
        );
      } else if (value < 0) {
        return (
          <span className={`inline-flex items-center text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded font-mono font-bold ${isBig ? "text-base" : "text-xs"}`}>
            -{formatSalaryCompact(Math.abs(value), currency)}
          </span>
        );
      }
      return <span className="text-zinc-400 font-medium font-mono text-xs">--</span>;
    }

    return (
      <div className="flex-1 bg-zinc-50/50 min-h-screen">
        <main className="max-w-7xl mx-auto px-6 py-6">
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold text-zinc-950 tracking-tight">Salary Comparison Engine</h1>
            <p className="text-xs text-zinc-500 mt-0.5 font-medium">
              Compare two offer packages side-by-side to analyze deltas in base salary, bonus, and stock.
            </p>
          </div>

          {/* Side-by-side Comparison Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 mb-8 items-stretch">
            {/* Card A */}
            <div className="lg:col-span-3 flex">
              {comparison ? (
                <div className={`w-full bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition-all ${
                  s1Winner ? "border-rose-500 ring-1 ring-rose-500/10 shadow-xs" : "border-zinc-200"
                }`}>
                  {s1Winner && (
                    <span className="absolute -top-2.5 left-4 bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                      🏆 Higher Compensation
                    </span>
                  )}
                  
                  <div>
                    <div className="mb-4">
                      <Link
                        href={`/companies/${comparison.salary1.company.slug}`}
                        className="text-lg font-bold text-zinc-950 hover:text-rose-600 hover:underline transition-colors"
                      >
                        {comparison.salary1.company.name}
                      </Link>
                      <p className="text-xs font-semibold text-zinc-600 mt-0.5">{comparison.salary1.role}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${mapLevelToColor(comparison.salary1.level)}`}>
                          {mapLevelToBadge(comparison.salary1.level)}
                        </span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-50 text-zinc-600 border border-zinc-300">
                          {comparison.salary1.location}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-zinc-100">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">
                          Total Compensation
                        </span>
                        <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                          {formatSalaryCompact(Number(comparison.salary1.total_compensation), comparison.salary1.currency)}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Base</span>
                          <span className="text-xs font-semibold text-zinc-950 font-mono">
                            {formatSalaryCompact(Number(comparison.salary1.base_salary), comparison.salary1.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Bonus</span>
                          <span className="text-xs font-semibold text-zinc-950 font-mono">
                            {formatSalaryCompact(Number(comparison.salary1.bonus), comparison.salary1.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Stock</span>
                          <span className="text-xs font-semibold text-zinc-950 font-mono">
                            {formatSalaryCompact(Number(comparison.salary1.stock), comparison.salary1.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[9px] font-bold text-zinc-650 uppercase tracking-wider block">Experience</span>
                        <span className="text-xs font-semibold text-zinc-950 mt-0.5 block">{comparison.salary1.experience_years} years</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-between">
                    <Link
                      href={`/compare?${s2Id ? `s2=${s2Id}` : ""}`}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                      Remove package
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-white border border-zinc-200 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[320px] shadow-xs">
                  <div className="text-2xl mb-2 text-zinc-300">⚖️</div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Slot A: Empty</h3>
                  <p className="text-[11px] text-zinc-600 max-w-[200px] leading-normal">
                    Select a salary record from the list below to begin comparison.
                  </p>
                </div>
              )}
            </div>

            {/* Deltas Card (Middle Divider) */}
            <div className="lg:col-span-1 flex items-stretch">
              {comparison ? (
                <div className="w-full bg-white border border-zinc-200 rounded-xl p-5 shadow-xs flex flex-col items-center justify-center text-center gap-5 self-stretch min-h-[320px]">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">
                      Deltas
                    </span>
                    <span className="text-[9px] text-zinc-500 block font-semibold">(Slot A vs B)</span>
                  </div>

                  <div className="space-y-4 w-full">
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Total Comp</span>
                      {renderDelta(comparison.delta.total_compensation, comparison.salary1.currency, true)}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Base</span>
                      {renderDelta(comparison.delta.base_salary, comparison.salary1.currency)}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Bonus</span>
                      {renderDelta(comparison.delta.bonus, comparison.salary1.currency)}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Stock</span>
                      {renderDelta(comparison.delta.stock, comparison.salary1.currency)}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Experience</span>
                      <span className="text-xs font-bold font-mono text-zinc-800 bg-zinc-50 border border-zinc-300 px-1.5 py-0.5 rounded">
                        {comparison.delta.experience_years > 0 ? `+${comparison.delta.experience_years}` : comparison.delta.experience_years} yrs
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full border border-transparent rounded-xl flex items-center justify-center text-center min-h-[100px] lg:min-h-0">
                  <span className="text-xs font-black text-zinc-500 tracking-wider">VS</span>
                </div>
              )}
            </div>

            {/* Card B */}
            <div className="lg:col-span-3 flex">
              {comparison ? (
                <div className={`w-full bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between relative transition-all ${
                  s2Winner ? "border-rose-500 ring-1 ring-rose-500/10 shadow-xs" : "border-zinc-200"
                }`}>
                  {s2Winner && (
                    <span className="absolute -top-2.5 left-4 bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                      🏆 Higher Compensation
                    </span>
                  )}
                  
                  <div>
                    <div className="mb-4">
                      <Link
                        href={`/companies/${comparison.salary2.company.slug}`}
                        className="text-lg font-bold text-zinc-950 hover:text-rose-600 hover:underline transition-colors"
                      >
                        {comparison.salary2.company.name}
                      </Link>
                      <p className="text-xs font-semibold text-zinc-600 mt-0.5">{comparison.salary2.role}</p>
                      <div className="flex gap-1.5 mt-2">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border ${mapLevelToColor(comparison.salary2.level)}`}>
                          {mapLevelToBadge(comparison.salary2.level)}
                        </span>
                        <span className="inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-50 text-zinc-600 border border-zinc-300">
                          {comparison.salary2.location}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3.5 pt-4 border-t border-zinc-100">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">
                          Total Compensation
                        </span>
                        <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
                          {formatSalaryCompact(Number(comparison.salary2.total_compensation), comparison.salary2.currency)}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Base</span>
                          <span className="text-xs font-semibold text-zinc-950 font-mono">
                            {formatSalaryCompact(Number(comparison.salary2.base_salary), comparison.salary2.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Bonus</span>
                          <span className="text-xs font-semibold text-zinc-950 font-mono">
                            {formatSalaryCompact(Number(comparison.salary2.bonus), comparison.salary2.currency)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Stock</span>
                          <span className="text-xs font-semibold text-zinc-950 font-mono">
                            {formatSalaryCompact(Number(comparison.salary2.stock), comparison.salary2.currency)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider block">Experience</span>
                        <span className="text-xs font-semibold text-zinc-900 mt-0.5 block">{comparison.salary2.experience_years} years</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 flex justify-between">
                    <Link
                      href={`/compare?${s1Id ? `s1=${s1Id}` : ""}`}
                      className="text-[10px] font-bold text-zinc-500 hover:text-zinc-700 transition-colors"
                    >
                      Remove package
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-white border border-zinc-200 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[320px] shadow-xs">
                  <div className="text-2xl mb-2 text-zinc-300">⚖️</div>
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Slot B: Empty</h3>
                  <p className="text-[11px] text-zinc-600 max-w-[200px] leading-normal">
                    Select a second salary record from the list below to complete comparison.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Selector Table */}
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-3.5 border-b border-zinc-200/60 bg-zinc-50/50">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                Select verified records to compare
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="sticky top-0 bg-white border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider z-10 shadow-[0_1px_0_0_rgba(228,228,231,0.6)]">
                    <th className="px-6 py-3.5">Company</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Level</th>
                    <th className="px-6 py-3.5">Location</th>
                    <th className="px-6 py-3.5 text-right text-zinc-900 font-bold bg-rose-500/[0.01]">Total Comp</th>
                    <th className="px-6 py-3.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs font-semibold text-zinc-600">
                  {recentSalaries.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-50/50 even:bg-zinc-50/[0.1] transition-colors">
                      <td className="px-6 py-3.5 text-zinc-900 font-bold">{s.company.name}</td>
                      <td className="px-6 py-3.5 text-zinc-800 font-medium">{s.role}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${mapLevelToColor(s.level)}`}>
                          {mapLevelToBadge(s.level)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-zinc-650">{s.location}</td>
                      <td className="px-6 py-3.5 text-right font-mono text-rose-600 font-bold bg-rose-500/[0.015]">
                        {formatSalaryCompact(Number(s.total_compensation), s.currency)}
                      </td>
                      <td className="px-6 py-3.5 text-center flex items-center justify-center gap-3">
                        {s1Id === s.id ? (
                          <span className="text-[9px] text-zinc-600 border border-zinc-300 rounded px-2 py-0.5 bg-zinc-100/50 font-bold">
                            Selected S1
                          </span>
                        ) : (
                          <Link
                            href={getSelectionUrl(s.id, "s1")}
                            className="text-[9px] text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white border border-rose-200 px-2 py-0.5 rounded transition font-bold"
                          >
                            Select S1
                          </Link>
                        )}
                        {s2Id === s.id ? (
                          <span className="text-[9px] text-zinc-600 border border-zinc-300 rounded px-2 py-0.5 bg-zinc-100/50 font-bold">
                            Selected S2
                          </span>
                        ) : (
                          <Link
                            href={getSelectionUrl(s.id, "s2")}
                            className="text-[9px] text-zinc-700 bg-zinc-50 hover:bg-zinc-800 hover:text-white border border-zinc-300 px-2 py-0.5 rounded transition font-bold"
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
  } catch (err: any) {
    return (
      <main className="max-w-7xl w-full mx-auto px-6 py-12 flex-1">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-rose-900 shadow-sm">
          <h2 className="text-sm font-bold mb-2">TalentDash Diagnostic Console</h2>
          <p className="text-xs font-semibold">
            An error occurred while querying the database.
          </p>
          <div className="mt-4 p-4 bg-white border border-rose-100 rounded-lg text-xs font-mono text-rose-700 overflow-auto whitespace-pre-wrap">
            Error: {err.message || String(err)}
          </div>
          {err.stack && (
            <pre className="text-[10px] font-mono text-zinc-500 mt-4 overflow-auto max-h-60 whitespace-pre p-4 bg-zinc-50 rounded-lg border border-zinc-200">
              {err.stack}
            </pre>
          )}
        </div>
      </main>
    );
  }
}
