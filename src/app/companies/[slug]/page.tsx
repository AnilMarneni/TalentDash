import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";
import { getCompanyBySlug } from "../../../lib/queries/companies";
import LevelDistributionChart from "../../../components/companies/LevelDistributionChart";
import { formatSalaryCompact, mapLevelToBadge, mapLevelToColor } from "../../../lib/ui-helpers";
import { generateSeoMetadata, generateCompanyJsonLd } from "../../../lib/seo";

export const revalidate = 3600; // Static generation revalidation every 1 hour

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({
    select: { slug: true },
  });

  return companies.map((c) => ({
    slug: c.slug,
  }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params;
  const companyDetails = await getCompanyBySlug(slug);
  
  if (!companyDetails) return {};

  return generateSeoMetadata({
    title: `${companyDetails.company.name} Salary Intelligence`,
    description: `See verified compensation ranges, median salary, and engineering level distribution at ${companyDetails.company.name}.`,
    path: `/companies/${slug}`,
  });
}

export default async function CompanySlugPage(props: PageProps) {
  const { slug } = await props.params;
  const companyDetails = await getCompanyBySlug(slug);

  if (!companyDetails) {
    notFound();
  }

  const {
    company,
    salaries,
    median_total_compensation,
    level_distribution,
    min_compensation,
    max_compensation,
    records_count,
  } = companyDetails;

  const currencies = salaries.map((s) => s.currency);
  const primaryCurrency = currencies.reduce(
    (a, b, _, arr) =>
      arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
    currencies[0] || "INR"
  );

  return (
    <div className="flex-1 bg-zinc-50/50 min-h-screen">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateCompanyJsonLd(company, median_total_compensation, records_count)}
      />

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumbs */}
        <div className="mb-4 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
          <Link href="/salaries" className="hover:text-zinc-600 transition-colors">
            Companies
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-600">{company.name}</span>
        </div>

        {/* Company Header Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs mb-6">
          <h1 className="text-2xl font-bold text-zinc-950 tracking-tight">{company.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {company.industry}
            </span>
            <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
              HQ: {company.headquarters}
            </span>
            {company.founded_year && (
              <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Founded: {company.founded_year}
              </span>
            )}
            {company.headcount_range && (
              <span className="bg-zinc-50 border border-zinc-200 text-zinc-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                Size: {company.headcount_range} Employees
              </span>
            )}
          </div>
        </div>

        {/* 4-Card Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Median Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Median Compensation
            </span>
            <div className="text-2xl font-black text-rose-600 font-mono tracking-tight">
              {formatSalaryCompact(median_total_compensation, primaryCurrency)}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block font-medium">
              Midpoint of all salary records
            </span>
          </div>

          {/* Highest Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Highest Compensation
            </span>
            <div className="text-2xl font-bold text-zinc-900 font-mono tracking-tight">
              {formatSalaryCompact(max_compensation, primaryCurrency)}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block font-medium">
              Maximum total package reported
            </span>
          </div>

          {/* Lowest Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Lowest Compensation
            </span>
            <div className="text-2xl font-bold text-zinc-900 font-mono tracking-tight">
              {formatSalaryCompact(min_compensation, primaryCurrency)}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block font-medium">
              Minimum total package reported
            </span>
          </div>

          {/* Salary Count Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">
              Salary Count
            </span>
            <div className="text-2xl font-black text-zinc-900 tracking-tight">
              {records_count}
            </div>
            <span className="text-[10px] text-zinc-500 mt-1 block font-medium">
              Total verified data points
            </span>
          </div>
        </div>

        {salaries.length === 0 ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-12 text-center max-w-md mx-auto my-12 shadow-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-50 border border-zinc-300 mb-4 text-zinc-500 text-lg">
              📊
            </div>
            <h3 className="text-sm font-bold text-zinc-900 mb-1">No salary records available</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              There are currently no verified salary records in our database for {company.name}.
            </p>
          </div>
        ) : (
          <>
            {/* Charts & Distributions */}
            {level_distribution.length > 0 && (
              <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs mb-6">
                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">Compensation By Level</h2>
                <LevelDistributionChart data={level_distribution} currency={primaryCurrency} />
              </div>
            )}

            {/* Salaries Table */}
            <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-6 py-3.5 border-b border-zinc-200/60 bg-zinc-50/50 flex justify-between items-center text-xs">
                <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  {company.name} Salary Records
                </h2>
                <span className="font-semibold text-zinc-700">
                  Sorted by Total Comp
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="sticky top-0 bg-white border-b border-zinc-200 text-[10px] font-bold text-zinc-500 uppercase tracking-wider z-10 shadow-[0_1px_0_0_rgba(228,228,231,0.6)]">
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
                    {salaries.map((item) => (
                      <tr key={item.id} className="hover:bg-zinc-50/50 even:bg-zinc-50/[0.1] transition-colors">
                        <td className="px-6 py-3.5 text-zinc-900 font-bold">{item.role}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${mapLevelToColor(item.level)}`}>
                            {mapLevelToBadge(item.level)}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-zinc-650">{item.location}</td>
                        <td className="px-6 py-3.5 text-center font-mono text-zinc-600">{item.experience_years} yrs</td>
                        <td className="px-6 py-3.5 text-right font-mono text-zinc-800">
                          {formatSalaryCompact(Number(item.base_salary), item.currency)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-zinc-500">
                          {formatSalaryCompact(Number(item.bonus), item.currency)}
                        </td>
                        <td className="px-6 py-3.5 text-right font-mono text-zinc-800">
                          {formatSalaryCompact(Number(item.stock), item.currency)}
                        </td>
                        {/* Total Comp Highlight */}
                        <td className="px-6 py-3.5 text-right font-mono font-black text-rose-600 text-sm bg-rose-500/[0.015]">
                          {formatSalaryCompact(Number(item.total_compensation), item.currency)}
                        </td>
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
            </div>
          </>
        )}
      </main>
    </div>
  );
}
