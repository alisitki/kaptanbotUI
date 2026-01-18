
"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/api";
import { BotSettings } from "@/lib/api/client/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useBotStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Send, Save } from "lucide-react";

export default function SettingsPage() {
    const [settings, setSettings] = useState<BotSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const { stop } = useBotStore();
    const router = useRouter();

    // General Form states
    const [allowSymbols, setAllowSymbols] = useState("");
    const [liveMaxOrder, setLiveMaxOrder] = useState(0);
    const [paperFee, setPaperFee] = useState(0);
    const [mode, setMode] = useState<"PAPER" | "LIVE">("PAPER");

    // Telegram Form states
    const [tgEnabled, setTgEnabled] = useState(false);
    const [tgToken, setTgToken] = useState("");
    const [tgChatId, setTgChatId] = useState("");
    const [tgNotifyOn, setTgNotifyOn] = useState<string[]>([]);
    const [testMsg, setTestMsg] = useState("TradingBotV1 test");

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await apiGet<BotSettings>('/v1/settings');
                setSettings(data);

                // Init General
                setAllowSymbols(data.allow_symbols.join(", "));
                setLiveMaxOrder(data.live_max_order_usdt);
                setPaperFee(data.paper_fee_bps);
                setMode(data.mode);

                // Init Telegram
                setTgEnabled(data.telegram_enabled);
                setTgToken(data.telegram_bot_token); // might be masked
                setTgChatId(data.telegram_chat_id);
                setTgNotifyOn(data.telegram_notify_on || []);

            } catch (e) {
                console.error("Failed to fetch settings", e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            // Logic: maskeli token (örn '******') kullanıcı değiştirmediyse gönderme.
            // Backend bu alanı optional alırsa, göndermemek en iyisi.
            // Ancak types'da zorunlu görünüyor. Partial update yapalım.
            // Eğer settings.telegram_bot_token ile tgToken aynıysa ve masked ise, gönderme.
            // Basit kural: kullanıcı input'a dokunmazsa (state değişmezse) zaten eski değer vardır,
            // ama maskeli değer geri giderse backend bunu token sanabilir.
            // Backend'in maskeli geldiğini anlaması lazım veya biz göndermeyeceğiz.

            // User didn't change token if it equals the loaded one
            // Wait, if it came as masked from backend, and we send it back masked, backend might overwrite.
            // We should strip it if it's masked/unchanged?
            // "Eğer maskeli geliyorsa ve kullanıcı değiştirmediyse POST’ta göndermeyin."

            const isTokenChanged = tgToken !== settings?.telegram_bot_token;

            const payload: any = {
                mode,
                allow_symbols: allowSymbols.split(",").map(s => s.trim()).filter(s => s.length > 0),
                live_max_order_usdt: Number(liveMaxOrder),
                paper_fee_bps: Number(paperFee),
                telegram_enabled: tgEnabled,
                telegram_chat_id: tgChatId,
                telegram_notify_on: tgNotifyOn
            };

            // Only send token if changed
            if (isTokenChanged) {
                payload.telegram_bot_token = tgToken;
            }

            await apiPost('/v1/settings', payload);

            // Update local snapshot
            setSettings(prev => prev ? { ...prev, ...payload, telegram_bot_token: isTokenChanged ? tgToken : prev.telegram_bot_token } : null);

            toast.success("Settings saved successfully");

            if (payload.mode === 'LIVE' && settings?.mode !== 'LIVE') {
                toast.warning("Bot is provided to LIVE mode.", { duration: 5000 });
            }

        } catch (e: any) {
            toast.error("Failed to save settings", { description: e.message });
        }
    };

    const handleSendTest = async () => {
        try {
            await apiPost('/v1/notify/test', { message: testMsg });
            toast.success("Test message sent!");
        } catch (e: any) {
            toast.error("Failed to send test message", { description: e.message });
        }
    };

    const toggleNotify = (event: string) => {
        if (tgNotifyOn.includes(event)) {
            setTgNotifyOn(tgNotifyOn.filter(e => e !== event));
        } else {
            setTgNotifyOn([...tgNotifyOn, event]);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('tbv1_token');
        stop();
        router.replace('/tradingbotv1');
    };

    if (loading) return <div>Loading settings...</div>;

    return (
        <div className="space-y-6 max-w-4xl pb-20">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
                <p className="text-zinc-400">Bot Configuration & Risk Management</p>
            </div>

            <Separator className="bg-white/10" />

            <div className="grid grid-cols-1 gap-6">

                {/* General Config */}
                <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white">General Configuration</CardTitle>
                        <CardDescription>Trading mode and risk limits</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                            <div className="space-y-0.5">
                                <Label className="text-white text-base">Trading Mode</Label>
                                <p className="text-sm text-zinc-500">
                                    {mode === 'LIVE' ? "Real funds are being used." : "Simulation with fake balances."}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={mode === 'PAPER' ? "text-emerald-500 font-bold" : "text-zinc-500"}>PAPER</span>
                                <Switch
                                    checked={mode === 'LIVE'}
                                    onCheckedChange={(c) => setMode(c ? 'LIVE' : 'PAPER')}
                                    className="data-[state=checked]:bg-rose-500"
                                />
                                <span className={mode === 'LIVE' ? "text-rose-500 font-bold" : "text-zinc-500"}>LIVE</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Allowed Symbols</Label>
                                <Input value={allowSymbols} onChange={e => setAllowSymbols(e.target.value)} className="bg-black/20 border-white/10 text-white font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Live Max Order (USDT)</Label>
                                <Input type="number" value={liveMaxOrder} onChange={e => setLiveMaxOrder(Number(e.target.value))} className="bg-black/20 border-white/10 text-white font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-zinc-400">Paper Fee (bps)</Label>
                                <Input type="number" value={paperFee} onChange={e => setPaperFee(Number(e.target.value))} className="bg-black/20 border-white/10 text-white font-mono" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Telegram Config */}
                <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center justify-between">
                            Telegram Integration
                            <Switch checked={tgEnabled} onCheckedChange={setTgEnabled} className="data-[state=checked]:bg-blue-500" />
                        </CardTitle>
                        <CardDescription>Notification settings and bot configuration</CardDescription>
                    </CardHeader>
                    {tgEnabled && (
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Bot Token</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={tgToken}
                                        onChange={e => setTgToken(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white font-mono"
                                    />
                                    <p className="text-[10px] text-zinc-500">Only change if you want to update the token.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-zinc-400">Chat ID</Label>
                                    <Input
                                        value={tgChatId}
                                        onChange={e => setTgChatId(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-zinc-400">Notify Events</Label>
                                <div className="flex flex-wrap gap-4">
                                    {['SELL_TRIGGERED', 'WATCH_CREATED', 'TP_MOVED'].map(evt => (
                                        <div key={evt} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={evt}
                                                checked={tgNotifyOn.includes(evt)}
                                                onCheckedChange={() => toggleNotify(evt)}
                                                className="border-white/20 data-[state=checked]:bg-blue-500"
                                            />
                                            <Label htmlFor={evt} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300">
                                                {evt}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator className="bg-white/5" />

                            <div className="flex items-end gap-4">
                                <div className="flex-1 space-y-2">
                                    <Label className="text-zinc-400">Test Message</Label>
                                    <Input
                                        value={testMsg}
                                        onChange={e => setTestMsg(e.target.value)}
                                        className="bg-black/20 border-white/10 text-white"
                                    />
                                </div>
                                <Button onClick={handleSendTest} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white">
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Test
                                </Button>
                            </div>
                        </CardContent>
                    )}
                </Card>

                {/* Save Button */}
                <div className="fixed bottom-0 left-0 w-full p-4 bg-[#050505]/90 border-t border-white/10 flex justify-end gap-4 backdrop-blur z-50 pl-72">
                    <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => router.refresh()}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-500 w-32 shadow-lg shadow-indigo-500/20">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="flex justify-between items-center pt-10">
                <p className="text-xs text-zinc-600">Bot ID: {settings?.telegram_bot_token ? 'Configured' : 'Not Configured'}</p>
                <Button variant="destructive" onClick={handleLogout} className="bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50">
                    Logout
                </Button>
            </div>
        </div>
    );
}
