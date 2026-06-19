import { prisma } from "../db";
import { calculateMedian, calculateLevelDistribution } from "../stats";

export async function getCompanyBySlug(slug: string) {
  const company = await prisma.company.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!company) return null;

  const salaries = await prisma.salary.findMany({
    where: { company_id: company.id },
    orderBy: { total_compensation: "desc" },
    include: {
      company: true,
    },
  });

  const tcValues = salaries.map((s) => Number(s.total_compensation));
  const median_total_compensation = calculateMedian(tcValues);
  const min_compensation = tcValues.length > 0 ? Math.min(...tcValues) : 0;
  const max_compensation = tcValues.length > 0 ? Math.max(...tcValues) : 0;
  const records_count = salaries.length;

  const level_distribution = calculateLevelDistribution(salaries);

  return {
    company,
    salaries,
    median_total_compensation,
    level_distribution,
    min_compensation,
    max_compensation,
    records_count,
  };
}
