
"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/api";
import { Signal } from "@/lib/api/client/types";
import { SignalFeed } from "@/components/tradingbotv1/signals/SignalFeed";
import { Separator } from "@/components/ui/separator";

export default function SignalsPage() {
    const [signals, setSignals] = useState<Signal[]>([]);

    useEffect(() => {
        const fetchSignals = async () => {
            try {
                const data = await apiGet<Signal[]>('/v1/signals');
                setSignals(data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchSignals();
        const interval = setInterval(fetchSignals, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Live Signals</h1>
                <p className="text-zinc-400">AI Powered Technical Analysis & Opportunities</p>
            </div>

            <Separator className="bg-white/10" />

            <SignalFeed signals={signals} />
        </div>
    );
}
