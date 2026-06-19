import { prisma } from "../db";
import { Level, Currency } from "../../generated/prisma/client";

export interface GetSalariesParams {
  company?: string;
  role?: string;
  level?: string;
  location?: string;
  currency?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export async function getSalaries(params: GetSalariesParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 25));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.company) {
    where.company = {
      OR: [
        { slug: { equals: params.company, mode: "insensitive" } },
        { name: { contains: params.company, mode: "insensitive" } },
      ],
    };
  }

  if (params.role) {
    where.role = { equals: params.role, mode: "insensitive" };
  }

  if (params.level) {
    if (Object.values(Level).includes(params.level as Level)) {
      where.level = params.level as Level;
    }
  }

  if (params.location) {
    where.location = { equals: params.location, mode: "insensitive" };
  }

  if (params.currency) {
    if (Object.values(Currency).includes(params.currency as Currency)) {
      where.currency = params.currency as Currency;
    }
  }

  let orderBy: any = { total_compensation: "desc" };
  if (params.sort === "total_comp_asc") {
    orderBy = { total_compensation: "asc" };
  } else if (params.sort === "date_desc") {
    orderBy = { submitted_at: "desc" };
  }

  const [total, data] = await Promise.all([
    prisma.salary.count({ where }),
    prisma.salary.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        company: true,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    metadata: {
      total,
      page,
      limit,
      totalPages,
    },
    data,
  };
}
