import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/altuq/mock';

export async function GET() {
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 50));

    return NextResponse.json(mockStore.state);
}
