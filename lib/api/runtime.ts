export const getBaseUrl = (): string => {
    // In the browser, ALWAYS use the internal Next.js proxy to avoid CORS and connection issues.
    if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        return `${origin}/api/proxy`;
    }

    // Server-side default
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://157.180.19.240:3000';
};
