import { prisma } from "./db";

interface DedupeCheckParams {
  companyId: string;
  role: string;
  level: any; // Level enum
  location: string;
  totalCompensation: number;
}

export async function isDuplicateSalary(params: DedupeCheckParams): Promise<boolean> {
  const { companyId, role, level, location, totalCompensation } = params;

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Fetch matches from the database submitted in the last 48 hours
  const potentialDuplicates = await prisma.salary.findMany({
    where: {
      company_id: companyId,
      role: { equals: role, mode: "insensitive" },
      level: level,
      location: { equals: location, mode: "insensitive" },
      submitted_at: {
        gte: fortyEightHoursAgo,
      },
    },
  });

  // Check if total compensation is within 10% of any existing record
  for (const record of potentialDuplicates) {
    const existingTC = Number(record.total_compensation);
    const diff = Math.abs(totalCompensation - existingTC);
    const limit = existingTC * 0.1;
    if (diff <= limit) {
      return true;
    }
  }

  return false;
}
