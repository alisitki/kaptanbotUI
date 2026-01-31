
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
    const backendUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://157.180.19.240:3000').replace(/\/$/, '');
    const quantlabBaseUrl = (process.env.NEXT_PUBLIC_QUANTLAB_API_BASE_URL || process.env.QUANTLAB_API_BASE_URL || backendUrl).replace(/\/$/, '');
    const path = pathArr.join('/');
    const searchParams = req.nextUrl.searchParams.toString();
    const pathname = req.nextUrl.pathname;
    const isQuantlabProxy = pathname.startsWith('/api/proxy/api/quantlab/');

    // 🔓 QuantLab proxy is always public
    if (!isQuantlabProxy) {
        const hasAuth =
            Boolean(req.headers.get('Authorization')) ||
            Boolean(req.headers.get('Cookie')) ||
            Boolean(req.headers.get('x-api-key'));

        if (!hasAuth) {
            return NextResponse.json(
                { error: 'UNAUTHORIZED', message: 'Authentication required' },
                { status: 401 }
            );
        }
    } else {
        console.log('🔓 [Proxy] QuantLab auth bypass ACTIVE:', pathname);
    }

    const baseUrl = pathname.startsWith('/api/proxy/api/quantlab/')
        ? quantlabBaseUrl
        : backendUrl;
    const targetUrl = `${baseUrl}/${path}${searchParams ? '?' + searchParams : ''}`;

    console.log(`📡 [Proxy] ${method} -> ${targetUrl}`);

    const headers = new Headers();
    // Forward essential headers
    const authHeader = req.headers.get('Authorization');
    if (authHeader) headers.set('Authorization', authHeader);

    const cookieHeader = req.headers.get('Cookie');
    console.log(`🍪 [Proxy] Incoming Cookies: ${cookieHeader ? 'Present' : 'Missing'}`);
    if (cookieHeader) headers.set('Cookie', cookieHeader);

    const apiKey = req.headers.get('x-api-key');
    if (apiKey) headers.set('x-api-key', apiKey);

    headers.set('Content-Type', 'application/json');

    try {
        const body = (method === 'POST' || method === 'PUT' || method === 'PATCH')
            ? await req.text()
            : undefined;

        console.log(`🚀 [Proxy] Fetching...`);
        const response = await fetch(targetUrl, {
            method,
            headers,
            body,
        });
        console.log(`✅ [Proxy] Response Status: ${response.status}`);

        const responseHeaders = new Headers();
        // Forward content type
        responseHeaders.set('Content-Type', response.headers.get('content-type') || 'application/json');

        // Forward Set-Cookie headers
        const setCookie = response.headers.get('set-cookie');
        if (setCookie) {
            console.log(`🍪 [Proxy] Forwarding Set-Cookie`);
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
    } catch (error: any) {
        console.error('❌ [Proxy] Error:', error);
        return NextResponse.json({
            error: 'Proxy Error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
