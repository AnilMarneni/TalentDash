import { prisma } from "../db";

export async function getComparison(id1: string, id2: string) {
  const [s1, s2] = await Promise.all([
    prisma.salary.findUnique({
      where: { id: id1 },
      include: { company: true },
    }),
    prisma.salary.findUnique({
      where: { id: id2 },
      include: { company: true },
    }),
  ]);

  if (!s1 || !s2) return null;

  const delta = {
    base_salary: Number(s1.base_salary - s2.base_salary),
    bonus: Number(s1.bonus - s2.bonus),
    stock: Number(s1.stock - s2.stock),
    total_compensation: Number(s1.total_compensation - s2.total_compensation),
    experience_years: s1.experience_years - s2.experience_years,
  };

  return {
    salary1: s1,
    salary2: s2,
    delta,
  };
}
