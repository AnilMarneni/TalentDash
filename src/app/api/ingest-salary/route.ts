import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { IngestSalarySchema } from "../../../lib/validations/salary.schema";
import { isDuplicateSalary } from "../../../lib/dedupe";
import { serializeBigInt } from "../../../lib/serialization";
import slugify from "slugify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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

    const totalCompensation = base_salary + bonus + stock;
    const normalizedName = companyName.trim().toLowerCase();
    const companySlug = slugify(companyName, { lower: true, strict: true });

    let company = await prisma.company.findUnique({
      where: { normalized_name: normalizedName },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName.trim(),
          slug: companySlug,
          normalized_name: normalizedName,
          industry: "Technology",
          headquarters: "Remote",
        },
      });
    }

    const duplicate = await isDuplicateSalary({
      company_id: company.id,
      role,
      level,
      location,
      total_compensation: totalCompensation,
    });

    if (duplicate) {
      return NextResponse.json(
        { error: "Duplicate submission. A similar salary record was submitted in the last 48 hours." },
        { status: 409 }
      );
    }

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
  } catch (error) {
    console.error("Ingest salary error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", message },
      { status: 500 }
    );
  }
}
