import { Sidebar } from "@/components/altuq/layout/Sidebar";
import { Topbar } from "@/components/altuq/layout/Topbar";

export default function AltuqLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-[#020202] dark font-sans antialiased text-white selection:bg-indigo-500/30 overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col pl-64 h-full transition-all duration-300">
                <Topbar />
                <main className="flex-1 h-full overflow-y-auto p-6 md:p-8 relative scroll-smooth">
                    {/* Subtle Background Gradients */}
                    <div className="fixed inset-0 pointer-events-none z-0">
                        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative z-10 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
