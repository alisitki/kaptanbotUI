"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiPost } from "@/lib/api/api";
import { toast } from "sonner";
import { useBotStore } from "@/lib/store";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { checkAuth } = useBotStore();

    const isPasswordValid = password.length >= 8;
    const canSubmit = email.length > 0 && isPasswordValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLogin && !isPasswordValid) return;

        setIsLoading(true);

        try {
            const endpoint = isLogin ? "/auth/login" : "/auth/register";
            // Ensure additionalProperties: false compliance
            const payload = { email, password };
            await apiPost(endpoint, payload);

            toast.success(isLogin ? "Welcome back!" : "Account created successfully");

            // Check auth state to update store and get redirect path
            const authData = await checkAuth();

            if (authData) {
                if (!authData.has_binance_keys) {
                    router.replace("/tradingbotv1/onboarding");
                } else {
                    router.replace("/tradingbotv1/overview");
                }
            }
        } catch (error: any) {
            let errorMessage = isLogin ? "Login failed" : "Registration failed";
            let description = error.message || "Something went wrong";

            if (error.error === "USER_EXISTS") {
                description = "Bu email zaten kayıtlı.";
            } else if (error.error === "VALIDATION_ERROR") {
                description = "Lütfen bilgilerinizi kontrol edin: " + (error.details || error.message);
            }

            toast.error(errorMessage, {
                description: description
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />

            <Card className="w-full max-w-md bg-zinc-900/50 border-white/10 backdrop-blur-xl relative z-10 shadow-2xl">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-500/20">
                            Bot
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center text-white">
                        {isLogin ? "Sign In" : "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-center text-zinc-400">
                        {isLogin
                            ? "Enter your credentials to access your dashboard"
                            : "Join KAPTANBOT and start trading smarter"}
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-400">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-black/50 border-white/10 text-white focus:border-indigo-500/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-zinc-400">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`bg-black/50 border-white/10 text-white focus:border-indigo-500/50 transition-colors ${!isLogin && password.length > 0 && !isPasswordValid ? 'border-red-500/50 focus:border-red-500/50' : ''}`}
                            />
                            {!isLogin && password.length > 0 && !isPasswordValid && (
                                <p className="text-xs text-red-400 mt-1">
                                    Password must be at least 8 characters.
                                </p>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button
                            type="submit"
                            disabled={isLoading || (!isLogin && !isPasswordValid)}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-6 text-lg font-medium shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Please wait
                                </>
                            ) : (
                                isLogin ? "Sign In" : "Register"
                            )}
                        </Button>
                        <div className="text-zinc-500 text-sm text-center">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                            >
                                {isLogin ? "Sign Up" : "Sign In"}
                            </button>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
