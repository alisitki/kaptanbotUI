import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Rank = "Novice" | "Trader" | "Sniper" | "Master" | "Legend";

interface RankBadgeProps {
    streak: number;
    className?: string;
}

export function getRank(streak: number): Rank {
    if (streak >= 15) return "Legend";
    if (streak >= 10) return "Master";
    if (streak >= 5) return "Sniper";
    if (streak >= 2) return "Trader";
    return "Novice";
}

const RANK_COLORS: Record<Rank, string> = {
    Novice: "bg-zinc-800 text-zinc-400 border-zinc-700",
    Trader: "bg-blue-950/50 text-blue-400 border-blue-800",
    Sniper: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
    Master: "bg-purple-950/50 text-purple-400 border-purple-800",
    Legend: "bg-amber-950/50 text-amber-400 border-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.3)]",
};

export function RankBadge({ streak, className }: RankBadgeProps) {
    const rank = getRank(streak);

    return (
        <motion.div
            key={rank} // Trigger animation on rank change
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
                "px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider flex items-center gap-2",
                RANK_COLORS[rank],
                className
            )}
        >
            <span>{rank}</span>
            {streak > 1 && (
                <span className="bg-black/40 px-1.5 rounded text-[10px]">
                    {streak}W
                </span>
            )}
        </motion.div>
    );
}
