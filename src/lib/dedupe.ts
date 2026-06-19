import { Level } from "../generated/prisma/client";
import { prisma } from "./db";

interface DedupeCheckParams {
  company_id: string;
  role: string;
  level: Level;
  location: string;
  total_compensation: number;
}

export async function isDuplicateSalary(params: DedupeCheckParams): Promise<boolean> {
  const { company_id, role, level, location, total_compensation } = params;

  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const potentialDuplicates = await prisma.salary.findMany({
    where: {
      company_id: company_id,
      role: { equals: role, mode: "insensitive" },
      level: level,
      location: { equals: location, mode: "insensitive" },
      submitted_at: {
        gte: fortyEightHoursAgo,
      },
    },
  });

  for (const record of potentialDuplicates) {
    const existingTC = Number(record.total_compensation);
    const diff = Math.abs(total_compensation - existingTC);
    const limit = existingTC * 0.1;
    if (diff <= limit) {
      return true;
    }
  }

  return false;
}
