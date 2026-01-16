import { EventEmitter } from "events";

export type GameEventType =
    | 'OPEN_LONG'
    | 'OPEN_SHORT'
    | 'CLOSE_WIN'
    | 'CLOSE_LOSS'
    | 'LIQUIDATED'
    | 'NEW_HIGHSCORE'
    | 'COMBO_TIER_UP'
    | 'COMBO_BREAK'
    | 'GAME_START';

export interface GameEventPayload {
    amount?: number;
    pnl?: number;
    pnlPct?: number;
    streak?: number;
    rank?: string;
}

class GameEffectsBus extends EventEmitter {
    emitEffect(type: GameEventType, payload?: GameEventPayload) {
        this.emit('effect', { type, payload });
    }

    onEffect(callback: (event: { type: GameEventType; payload?: GameEventPayload }) => void) {
        this.on('effect', callback);
        return () => { this.off('effect', callback); };
    }
}

export const gameEffects = new GameEffectsBus();

export const triggerEffect = (type: GameEventType, payload?: GameEventPayload) => {
    gameEffects.emitEffect(type, payload);
};
