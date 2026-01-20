"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api/api";
import { PortfolioState, Balance } from "@/lib/api/client/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Wallet, Clock, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";

function formatRelativeTime(timestamp: string | number | null): string {
    if (!timestamp) return "—";
    const now = Date.now();
    const tsMs = typeof timestamp === 'number'
        ? (timestamp < 1e12 ? timestamp * 1000 : timestamp)
        : new Date(timestamp).getTime();
    const diffSeconds = Math.floor((now - tsMs) / 1000);

    if (diffSeconds < 0) return "just now";
    if (diffSeconds < 5) return "just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
}

export default function PortfolioPage() {
    const [portfolio, setPortfolio] = useState<PortfolioState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPortfolio = async () => {
        try {
            const data = await apiGet<PortfolioState>('/v1/portfolio');
            setPortfolio(data);
            setError(null);
        } catch (e: any) {
            console.error("Failed to fetch portfolio", e);
            setError(e.message || "Failed to fetch portfolio");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPortfolio();
        const interval = setInterval(fetchPortfolio, 10000);
        return () => clearInterval(interval);
    }, []);

    // Filter balances: only show where free > 0 or locked > 0
    const filteredBalances = portfolio?.balances?.filter(
        (b: Balance) => b.free > 0 || b.locked > 0
    ) || [];

    const isNotConnected = !portfolio?.last_sync_at || filteredBalances.length === 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Portfolio</h1>
                    <p className="text-zinc-400">Binance Account Overview</p>
                </div>
                <button
                    onClick={fetchPortfolio}
                    disabled={loading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg border border-white/10 transition-all text-sm"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            <Separator className="bg-white/10" />

            {/* Error/Empty State */}
            {!loading && (error || isNotConnected) && (
                <Card className="bg-amber-500/5 border-amber-500/20">
                    <CardContent className="flex items-center gap-4 py-6">
                        <AlertCircle className="h-8 w-8 text-amber-400" />
                        <div className="flex-1">
                            <h3 className="text-amber-400 font-medium">Binance keys not connected</h3>
                            <p className="text-zinc-500 text-sm">Please complete onboarding to sync your Binance account.</p>
                        </div>
                        <Link
                            href="/tradingbotv1/onboarding"
                            className="px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all text-sm font-medium"
                        >
                            Go to Onboarding
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center h-48">
                    <RefreshCw className="h-6 w-6 text-zinc-500 animate-spin" />
                </div>
            )}

            {/* Portfolio Header Metrics */}
            {!loading && portfolio && !isNotConnected && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Equity */}
                        <Card className="bg-[#0A0A0A]/50 border-white/5">
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <Wallet className="h-5 w-5 text-emerald-400" />
                                <CardTitle className="text-zinc-400 text-sm font-medium">Equity (USDT)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-3xl font-bold text-white">
                                    ${portfolio.equity_usdt?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
                                </span>
                            </CardContent>
                        </Card>

                        {/* Account Type */}
                        <Card className="bg-[#0A0A0A]/50 border-white/5">
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <CardTitle className="text-zinc-400 text-sm font-medium">Account Type</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge className={`text-lg px-3 py-1 ${portfolio.account_type === 'FUTURES'
                                    ? 'bg-purple-500/15 text-purple-400 border-purple-500/20'
                                    : 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20'
                                    }`}>
                                    {portfolio.account_type || 'SPOT'}
                                </Badge>
                            </CardContent>
                        </Card>

                        {/* Last Sync */}
                        <Card className="bg-[#0A0A0A]/50 border-white/5">
                            <CardHeader className="flex flex-row items-center gap-3 pb-2">
                                <Clock className="h-5 w-5 text-zinc-500" />
                                <CardTitle className="text-zinc-400 text-sm font-medium">Last Sync</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-xl font-mono text-zinc-300">
                                    {portfolio.last_sync_at ? formatRelativeTime(portfolio.last_sync_at) : "Never"}
                                </span>
                                {portfolio.last_sync_at && (
                                    <p className="text-xs text-zinc-600 mt-1">
                                        {new Date(portfolio.last_sync_at).toLocaleString()}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Balances Table */}
                    <Card className="bg-[#0A0A0A]/50 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white text-lg">Balances</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredBalances.length === 0 ? (
                                <p className="text-zinc-500 text-sm">No balances with value found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left text-zinc-500 font-medium py-3 px-2">Asset</th>
                                                <th className="text-right text-zinc-500 font-medium py-3 px-2">Free</th>
                                                <th className="text-right text-zinc-500 font-medium py-3 px-2">Locked</th>
                                                {filteredBalances.some(b => b.value_usdt !== undefined) && (
                                                    <th className="text-right text-zinc-500 font-medium py-3 px-2">Value (USDT)</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredBalances.map((balance: Balance) => (
                                                <tr key={balance.asset} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-2">
                                                        <span className="font-mono font-medium text-white">{balance.asset}</span>
                                                    </td>
                                                    <td className="text-right py-3 px-2 font-mono text-zinc-300">
                                                        {balance.free.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 })}
                                                    </td>
                                                    <td className="text-right py-3 px-2 font-mono text-zinc-500">
                                                        {balance.locked > 0 ? balance.locked.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 }) : "—"}
                                                    </td>
                                                    {filteredBalances.some(b => b.value_usdt !== undefined) && (
                                                        <td className="text-right py-3 px-2 font-mono text-emerald-400">
                                                            {balance.value_usdt !== undefined ? `$${balance.value_usdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}
