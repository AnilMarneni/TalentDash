import { PrismaNeonHttp } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

const databaseUrl = process.env.DATABASE_URL || "";
// Strip channel_binding=require to prevent connection failure with serverless driver
const cleanedUrl = databaseUrl
  .replace("channel_binding=require", "")
  .replace("?&", "?")
  .replace("&&", "&")
  .replace(/&\s*$/, "")
  .replace(/\?\s*$/, "");

if (process.env.NODE_ENV === "production") {
  const adapter = new PrismaNeonHttp(cleanedUrl, {} as any);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const adapter = new PrismaNeonHttp(cleanedUrl, {} as any);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
