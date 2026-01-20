export const getBaseUrl = (): string => {
    const isProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true' || (typeof window !== 'undefined' && window.location.hostname === 'localhost');
    if (isProxy && typeof window !== 'undefined') {
        const origin = window.location.origin;
        return `${origin}/api/proxy`;
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://157.180.19.240:3000';
};
