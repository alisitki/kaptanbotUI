"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

export default function AltuqSettingsPage() {
    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Ayarlar</h1>
                <p className="text-zinc-400">Sistem yapılandırması, bildirim tercihleri ve risk yönetimi.</p>
            </div>

            <Separator className="bg-white/10" />

            {/* General Config */}
            <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Genel Yapılandırma</CardTitle>
                    <CardDescription>Botun çalışma modu ve borsa bağlantısı</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-400">Borsa (Exchange)</Label>
                            <Select defaultValue="binance">
                                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent className="bg-black border-white/10">
                                    <SelectItem value="binance">Binance Spot</SelectItem>
                                    <SelectItem value="binance_futures">Binance Futures</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-400">API Key</Label>
                            <Input value="********************" disabled className="bg-white/5 border-white/10 text-zinc-500 font-mono" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                        <div className="space-y-0.5">
                            <Label className="text-white">Paper Trading (Simülasyon)</Label>
                            <p className="text-xs text-zinc-500">Gerçek para kullanmadan test verileriyle işlem yap.</p>
                        </div>
                        <Switch checked={true} />
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-white">Bildirimler</CardTitle>
                    <CardDescription>Hangi durumlarda uyarı almak istiyorsunuz?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-300">Yeni Sinyal Geldiğinde</Label>
                        <Switch checked={true} />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-300">TP (Kâr Al) Tetiklendiğinde</Label>
                        <Switch checked={true} />
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-300">Trailing Stop Güncellendiğinde</Label>
                        <Switch checked={false} />
                    </div>
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                    <Save className="h-4 w-4" />
                    Ayarları Kaydet
                </Button>
            </div>
        </div>
    );
}
