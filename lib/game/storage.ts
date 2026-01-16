// =============================================================================
// GAME SESSION STORAGE - LocalStorage Helper
// =============================================================================

import { SessionSummary } from './types';

const STORAGE_KEY = 'price_action_master_sessions';
const MAX_SESSIONS = 5;

/**
 * Get all saved sessions
 */
export function getSessions(): SessionSummary[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const sessions: SessionSummary[] = JSON.parse(stored);

        // Sort by timestamp descending (newest first)
        return sessions.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
        console.error('Failed to load sessions:', error);
        return [];
    }
}

/**
 * Save a new session (keeps only last 5)
 */
export function saveSession(summary: SessionSummary): void {
    if (typeof window === 'undefined') return;

    try {
        const sessions = getSessions();

        // Add new session at the beginning
        sessions.unshift(summary);

        // Keep only last N sessions
        const trimmed = sessions.slice(0, MAX_SESSIONS);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
        console.error('Failed to save session:', error);
    }
}

/**
 * Clear all sessions
 */
export function clearSessions(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear sessions:', error);
    }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
