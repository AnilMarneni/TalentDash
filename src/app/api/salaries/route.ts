import { NextRequest, NextResponse } from "next/server";
import { getSalaries } from "../../../lib/queries/salaries";
import { serializeBigInt } from "../../../lib/serialization";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const company = searchParams.get("company") || undefined;
    const role = searchParams.get("role") || undefined;
    const level = searchParams.get("level") || undefined;
    const location = searchParams.get("location") || undefined;
    const currency = searchParams.get("currency") || undefined;
    const sort = searchParams.get("sort") || undefined;
    
    const pageVal = searchParams.get("page");
    const limitVal = searchParams.get("limit");
    
    const page = pageVal ? parseInt(pageVal, 10) : undefined;
    const limit = limitVal ? parseInt(limitVal, 10) : undefined;

    const result = await getSalaries({
      company,
      role,
      level,
      location,
      currency,
      sort,
      page,
      limit,
    });

    const serializedResult = serializeBigInt(result);

    return new NextResponse(JSON.stringify(serializedResult), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("GET salaries API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
