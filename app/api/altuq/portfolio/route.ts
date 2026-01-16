import { NextResponse } from 'next/server';
import { mockStore } from '@/lib/altuq/mock';

export async function GET() {
    return NextResponse.json(mockStore.portfolio);
}
