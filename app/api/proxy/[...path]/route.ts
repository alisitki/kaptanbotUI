
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(req, path, 'GET');
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    return handleRequest(req, path, 'POST');
}

async function handleRequest(req: NextRequest, pathArr: string[], method: string) {
    const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.nobetix.com').replace(/\/$/, '');
    const path = pathArr.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const targetUrl = `${backendUrl}/${path}${searchParams ? '?' + searchParams : ''}`;

    console.log(`📡 [Proxy] ${method} -> ${targetUrl}`);

    const headers = new Headers();
    // Forward essential headers
    const authHeader = req.headers.get('Authorization');
    if (authHeader) headers.set('Authorization', authHeader);

    const cookieHeader = req.headers.get('Cookie');
    if (cookieHeader) headers.set('Cookie', cookieHeader);

    const apiKey = req.headers.get('x-api-key');
    if (apiKey) headers.set('x-api-key', apiKey);

    headers.set('Content-Type', 'application/json');

    try {
        const body = (method === 'POST' || method === 'PUT' || method === 'PATCH')
            ? await req.text()
            : undefined;

        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
        });

        const responseHeaders = new Headers();
        // Forward content type
        responseHeaders.set('Content-Type', response.headers.get('content-type') || 'application/json');

        // Forward Set-Cookie headers
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            responseHeaders.set('Set-Cookie', setCookie);
        }

        // Special handling for SSE
        if (response.headers.get('content-type')?.includes('text/event-stream')) {
            responseHeaders.set('Cache-Control', 'no-cache');
            responseHeaders.set('Connection', 'keep-alive');
            return new Response(response.body, {
                headers: responseHeaders,
            });
        }

        const data = await response.text();
        return new Response(data, {
            status: response.status,
            headers: responseHeaders,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json({ error: 'Proxy error', message: String(error) }, { status: 502 });
    }
}
