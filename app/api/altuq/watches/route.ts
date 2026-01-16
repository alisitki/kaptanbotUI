import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/altuq/mock';

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 80));
    return NextResponse.json(mockStore.watches);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { symbol, amount, tp_mode, tp_percent, trailing_step } = body;

    const newWatch = mockStore.addWatch(symbol, Number(amount), tp_mode, Number(tp_percent), Number(trailing_step));

    return NextResponse.json(newWatch);
}
