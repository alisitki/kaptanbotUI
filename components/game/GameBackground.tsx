import { motion } from "framer-motion";

export function GameBackground({ enabled = true }: { enabled?: boolean }) {
    if (!enabled) {
        return (
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
                <div className="absolute inset-0 bg-[#020202]" />
                <div className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
            {/* Base */}
            <div className="absolute inset-0 bg-[#020202]" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Slow moving blobs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px]"
            />

            <motion.div
                animate={{
                    x: [0, -50, 0],
                    y: [0, 100, 0],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-900/5 rounded-full blur-[150px]"
            />

            <motion.div
                animate={{
                    opacity: [0.05, 0.1, 0.05],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"
            />
        </div>
    );
}
