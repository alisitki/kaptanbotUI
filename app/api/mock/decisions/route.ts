import { getMockDecisions } from "@/lib/mock";
import { NextResponse } from "next/server";

export async function GET() {
    const data = getMockDecisions();
    return NextResponse.json(data);
}
