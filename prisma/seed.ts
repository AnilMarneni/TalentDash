import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient, Level, Currency, Source } from "../src/generated/prisma/client";
import { companies } from "../src/lib/seed-data";
import { COMPANY_TIERS } from "../src/lib/company-tiers";
import { SALARY_BANDS } from "../src/lib/salary-bands";
import { LOCATIONS, ROLES } from "../src/lib/constants";
import { LEVEL_DISTRIBUTION } from "../src/lib/seed-config";
import { randomNumber, varySalary } from "../src/lib/helpers";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const USD_BANDS = {
  tier1: {
    L3: 130000,
    L4: 180000,
    L5: 250000,
    L6: 350000,
    STAFF: 480000,
    PRINCIPAL: 600000,
  },
  tier2: {
    L3: 110000,
    L4: 150000,
    L5: 200000,
    L6: 280000,
    STAFF: 380000,
    PRINCIPAL: 500000,
  },
  tier3: {
    L3: 80000,
    L4: 110000,
    L5: 140000,
    L6: 180000,
    STAFF: 240000,
    PRINCIPAL: 300000,
  },
} as const;

const GBP_BANDS = {
  tier1: {
    L3: 70000,
    L4: 90000,
    L5: 120000,
    L6: 160000,
    STAFF: 200000,
    PRINCIPAL: 280000,
  },
  tier2: {
    L3: 60000,
    L4: 75000,
    L5: 100000,
    L6: 130000,
    STAFF: 165000,
    PRINCIPAL: 220000,
  },
  tier3: {
    L3: 40000,
    L4: 50000,
    L5: 65000,
    L6: 80000,
    STAFF: 105000,
    PRINCIPAL: 140000,
  },
} as const;

async function main() {
  console.log("Cleaning database...");
  await prisma.salary.deleteMany({});
  await prisma.company.deleteMany({});
  console.log("Database cleaned.");

  console.log("Seeding companies...");
  const createdCompanies = [];
  for (const company of companies) {
    const created = await prisma.company.create({
      data: {
        name: company.name,
        slug: company.slug,
        normalized_name: company.normalized_name,
        industry: company.industry,
        headquarters: company.headquarters,
        founded_year: company.founded_year,
        headcount_range: company.headcount_range,
      },
    });
    createdCompanies.push(created);
  }
  console.log(`Seeded ${createdCompanies.length} companies.`);

  console.log("Generating 96 salary records...");
  const totalSalariesToGenerate = 96;
  const records = [];

  for (let i = 0; i < totalSalariesToGenerate; i++) {
    // Pick company sequentially to ensure even distribution (8 per company)
    const company = createdCompanies[i % createdCompanies.length];
    
    // Get company tier
    const tierKey = company.slug as keyof typeof COMPANY_TIERS;
    const tier = COMPANY_TIERS[tierKey] || "tier3";

    // Level distribution
    let levelStr = LEVEL_DISTRIBUTION[randomNumber(0, LEVEL_DISTRIBUTION.length - 1)];
    
    // Role selection
    const role = ROLES[randomNumber(0, ROLES.length - 1)];

    // Location & currency selection
    // 5 India (INR), 2 SF (USD), 1 London (GBP or EUR)
    let location = "Bengaluru";
    let currency: Currency = Currency.INR;

    const locVal = i % 8;
    if (locVal < 5) {
      const indiaLocs = ["Bengaluru", "Hyderabad", "Mumbai", "Pune", "Delhi"];
      location = indiaLocs[locVal];
      currency = Currency.INR;
    } else if (locVal === 5 || locVal === 6) {
      location = "San Francisco";
      currency = Currency.USD;
    } else {
      location = "London";
      // Let's sometimes use EUR and sometimes GBP for London region (since schema has EUR)
      currency = randomNumber(0, 1) === 0 ? Currency.GBP : Currency.EUR;
    }

    // Experience calculation
    let expMin = 1;
    let expMax = 3;
    if (levelStr === "L4") {
      expMin = 3;
      expMax = 6;
    } else if (levelStr === "L5") {
      expMin = 5;
      expMax = 10;
    } else if (levelStr === "L6") {
      expMin = 8;
      expMax = 14;
    } else if (levelStr === "STAFF") {
      expMin = 10;
      expMax = 18;
    } else if (levelStr === "PRINCIPAL") {
      expMin = 12;
      expMax = 25;
    }
    const experienceYears = randomNumber(expMin, expMax);

    // Force edge cases:
    // Case 1: One record with bonus = 0 (record index 10)
    // Case 2: One record with stock = 0 (record index 20)
    // Case 3: One record with extremely high stock (record index 30)
    // Case 4: One PRINCIPAL level record (record index 40)
    if (i === 40) {
      levelStr = "PRINCIPAL";
    }

    // Determine Base Salary based on tier, level, currency
    let baseVal = 0;
    if (currency === Currency.INR) {
      baseVal = SALARY_BANDS[tier][levelStr as keyof typeof SALARY_BANDS[typeof tier]];
    } else if (currency === Currency.USD) {
      baseVal = USD_BANDS[tier][levelStr as keyof typeof USD_BANDS[typeof tier]];
    } else {
      // GBP or EUR
      baseVal = GBP_BANDS[tier][levelStr as keyof typeof GBP_BANDS[typeof tier]];
      if (currency === Currency.EUR) {
        baseVal = Math.round(baseVal * 1.18); // Scale to EUR
      }
    }

    const baseSalary = varySalary(baseVal, 10);

    // Calculate bonus and stock based on tier
    let bonus = 0;
    let stock = 0;

    if (tier === "tier1") {
      bonus = varySalary(Math.round(baseSalary * 0.15), 10);
      stock = varySalary(Math.round(baseSalary * 0.5), 10);
    } else if (tier === "tier2") {
      bonus = varySalary(Math.round(baseSalary * 0.1), 10);
      stock = varySalary(Math.round(baseSalary * 0.25), 10);
    } else {
      bonus = varySalary(Math.round(baseSalary * 0.05), 10);
      stock = varySalary(Math.round(baseSalary * 0.05), 10);
    }

    // Enforce Edge Cases
    if (i === 10) {
      bonus = 0;
    } else if (i === 20) {
      stock = 0;
    } else if (i === 30) {
      // Extremely high stock
      stock = Math.round(baseSalary * 2.5);
    }

    // Enforce total compensation rule: total = base + bonus + stock
    const totalCompensation = baseSalary + bonus + stock;

    // Source selection
    const source = [Source.CONTRIBUTOR, Source.SCRAPED, Source.AI_INFERRED][i % 3];

    // Confidence score
    const confidenceScore = (randomNumber(70, 99) / 100).toFixed(2);

    // Verification status
    const isVerified = i % 4 !== 0; // 75% verified

    // Submitted date: spread over the last 90 days
    const submittedAt = new Date(Date.now() - randomNumber(0, 90) * 24 * 60 * 60 * 1000);

    records.push({
      company_id: company.id,
      role,
      level: levelStr as Level,
      location,
      currency,
      experience_years: experienceYears,
      base_salary: BigInt(baseSalary),
      bonus: BigInt(bonus),
      stock: BigInt(stock),
      total_compensation: BigInt(totalCompensation),
      source,
      confidence_score: confidenceScore,
      is_verified: isVerified,
      submitted_at: submittedAt,
    });
  }

  // Insert all records
  for (const record of records) {
    await prisma.salary.create({
      data: record,
    });
  }

  console.log(`Successfully seeded ${records.length} salary records.`);
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });