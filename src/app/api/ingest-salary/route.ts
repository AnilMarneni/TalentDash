import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { IngestSalarySchema } from "../../../lib/validations/salary.schema";
import { isDuplicateSalary } from "../../../lib/dedupe";
import { serializeBigInt } from "../../../lib/serialization";
import slugify from "slugify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request payload
    const validation = IngestSalarySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.format() },
        { status: 400 }
      );
    }

    const {
      company: companyName,
      role,
      level,
      location,
      currency,
      experience_years,
      base_salary,
      bonus,
      stock,
      source,
      confidence_score,
    } = validation.data;

    // Compute total compensation
    const totalCompensation = base_salary + bonus + stock;

    // Normalize company name & slug
    const normalizedName = companyName.trim().toLowerCase();
    const companySlug = slugify(companyName, { lower: true, strict: true });

    // Look up or create company
    let company = await prisma.company.findUnique({
      where: { normalized_name: normalizedName },
    });

    if (!company) {
      // Create new company record
      company = await prisma.company.create({
        data: {
          name: companyName.trim(),
          slug: companySlug,
          normalized_name: normalizedName,
          industry: "Technology", // default fallback
          headquarters: "Remote", // default fallback
        },
      });
    }

    // Duplicate Check
    const duplicate = await isDuplicateSalary({
      companyId: company.id,
      role,
      level,
      location,
      totalCompensation,
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Duplicate submission. A similar salary record was submitted in the last 48 hours." },
        { status: 409 }
      );
    }

    // Insert salary record
    const createdSalary = await prisma.salary.create({
      data: {
        company_id: company.id,
        role: role.trim(),
        level,
        location: location.trim(),
        currency,
        experience_years,
        base_salary: BigInt(Math.round(base_salary)),
        bonus: BigInt(Math.round(bonus)),
        stock: BigInt(Math.round(stock)),
        total_compensation: BigInt(Math.round(totalCompensation)),
        source,
        confidence_score: confidence_score.toFixed(2),
        is_verified: false,
        submitted_at: new Date(),
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json(
      { success: true, data: serializeBigInt(createdSalary) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Ingest salary error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
