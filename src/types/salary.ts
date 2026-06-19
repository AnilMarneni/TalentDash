import { Level, Currency, Source } from "../generated/prisma/client";

export interface Salary {
  id: string;
  company_id: string;
  role: string;
  level: Level;
  location: string;
  currency: Currency;
  experience_years: number;
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  source: Source;
  confidence_score: number;
  is_verified: boolean;
  submitted_at: string | Date;
}

export interface SalaryWithCompany extends Salary {
  company: {
    id: string;
    name: string;
    slug: string;
    normalized_name: string;
    industry: string;
    headquarters: string;
    founded_year?: number | null;
    headcount_range?: string | null;
  };
}
