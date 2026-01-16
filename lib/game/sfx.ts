import useSound from 'use-sound';
import { useEffect, useState } from 'react';
import { gameEffects } from './effects';

// Assuming sound files are in public/sounds/
// For now, if files are missing, it will just warn in console but not crash.
const SOUND_PATHS = {
    open: '/sounds/open.mp3',
    close_profit: '/sounds/profit.mp3',
    close_loss: '/sounds/loss.mp3',
    liquidation: '/sounds/liquidation.mp3',
    combo_up: '/sounds/combo.mp3',
    click: '/sounds/click.mp3',
};

export function useGameSound(enabled: boolean = true) {
    const [playOpen] = useSound(SOUND_PATHS.open, { volume: 0.5, soundEnabled: enabled });
    const [playProfit] = useSound(SOUND_PATHS.close_profit, { volume: 0.6, soundEnabled: enabled });
    const [playLoss] = useSound(SOUND_PATHS.close_loss, { volume: 0.4, soundEnabled: enabled });
    const [playLiq] = useSound(SOUND_PATHS.liquidation, { volume: 0.8, soundEnabled: enabled });
    const [playCombo] = useSound(SOUND_PATHS.combo_up, { volume: 0.5, soundEnabled: enabled });
    const [playClick] = useSound(SOUND_PATHS.click, { volume: 0.2, soundEnabled: enabled });

    useEffect(() => {
        const unsubscribe = gameEffects.onEffect(({ type }) => {
            if (!enabled) return;

            switch (type) {
                case 'OPEN_LONG':
                case 'OPEN_SHORT':
                    playOpen();
                    break;
                case 'CLOSE_WIN':
                    playProfit();
                    break;
                case 'CLOSE_LOSS':
                    playLoss();
                    break;
                case 'LIQUIDATED':
                    playLiq();
                    break;
                case 'COMBO_TIER_UP':
                    playCombo();
                    break;
                case 'NEW_HIGHSCORE':
                    playCombo(); // Reuse for now
                    break;
            }
        });

        return unsubscribe;
    }, [enabled, playOpen, playProfit, playLoss, playLiq, playCombo]);

    return {
        playClick,
    };
}
