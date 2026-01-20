import { useBotStore } from "../../store";

export interface ApiError {
    error: string;
    message: string;
    details?: any;
}

export async function http(path: string, config: RequestInit = {}): Promise<any> {
    // Force credentials for session support
    config.credentials = 'include';

    const response = await fetch(path, config);

    if (response.status === 204) {
        return null;
    }

    const contentType = response.headers.get("Content-Type");
    let body;
    if (contentType && contentType.includes("application/json")) {
        body = await response.json();
    } else {
        body = await response.text();
    }

    if (!response.ok) {
        if (response.status === 401) {
            // Unauthorized => Handle redirect to login in layout or store
            // We don't remove token anymore as it's in a cookie
            useBotStore.getState().setAccessDenied(true, "TOKEN_INVALID");
            useBotStore.getState().stop();
        }
        if (response.status === 403) {
            // IP not allowed or other 403
            const errorBody = typeof body === 'object' ? body : {};
            if (errorBody.error === 'IP_NOT_ALLOWED' || errorBody.code === 'IP_NOT_ALLOWED') {
                useBotStore.getState().setAccessDenied(true, "IP_NOT_ALLOWED");
                useBotStore.getState().stop();
            }
        }

        // Normalize error
        const errorData = (typeof body === 'object' && body !== null) ? body : {};

        const apiError: ApiError = {
            error: errorData.error || 'Unknown Error',
            message: errorData.message || (typeof body === 'string' ? body : response.statusText),
            details: errorData.details
        };
        throw apiError;
    }

    return body;
}
