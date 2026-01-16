"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { gameEffects, GameEventType, GameEventPayload } from "@/lib/game/effects";

interface FloatText {
    id: number;
    text: string;
    x: number;
    y: number;
    color: string;
}

interface EffectsLayerProps {
    enabled?: boolean;
    intensity?: number; // 0-100
}

export function EffectsLayer({
    enabled = true,
    intensity = 100,
}: EffectsLayerProps) {
    const [floatTexts, setFloatTexts] = useState<FloatText[]>([]);
    const [vignette, setVignette] = useState<'red' | 'glitch' | null>(null);

    const scalar = intensity / 100;

    const addFloatText = useCallback((text: string, color: string) => {
        const id = Date.now();
        const x = window.innerWidth * 0.7 + (Math.random() * 100 - 50);
        const y = window.innerHeight * 0.4 + (Math.random() * 100 - 50);
        setFloatTexts(prev => [...prev, { id, text, x, y, color }]);
        setTimeout(() => {
            setFloatTexts(prev => prev.filter(ft => ft.id !== id));
        }, 1500);
    }, []);

    const triggerVignette = useCallback((type: 'red' | 'glitch') => {
        setVignette(type);
        setTimeout(() => setVignette(null), type === 'glitch' ? 600 : 400);
    }, []);

    const triggerConfetti = useCallback(() => {
        confetti({
            particleCount: Math.floor(100 * scalar),
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#34d399', '#10b981', '#059669'],
            zIndex: 100,
        });
    }, [scalar]);

    const fireworks = useCallback(() => {
        const duration = 2000 * scalar;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

        const random = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, [scalar]);

    useEffect(() => {
        const unsubscribe = gameEffects.onEffect(({ type, payload }) => {
            if (!enabled) return;

            switch (type) {
                case 'CLOSE_WIN':
                    triggerConfetti();
                    addFloatText(`+$${payload?.pnl?.toFixed(2)}`, 'text-emerald-400');
                    break;
                case 'CLOSE_LOSS':
                    triggerVignette('red');
                    addFloatText(`-$${Math.abs(payload?.pnl || 0).toFixed(2)}`, 'text-rose-500');
                    break;
                case 'LIQUIDATED':
                    triggerVignette('glitch');
                    addFloatText("LİKİT OLDUN", 'text-red-600 text-3xl');
                    break;
                case 'NEW_HIGHSCORE':
                    fireworks();
                    break;
            }
        });
        return unsubscribe;
    }, [enabled, triggerConfetti, triggerVignette, fireworks, addFloatText]);

    return (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
            {/* Vignette Overlay */}
            <AnimatePresence>
                {vignette === 'red' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gradient-to-r from-red-900/0 via-red-900/0 to-red-600/30 mix-blend-overlay"
                        style={{ boxShadow: 'inset 0 0 100px rgba(220, 38, 38, 0.5)' }}
                    />
                )}
                {vignette === 'glitch' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.8 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-red-500/10 mix-blend-hard-light"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black text-red-600/20 rotate-12 uppercase tracking-widest whitespace-nowrap">
                            LİKİT
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Text */}
            <div className="absolute inset-0">
                <AnimatePresence>
                    {floatTexts.map(ft => (
                        <motion.div
                            key={ft.id}
                            initial={{ opacity: 0, y: ft.y + 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: ft.y - 120, scale: 1.4 }}
                            exit={{ opacity: 0, scale: 2 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`absolute font-black drop-shadow-2xl ${ft.color} pointer-events-none select-none`}
                            style={{ left: ft.x, top: ft.y, textShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                        >
                            {ft.text}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
