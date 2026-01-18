
export type AuthMethod = 'BEARER' | 'API_KEY' | 'QUERY';

export const getBaseUrl = (): string => {
    const isProxy = process.env.NEXT_PUBLIC_USE_PROXY === 'true';
    if (isProxy && typeof window !== 'undefined') {
        const origin = window.location.origin;
        return `${origin}/api/proxy`;
    }
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.nobetix.com';
};

export const getAuthMethod = (): AuthMethod => {
    return (process.env.NEXT_PUBLIC_AUTH_METHOD as AuthMethod) || 'BEARER';
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('tbv1_token');
    }
    return null;
};
