
export const getBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
};

export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('tbv1_token');
    }
    return null;
};
