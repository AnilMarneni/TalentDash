import { Metadata } from "next";
import { getSalaries } from "../../lib/queries/salaries";
import SalariesContainer from "../../components/salaries/SalariesContainer";
import { generateSeoMetadata } from "../../lib/seo";
import { serializeBigInt } from "../../lib/serialization";
import { SalaryWithCompany } from "../../types/salary";

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

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: "Salary Intelligence Browser",
    description: "Browse verified, structured tech salaries across leading companies. Filter by role, level, location, and compare total compensation bands.",
    path: "/salaries",
  });
}

export default async function SalariesPage(props: PageProps) {
  try {
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

    const serializedData = serializeBigInt(data) as SalaryWithCompany[];

    return (
      <main className="max-w-7xl w-full mx-auto px-6 py-6 flex-1">
        {/* Title Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-zinc-950 tracking-tight">Salary Browser</h1>
          <p className="text-xs text-zinc-500 mt-0.5 font-medium">
            Browse verified, structured career compensation datasets. Compare base salary, bonus, and stock components.
          </p>
        </div>

        {/* Unified Search Filter & Results Container */}
        <SalariesContainer
          initialData={serializedData}
          metadata={metadata}
          pageNum={pageNum}
        />
      </main>
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
