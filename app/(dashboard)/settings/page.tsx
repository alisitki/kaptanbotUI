"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
    const [showKey, setShowKey] = useState(false);

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-zinc-400">Manage API keys, endpoints, and runtime configuration.</p>
            </div>

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle>Exchange Connection</CardTitle>
                    <CardDescription>Binance Futures API Configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>API Key</Label>
                        <div className="relative">
                            <Input
                                type={showKey ? "text" : "password"}
                                defaultValue="bn_xxxxxxxxxxxxxxxxxxxxxxxx"
                                className="bg-black/20 border-zinc-800 pr-10 font-mono text-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowKey(!showKey)}
                                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
                            >
                                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <Input
                            type="password"
                            defaultValue="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="bg-black/20 border-zinc-800 font-mono text-sm"
                        />
                    </div>

                    <Separator className="bg-zinc-800 my-4" />

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Testnet Mode</Label>
                            <p className="text-xs text-zinc-500">Use Binance Testnet environment</p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                    <CardTitle>Runtime</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Server URL</Label>
                            <Input defaultValue="https://api.binance.com" className="bg-black/20 border-zinc-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Websocket Stream</Label>
                            <Input defaultValue="wss://fstream.binance.com" className="bg-black/20 border-zinc-800" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Polling Interval (ms)</Label>
                        <Input type="number" defaultValue={1000} className="bg-black/20 border-zinc-800" />
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button variant="outline" className="border-zinc-800 bg-transparent text-zinc-300 hover:text-white">Discard</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">Save Changes</Button>
            </div>
        </div>
    );
}
