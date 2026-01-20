"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiPost } from "@/lib/api/api";
import { toast } from "sonner";
import { useBotStore } from "@/lib/store";
import { Loader2, Key, Settings, Rocket, CheckCircle2 } from "lucide-react";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useBotStore();

    // Step 1: Binance Keys
    const [apiKey, setApiKey] = useState("");
    const [apiSecret, setApiSecret] = useState("");

    // Step 2: Basic Settings
    const [mode, setMode] = useState("PAPER");
    const [symbols, setSymbols] = useState("BTCUSDT, ETHUSDT, SOLUSDT");

    const isStep1Valid = apiKey.length >= 32 && apiSecret.length >= 32;

    const handleSaveKeys = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep1Valid) {
            toast.error("Invalid keys", { description: "API Key and Secret must be at least 32 characters long." });
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiPost<any>("/v1/secrets/binance", { api_key: apiKey, api_secret: apiSecret });

            if (response && response.verified) {
                toast.success("Binance keys verified and saved");
            } else {
                toast.success("Binance keys saved");
            }

            setStep(2);
        } catch (error: any) {
            let description = error.message || "Please check your network and try again.";

            if (error.error === "INVALID_BINANCE_KEYS") {
                description = "Girdiğiniz Binance API anahtarları geçersiz veya yetkisiz. Lütfen kontrol edip tekrar deneyin.";
            }

            toast.error("Connection Failed", {
                description: description
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await apiPost("/v1/settings", {
                mode: mode,
                allow_symbols: symbols.split(",").map(s => s.trim().toUpperCase()),
                live_max_order_usdt: 100,
                paper_fee_bps: 10,
                telegram_enabled: false
            });

            toast.success("Settings saved! Ready to launch.");

            // Final auth check to update store
            await checkAuth();
            router.push("/tradingbotv1/overview");
        } catch (error: any) {
            toast.error("Failed to save settings", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-2xl relative z-10">
                {/* Stepper */}
                <div className="flex justify-between mb-8 px-4">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-1">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${step >= i ? "bg-indigo-600 border-indigo-600 text-white" : "border-zinc-800 text-zinc-600"
                                }`}>
                                {step > i ? <CheckCircle2 className="h-6 w-6" /> : (i === 1 ? <Key className="h-5 w-5" /> : <Settings className="h-5 w-5" />)}
                            </div>
                            <span className={`text-xs font-medium uppercase tracking-wider ${step >= i ? "text-indigo-400" : "text-zinc-600"}`}>
                                {i === 1 ? "Connect Exchange" : "Initialize Bot"}
                            </span>
                        </div>
                    ))}
                </div>

                {step === 1 ? (
                    <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white flex items-center gap-2">
                                <Key className="h-6 w-6 text-indigo-500" />
                                Exchange Connection
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Connect your Binance account via Read-Only or Trading API keys. Your keys are encrypted.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSaveKeys}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey" className="text-zinc-400">API Key</Label>
                                    <Input
                                        id="apiKey"
                                        placeholder="Your Binance API Key"
                                        required
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="bg-black/50 border-white/10 text-white font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="apiSecret" className="text-zinc-400">API Secret</Label>
                                    <Input
                                        id="apiSecret"
                                        type="password"
                                        placeholder="Your Binance API Secret"
                                        required
                                        value={apiSecret}
                                        onChange={(e) => setApiSecret(e.target.value)}
                                        className="bg-black/50 border-white/10 text-white font-mono"
                                    />
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col items-end gap-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading || !isStep1Valid}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                    {isLoading ? "Verifying..." : "Verify & Continue"}
                                </Button>
                                {apiKey.length > 0 && !isStep1Valid && (
                                    <p className="text-[10px] text-red-500 italic">Keys must be at least 32 characters.</p>
                                )}
                            </CardFooter>
                        </form>
                    </Card>
                ) : (
                    <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                        <CardHeader>
                            <CardTitle className="text-2xl text-white flex items-center gap-2">
                                <Settings className="h-6 w-6 text-indigo-500" />
                                Bot Configuration
                            </CardTitle>
                            <CardDescription className="text-zinc-400">
                                Set your preferred trading frequency and risk parameters.
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSaveSettings}>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Trading Mode</Label>
                                    <Select value={mode} onValueChange={setMode}>
                                        <SelectTrigger className="bg-black/50 border-white/10 text-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="PAPER">Paper Trading (Simulator)</SelectItem>
                                            <SelectItem value="LIVE">Live Trading (Real Funds)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-[10px] text-zinc-500 italic">Paper mode allows you to trade without risking real capital.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="symbols" className="text-zinc-400">Allowed Symbols</Label>
                                    <Input
                                        id="symbols"
                                        placeholder="BTCUSDT, ETHUSDT"
                                        required
                                        value={symbols}
                                        onChange={(e) => setSymbols(e.target.value)}
                                        className="bg-black/50 border-white/10 text-white"
                                    />
                                    <p className="text-[10px] text-zinc-500">Separate symbols with commas.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="text-zinc-400 hover:text-white">
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 flex gap-2"
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        <>
                                            <Rocket className="h-4 w-4" />
                                            Finish Setup
                                        </>
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                )}
            </div>
        </div>
    );
}
