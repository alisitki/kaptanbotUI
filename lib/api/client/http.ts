import { getToken } from "../runtime";
import { useBotStore } from "../../store";

export interface ApiError {
    error: string;
    message: string;
    details?: any;
}

export async function http(path: string, config: RequestInit = {}): Promise<any> {
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
            // Token invalid => Clear token & Set access denied
            localStorage.removeItem('tbv1_token');
            useBotStore.getState().setAccessDenied(true, "TOKEN_INVALID");
            useBotStore.getState().stop();
        }
        if (response.status === 403) {
            // IP not allowed or other 403
            const errorBody = await response.json().catch(() => ({}));
            if (errorBody.error === 'IP_NOT_ALLOWED' || errorBody.code === 'IP_NOT_ALLOWED') {
                useBotStore.getState().setAccessDenied(true, "IP_NOT_ALLOWED");
                useBotStore.getState().stop();
            }
        }

        // Normalize error
        // If body was already parsed as JSON, use it. Otherwise, try to parse again or use a default.
        const errorData = (typeof body === 'object' && body !== null) ? body : await response.json().catch(() => ({}));

        const apiError: ApiError = {
            error: errorData.error || 'Unknown Error',
            message: errorData.message || response.statusText,
            details: errorData.details
        };
        throw apiError;
    }

    return body;
}
