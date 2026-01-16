import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Shuffle, CalendarDays, Settings2 } from "lucide-react";
import { TOTAL_CANDLES } from "@/lib/game/types";
import { RankBadge } from "./RankBadge";

interface SessionHeaderProps {
    startTime: number;
    currentTime: number;
    currentIndex: number;
    mode: 'random' | 'date';
    streak: number;
    onSettingsOpen?: () => void;
}

export function SessionHeader({
    startTime,
    currentTime,
    currentIndex,
    mode,
    streak,
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
                            : 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                        }
          `}
                >
                    {mode === 'random' ? (
                        <>
                            <Shuffle className="w-3 h-3 mr-1" /> Rastgele
                        </>
                    ) : (
                        <>
                            <CalendarDays className="w-3 h-3 mr-1" /> Tarih Seçimi
                        </>
                    )}
                </Badge>

                {/* Rank Badge */}
                <RankBadge streak={streak} />

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
                        {currentDate.toLocaleDateString('tr-TR')} {currentDate.getHours().toString().padStart(2, '0')}:00
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
