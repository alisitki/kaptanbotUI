"use client";

import { StrategyForm } from "@/components/strategy/StrategyForm";
import { StrategyPreview } from "@/components/strategy/StrategyPreview";

export default function StrategyPage() {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Strategy Configuration</h2>
                    <p className="text-zinc-400">Manage trading rules, risk supports, and execution logic.</p>
                </div>
                <StrategyForm />
            </div>
            <div className="lg:col-span-5">
                <StrategyPreview />
            </div>
        </div>
    );
}
