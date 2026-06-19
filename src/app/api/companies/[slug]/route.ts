import { NextRequest, NextResponse } from "next/server";
import { getCompanyBySlug } from "../../../../lib/queries/companies";
import { serializeBigInt } from "../../../../lib/serialization";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: "Slug parameter is required" }, { status: 400 });
    }

    const companyDetails = await getCompanyBySlug(slug);

    if (!companyDetails) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const serializedResult = serializeBigInt(companyDetails);

    return new NextResponse(JSON.stringify(serializedResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("GET company slug API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
