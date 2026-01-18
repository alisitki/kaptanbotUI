
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
    return handleRequest(req, params.path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
    return handleRequest(req, params.path, 'POST');
}

async function handleRequest(req: NextRequest, pathArr: string[], method: string) {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.nobetix.com';
    const path = pathArr.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const targetUrl = `${backendUrl}/${path}${searchParams ? '?' + searchParams : ''}`;

    const headers = new Headers();
    // Forward auth headers
    const authHeader = req.headers.get('Authorization');
    if (authHeader) headers.set('Authorization', authHeader);

    const apiKey = req.headers.get('x-api-key');
    if (apiKey) headers.set('x-api-key', apiKey);

    headers.set('Content-Type', 'application/json');

    try {
        const response = await fetch(targetUrl, {
            method,
            headers,
            body: method === 'POST' ? await req.text() : undefined,
        });

        // Special handling for SSE
        if (response.headers.get('content-type')?.includes('text/event-stream')) {
            return new Response(response.body, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                },
            });
        }

        const data = await response.text();
        return new Response(data, {
            status: response.status,
            headers: {
                'Content-Type': response.headers.get('content-type') || 'application/json',
            },
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Proxy error', message: String(error) }, { status: 502 });
    }
}
