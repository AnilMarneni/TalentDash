import { NextRequest, NextResponse } from "next/server";
import { getComparison } from "../../../lib/queries/compare";
import { serializeBigInt } from "../../../lib/serialization";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const s1 = searchParams.get("s1");
    const s2 = searchParams.get("s2");

    if (!s1 || !s2) {
      return NextResponse.json(
        { error: "Two salary IDs (s1 and s2) are required for comparison" },
        { status: 400 }
      );
    }

    const comparisonResult = await getComparison(s1, s2);

    if (!comparisonResult) {
      return NextResponse.json(
        { error: "One or both salary records could not be found" },
        { status: 404 }
      );
    }

    const serializedResult = serializeBigInt(comparisonResult);

    return NextResponse.json(serializedResult, { status: 200 });
  } catch (error: any) {
    console.error("GET compare API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
