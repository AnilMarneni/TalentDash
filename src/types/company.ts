import { Salary } from "./salary";

export interface Company {
  id: string;
  name: string;
  slug: string;
  normalized_name: string;
  industry: string;
  headquarters: string;
  founded_year?: number | null;
  headcount_range?: string | null;
  created_at: string | Date;
  updated_at: string | Date;
}

export interface LevelDistributionItem {
  level: string;
  count: number;
  median_compensation: number;
  average_compensation: number;
}

export interface CompanyDetails {
  company: Company;
  salaries: Salary[];
  median_total_compensation: number;
  level_distribution: LevelDistributionItem[];
  min_compensation: number;
  max_compensation: number;
  records_count: number;
}
