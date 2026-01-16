"use client";

import useSWR from "swr";
import { WatchTable } from "@/components/altuq/watch/WatchTable";
import { Separator } from "@/components/ui/separator";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AltuqWatchPage() {
    const { data: watches, isLoading } = useSWR('/api/altuq/watches', fetcher, { refreshInterval: 2000 });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Takip & Hedef Yönetimi</h1>
                <p className="text-zinc-400">Bot tarafından aktif olarak yönetilen pozisyonlar ve otomatik satış hedefleri.</p>
            </div>

            <Separator className="bg-white/10" />

            <WatchTable data={watches} isLoading={isLoading} />
        </div>
    );
}
