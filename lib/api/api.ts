
import { http, ApiError } from './client/http';
import { getBaseUrl } from './runtime';

const getHeaders = () => {
    return {
        'Content-Type': 'application/json',
    };
};

const getUrl = (path: string) => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${path}`;
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
