import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/altuq/mock';

export async function GET() {
    await new Promise(resolve => setTimeout(resolve, 100)); // Latency sim
    return NextResponse.json(mockStore.signals);
}
