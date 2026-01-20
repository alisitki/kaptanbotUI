import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Shuffle, CalendarDays, Settings2 } from "lucide-react";
import { TOTAL_CANDLES } from "@/lib/game/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RankBadge } from "./RankBadge";

interface SessionHeaderProps {
    startTime: number;
    currentTime: number;
    currentIndex: number;
    mode: 'random' | 'date' | 'realtime';
    streak: number;
    interval: string;
    onIntervalChange: (interval: string) => void;
    onSettingsOpen?: () => void;
}

export function SessionHeader({
    startTime,
    currentTime,
    currentIndex,
    mode,
    streak,
    interval,
    onIntervalChange,
    onSettingsOpen,
}: SessionHeaderProps) {
    const startDate = new Date(startTime);
    const currentDate = new Date(currentTime);

    const progressPercent = ((currentIndex + 1) / TOTAL_CANDLES) * 100;

    return (
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A]/80 backdrop-blur-sm border-b border-white/5">
            {/* Left: Session Info */}
            <div className="flex items-center gap-6">
                {/* Mode Badge */}
                <Badge
                    variant="outline"
                    className={`
            h-6 px-2 text-xs font-medium
            ${mode === 'random'
                            ? 'border-indigo-500/30 text-indigo-400 bg-indigo-500/10'
                            : mode === 'realtime'
                                ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }
          `}
                >
                    {mode === 'random' ? (
                        <>
                            <Shuffle className="w-3 h-3 mr-1" /> Rastgele
                        </>
                    ) : mode === 'realtime' ? (
                        <>
                            <Clock className="w-3 h-3 mr-1" /> Canlı Piyasa
                        </>
                    ) : (
                        <>
                            <CalendarDays className="w-3 h-3 mr-1" /> Tarih Seçimi
                        </>
                    )}
                </Badge>

                {/* Rank Badge */}
                <RankBadge streak={streak} />

                {/* Interval Selector - Only show in Realtime mode for now to avoid confusion */}
                {mode === 'realtime' && (
                    <>
                        <div className="h-4 w-px bg-white/10" />
                        <Select value={interval} onValueChange={onIntervalChange}>
                            <SelectTrigger className="w-[70px] h-6 text-xs bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1m">1m</SelectItem>
                                <SelectItem value="5m">5m</SelectItem>
                                <SelectItem value="15m">15m</SelectItem>
                                <SelectItem value="1h">1h</SelectItem>
                                <SelectItem value="4h">4h</SelectItem>
                                <SelectItem value="1d">1d</SelectItem>
                            </SelectContent>
                        </Select>
                    </>
                )}

                <div className="h-4 w-px bg-white/10" />

                {/* Start Date */}
                <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span className="text-zinc-500">Başlangıç:</span>
                    <span className="text-emerald-400 font-mono">
                        {startDate.toLocaleDateString('tr-TR')}
                    </span>
                </div>

                {/* Current Date */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-500">Şimdi:</span>
                    <span className="text-zinc-300 font-mono">
                        {currentDate.toLocaleDateString('tr-TR')} {currentDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            {/* Right: Progress */}
            <div className="flex items-center gap-4">
                <div className="text-sm text-zinc-500">
                    Mum <span className="text-white font-mono">{currentIndex + 1}</span> / {TOTAL_CANDLES}
                </div>
                <div className="w-32">
                    <Progress
                        value={progressPercent}
                        className="h-2 bg-zinc-800 text-indigo-500"
                    />
                </div>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <button
                    onClick={onSettingsOpen}
                    className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                    title="Oyun Ayarları"
                >
                    <Settings2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
