import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    delta?: string;
    trend?: 'neutral' | 'up' | 'down';
    icon?: React.ReactNode;
}

export function MetricCard({ title, value, delta, trend = 'neutral', icon }: MetricCardProps) {
    return (
        <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-zinc-400">{title}</p>
                    {icon ? (
                        <div className="text-zinc-500">{icon}</div>
                    ) : (
                        <Activity className="h-4 w-4 text-zinc-700" />
                    )}
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-y-1 pt-1">
                    <div className="text-2xl font-bold tracking-tight text-white truncate max-w-full mr-2">{value}</div>
                    {delta && (
                        <div className={cn(
                            "flex items-center text-xs font-medium shrink-0",
                            trend === 'up' ? "text-emerald-500" : trend === 'down' ? "text-red-500" : "text-zinc-500"
                        )}>
                            {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3 mr-1" /> : null}
                            {delta}
                        </div>
                    )}
                </div>
                <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", trend === 'up' ? 'bg-emerald-500/50 w-[70%]' : 'bg-red-500/50 w-[40%]')} />
                </div>
            </CardContent>
        </Card>
    );
}
