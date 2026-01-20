"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Candle, Position } from "@/lib/game/types";
import { Loader2 } from "lucide-react";

// Dynamically import the chart component with no SSR
const LightweightChart = dynamic(
    () => import("./LightweightChart"),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        )
    }
);

interface GameChartProps {
    candles: Candle[];
    currentIndex: number;
    position: Position | null;
}

export function GameChart({ candles, currentIndex, position }: GameChartProps) {
    return (
        <Card className="h-full border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md flex flex-col relative overflow-hidden">
            <LightweightChart
                candles={candles}
                currentIndex={currentIndex}
                position={position}
            />
        </Card>
    );
}
