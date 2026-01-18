
import { http, ApiError } from './client/http';
import { getBaseUrl, getToken } from './runtime';

const getHeaders = () => {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export async function apiGet<T>(path: string): Promise<T> {
    const url = `${getBaseUrl()}${path}`;
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
    const url = `${getBaseUrl()}${path}`;
    return await http(url, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(body),
    });
}
