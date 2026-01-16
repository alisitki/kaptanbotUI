"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
    Volume2,
    VolumeX,
    Sparkles,
    Layout,
    Dna,
    Settings2
} from "lucide-react";

export interface GamePreferences {
    soundEnabled: boolean;
    effectsEnabled: boolean;
    visualIntensity: number; // 0 to 100
    backgroundEnabled: boolean;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    preferences: GamePreferences;
    onPreferencesChange: (prefs: Partial<GamePreferences>) => void;
}

export function SettingsModal({
    isOpen,
    onClose,
    preferences,
    onPreferencesChange,
}: SettingsModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#0A0A0A] border-white/10 text-white sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-indigo-400" />
                        Oyun Ayarları
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Audio Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {preferences.soundEnabled ? <Volume2 className="w-4 h-4 text-zinc-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
                                <Label htmlFor="sound" className="text-sm font-medium">Ses Efektleri</Label>
                            </div>
                            <Switch
                                id="sound"
                                checked={preferences.soundEnabled}
                                onCheckedChange={(checked) => onPreferencesChange({ soundEnabled: checked })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Visual Settings */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-zinc-400" />
                                <Label htmlFor="effects" className="text-sm font-medium">Görsel Efektler</Label>
                            </div>
                            <Switch
                                id="effects"
                                checked={preferences.effectsEnabled}
                                onCheckedChange={(checked) => onPreferencesChange({ effectsEnabled: checked })}
                            />
                        </div>

                        {preferences.effectsEnabled && (
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>Efekt Yoğunluğu</span>
                                    <span>{preferences.visualIntensity}%</span>
                                </div>
                                <Slider
                                    value={[preferences.visualIntensity]}
                                    min={0}
                                    max={100}
                                    step={10}
                                    onValueChange={([val]) => onPreferencesChange({ visualIntensity: val })}
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Layout className="w-4 h-4 text-zinc-400" />
                                <Label htmlFor="bg-anim" className="text-sm font-medium">Arkaplan Animasyonu</Label>
                            </div>
                            <Switch
                                id="bg-anim"
                                checked={preferences.backgroundEnabled}
                                onCheckedChange={(checked) => onPreferencesChange({ backgroundEnabled: checked })}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Performance Tip */}
                    <div className="bg-white/5 p-3 rounded-lg flex gap-3 text-xs text-zinc-500">
                        <Dna className="w-4 h-4 text-indigo-400 shrink-0" />
                        <p>Düşük performanslı bilgisayarlarda efekt yoğunluğunu azaltarak daha akıcı bir deneyim elde edebilirsiniz.</p>
                    </div>

                    <Button onClick={onClose} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
                        Kapat
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
