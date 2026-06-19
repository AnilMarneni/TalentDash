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
  // Query DB directly for static param compilation
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

  // Find the primary currency of this company for overall statistic card display
  const currencies = salaries.map((s) => s.currency);
  const primaryCurrency = currencies.reduce(
    (a, b, _, arr) =>
      arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
    currencies[0] || "INR"
  );

  return (
    <div className="flex-1 bg-zinc-50 min-h-screen">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={generateCompanyJsonLd(company, median_total_compensation, records_count)}
      />

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
              <Link href="/compare" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 transition">
                Compare
              </Link>
            </nav>
          </div>
          <div>
            <Link
              href="/salaries"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Browse All
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumbs */}
        <div className="mb-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Link href="/salaries" className="hover:text-zinc-600 transition">
            Companies
          </Link>
          <span>/</span>
          <span className="text-zinc-600">{company.name}</span>
        </div>

        {/* Company Header Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-zinc-950 tracking-tight">{company.name}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-sm text-zinc-500">
              <span className="font-medium text-zinc-700">{company.industry}</span>
              <span className="text-zinc-300">•</span>
              <span>HQ: {company.headquarters}</span>
              {company.founded_year && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>Founded: {company.founded_year}</span>
                </>
              )}
              {company.headcount_range && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>Size: {company.headcount_range} Employees</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Median Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Median Total Compensation
            </span>
            <div className="text-3xl font-black text-rose-500 font-mono">
              {formatSalaryCompact(median_total_compensation, primaryCurrency)}
            </div>
            <span className="text-xs text-zinc-400 mt-2 block font-medium">
              Representative of {primaryCurrency} postings
            </span>
          </div>

          {/* Min/Max Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Compensation Range (Min - Max)
            </span>
            <div className="text-xl font-bold text-zinc-950 font-mono">
              {formatSalaryCompact(min_compensation, primaryCurrency)} - {formatSalaryCompact(max_compensation, primaryCurrency)}
            </div>
            <span className="text-xs text-zinc-400 mt-2 block font-medium">
              Based on the spread of records
            </span>
          </div>

          {/* Record Count Card */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
              Verified Postings
            </span>
            <div className="text-3xl font-black text-zinc-900">
              {records_count}
            </div>
            <span className="text-xs text-zinc-400 mt-2 block font-medium">
              Independently verified records
            </span>
          </div>
        </div>

        {/* Charts & Distributions */}
        {level_distribution.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-bold text-zinc-950 mb-4 tracking-tight">Compensation By Level</h2>
            <LevelDistributionChart data={level_distribution} currency={primaryCurrency} />
          </div>
        )}

        {/* Salaries Table */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">
              {company.name} Salaries
            </h2>
            <span className="text-xs text-zinc-400 font-semibold uppercase">
              Sorted by Total Comp
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-50/50">
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
                {salaries.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 text-zinc-950 font-semibold">{item.role}</td>
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
                    <td className="px-6 py-4 text-right font-bold text-base text-rose-500 font-mono">
                      {formatSalaryCompact(Number(item.total_compensation), item.currency)}
                    </td>
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
        </div>
      </main>
    </div>
  );
}
