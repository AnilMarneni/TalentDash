import { z } from "zod";
import { Level, Currency, Source } from "../../generated/prisma/client";

export const IngestSalarySchema = z.object({
  company: z.string().min(1, "Company name is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  level: z.nativeEnum(Level),
  location: z.string().min(1, "Location is required").max(100),
  currency: z.nativeEnum(Currency),
  experience_years: z
    .number()
    .int()
    .min(1, "Experience years must be at least 1")
    .max(50, "Experience years cannot exceed 50"),
  base_salary: z.number().positive("Base salary must be greater than 0"),
  bonus: z.number().nonnegative("Bonus cannot be negative").default(0),
  stock: z.number().nonnegative("Stock cannot be negative").default(0),
  source: z.nativeEnum(Source).default(Source.CONTRIBUTOR),
  confidence_score: z
    .number()
    .min(0, "Confidence score must be at least 0")
    .max(1, "Confidence score cannot exceed 1")
    .default(1.0),
});

export type IngestSalaryInput = z.infer<typeof IngestSalarySchema>;
export const IngestSalaryResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
});
