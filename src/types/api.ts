import { Salary, SalaryWithCompany } from "./salary";

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SalariesApiResponse {
  metadata: PaginatedMeta;
  data: SalaryWithCompany[];
}

export interface SalaryDelta {
  base_salary: number;
  bonus: number;
  stock: number;
  total_compensation: number;
  experience_years: number;
}

export interface SalaryCompareResponse {
  salary1: SalaryWithCompany;
  salary2: SalaryWithCompany;
  delta: SalaryDelta;
}
