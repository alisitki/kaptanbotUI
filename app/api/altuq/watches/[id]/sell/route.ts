import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/altuq/mock';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ params async
) {
    const { id } = await params;

    const result = mockStore.sellWatch(id);

    if (!result) {
        return NextResponse.json({ error: "Watch not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, watch: result });
}
