"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api/api";
import { useBotStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Power, PowerOff, RefreshCw } from "lucide-react";

interface ActiveUserResponse {
    active_user_id: string | null;
    active_user_email?: string | null;
}

interface CurrentUser {
    id: string;
    email: string;
}

export default function AdminPage() {
    const { user } = useBotStore();
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [activeUser, setActiveUser] = useState<ActiveUserResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const showToast = (type: "success" | "error", message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [meRes, activeRes] = await Promise.all([
                apiGet<{ user: CurrentUser }>("/auth/me"),
                apiGet<ActiveUserResponse>("/v1/admin/active-user"),
            ]);
            setCurrentUser(meRes.user);
            setActiveUser(activeRes);
        } catch (e: any) {
            console.error("Admin data fetch failed", e);
            showToast("error", "Admin verisi yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSetActive = async () => {
        if (!currentUser) return;
        setActionLoading(true);
        try {
            await apiPost("/v1/admin/active-user", { user_id: currentUser.id });
            showToast("success", "Aktif kullanıcı olarak ayarlandınız");
            await fetchData();
        } catch (e: any) {
            showToast("error", `Aktif kullanıcı ayarlanamadı: ${e.message || "Bilinmeyen hata"}`);
        } finally {
            setActionLoading(false);
        }
    };

    const handleStandby = async () => {
        setActionLoading(true);
        try {
            await fetch("/api/proxy/v1/admin/active-user", {
                method: "DELETE",
                credentials: "include",
            });
            showToast("success", "Bot standby moduna alındı");
            await fetchData();
        } catch (e: any) {
            showToast("error", `Standby moduna alınamadı: ${e.message || "Bilinmeyen hata"}`);
        } finally {
            setActionLoading(false);
        }
    };

    const isCurrentUserActive = currentUser && activeUser?.active_user_id === currentUser.id;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
                <p className="text-zinc-400">Active User Management</p>
            </div>

            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border transition-all ${toast.type === "success"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                >
                    {toast.type === "success" ? "✅" : "❌"} {toast.message}
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <RefreshCw className="h-6 w-6 text-zinc-500 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current User Card */}
                    <Card className="bg-[#0A0A0A]/50 border-white/5">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <User className="h-5 w-5 text-indigo-400" />
                            <CardTitle className="text-white text-lg">Current User</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm">User ID</span>
                                <code className="text-xs bg-white/5 px-2 py-1 rounded text-zinc-300 font-mono">
                                    {currentUser?.id || "—"}
                                </code>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm">Email</span>
                                <span className="text-zinc-300 text-sm">{currentUser?.email || "—"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active User Card */}
                    <Card className="bg-[#0A0A0A]/50 border-white/5">
                        <CardHeader className="flex flex-row items-center gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-400" />
                            <CardTitle className="text-white text-lg">Active User (Bot Controller)</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-zinc-500 text-sm">Active User ID</span>
                                {activeUser?.active_user_id ? (
                                    <code className="text-xs bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded text-emerald-400 font-mono">
                                        {activeUser.active_user_id}
                                    </code>
                                ) : (
                                    <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                                        None (Standby)
                                    </Badge>
                                )}
                            </div>
                            {activeUser?.active_user_email && (
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 text-sm">Email</span>
                                    <span className="text-zinc-300 text-sm">{activeUser.active_user_email}</span>
                                </div>
                            )}
                            {isCurrentUserActive && (
                                <div className="pt-2">
                                    <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
                                        You are the Active User
                                    </Badge>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Action Buttons */}
            {!loading && (
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={handleSetActive}
                        disabled={actionLoading || !!isCurrentUserActive}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg border border-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Power className="h-4 w-4" />
                        <span className="text-sm font-medium">Set me as Active User</span>
                    </button>
                    <button
                        onClick={handleStandby}
                        disabled={actionLoading || !activeUser?.active_user_id}
                        className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 rounded-lg border border-rose-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <PowerOff className="h-4 w-4" />
                        <span className="text-sm font-medium">Standby</span>
                    </button>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-400 rounded-lg border border-white/10 transition-all"
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                </div>
            )}
        </div>
    );
}
