import { getMockState } from "@/lib/mock";
import { NextResponse } from "next/server";

export async function GET() {
    const state = getMockState();
    return NextResponse.json(state);
}
