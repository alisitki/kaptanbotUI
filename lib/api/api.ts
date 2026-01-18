
import { http, ApiError } from './client/http';
import { getBaseUrl, getToken, getAuthMethod } from './runtime';

const getHeaders = () => {
    const token = getToken();
    const method = getAuthMethod();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        if (method === 'BEARER') {
            headers['Authorization'] = `Bearer ${token}`;
        } else if (method === 'API_KEY') {
            headers['x-api-key'] = token;
        }
    }
    return headers;
};

const getUrl = (path: string) => {
    const baseUrl = getBaseUrl();
    const token = getToken();
    const method = getAuthMethod();

    let url = `${baseUrl}${path}`;
    if (token && method === 'QUERY') {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}token=${encodeURIComponent(token)}`;
    }
    return url;
};

export async function apiGet<T>(path: string): Promise<T> {
    const url = getUrl(path);
    try {
        return await http(url, {
            method: 'GET',
            headers: getHeaders(),
        });
    } catch (e: any) {
        // Handle 401 specifically if needed, though UI usually handles it via error boundary or store
        if (e.message?.includes('401') || e.error === 'Unauthorized') {
            // Logic to handle logout or notify UI could be here, but usually best to let it bubble
        }
        throw e;
    }
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const url = getUrl(path);
    return await http(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
}
