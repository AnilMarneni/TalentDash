import { Level } from "../generated/prisma/client";
import { LevelDistributionItem } from "../types/company";

interface SalaryLike {
  level: Level;
  total_compensation: number | bigint;
}

export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function calculateLevelDistribution(salaries: SalaryLike[]): LevelDistributionItem[] {
  const groups: Record<string, number[]> = {};
  
  for (const s of salaries) {
    const levelStr = String(s.level);
    if (!groups[levelStr]) {
      groups[levelStr] = [];
    }
    groups[levelStr].push(Number(s.total_compensation));
  }

  const distribution: LevelDistributionItem[] = [];
  
  for (const level in groups) {
    const comps = groups[level];
    const count = comps.length;
    const median = calculateMedian(comps);
    const sum = comps.reduce((a, b) => a + b, 0);
    const average = Math.round(sum / count);

    distribution.push({
      level,
      count,
      median_compensation: median,
      average_compensation: average,
    });
  }

  return distribution.sort((a, b) => b.median_compensation - a.median_compensation);
}
