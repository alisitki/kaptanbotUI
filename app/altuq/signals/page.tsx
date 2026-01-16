"use client";

import useSWR from "swr";
import { SignalFeed } from "@/components/altuq/signals/SignalFeed";
import { Separator } from "@/components/ui/separator";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AltuqSignalsPage() {
    const { data: signals, isLoading } = useSWR('/api/altuq/signals', fetcher, { refreshInterval: 10000 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Canlı Sinyaller</h1>
                <p className="text-zinc-400">Yapay zeka destekli teknik analiz sinyalleri ve alım fırsatları.</p>
            </div>

            <Separator className="bg-white/10" />

            <SignalFeed signals={signals} isLoading={isLoading} />
        </div>
    );
}
