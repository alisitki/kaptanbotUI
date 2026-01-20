
import { memo, ReactNode } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useBuilderStore } from "@/lib/strategies/builder/store";
import { GripVertical } from "lucide-react";

interface BaseNodeProps {
    id: string;
    label: string;
    selected?: boolean;
    children?: ReactNode;
    icon?: ReactNode;
    headerColorClass?: string;
    inputs?: Array<{ id: string; label?: string }>;
    outputs?: Array<{ id: string; label?: string }>;
}

export const BaseNode = memo(({
    id,
    label,
    selected,
    children,
    icon,
    headerColorClass = "bg-zinc-800",
    inputs = [],
    outputs = [],
    glowClass = "shadow-indigo-500/40" // Default glow
}: BaseNodeProps & { glowClass?: string }) => {
    const setSelectedNode = useBuilderStore((s) => s.setSelectedNode);
    const errorNodeIds = useBuilderStore((s) => s.errorNodeIds);
    const warningNodeIds = useBuilderStore((s) => s.warningNodeIds);

    const hasError = errorNodeIds.includes(id);
    const hasWarning = warningNodeIds.includes(id);

    return (
        <Card
            className={cn(
                "w-64 border-2 transition-all duration-300 bg-[#0A0A0A]",
                // Error/Warning States
                hasError ? "border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)]" :
                    hasWarning ? "border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" :
                        // Normal States
                        selected
                            ? cn("border-white/50 shadow-2xl", glowClass) // Selected: Big colored shadow (glowClass sets color)
                            : cn("border-zinc-800 shadow-lg hover:border-zinc-600", glowClass) // Idle: Smaller colored shadow
            )}
            style={selected
                ? { boxShadow: `0 0 40px -5px var(--tw-shadow-color), 0 0 10px -2px var(--tw-shadow-color)` } // Manual intense glow boost
                : { boxShadow: `0 0 15px -3px var(--tw-shadow-color)` } // Idle subtle glow
            }
            onClick={(e) => {
                e.stopPropagation(); // Prevent canvas click
                setSelectedNode(id);
            }}
        >
            {/* Header */}
            <div className={cn(
                "flex items-center gap-2 px-3 py-2 border-b border-white/5 rounded-t-lg custom-drag-handle cursor-grab active:cursor-grabbing",
                headerColorClass
            )}>
                <GripVertical className="h-4 w-4 text-white/50" />
                {icon && <div className="text-white/80">{icon}</div>}
                <span className="text-sm font-medium text-white truncate flex-1 md:text-xs lg:text-sm">
                    {label}
                </span>
            </div >

            {/* Body */}
            < div className="p-3 relative" >
                {/* Input Handles (Left) */}
                < div className="absolute left-0 top-0 bottom-0 flex flex-col justify-center gap-4 -ml-3 z-10" >
                    {
                        inputs.map((input, index) => (
                            <div key={input.id} className="relative group">
                                <Handle
                                    type="target"
                                    position={Position.Left}
                                    id={input.id}
                                    className="w-3 h-3 border-2 border-[#0A0A0A] !bg-zinc-500 hover:!bg-indigo-400 transition-colors"
                                />
                                {input.label && (
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1 rounded whitespace-nowrap pointer-events-none">
                                        {input.label}
                                    </span>
                                )}
                            </div>
                        ))
                    }
                </div >

                {/* Content */}
                < div className="text-xs text-zinc-400 min-h-[20px]" >
                    {children}
                </div >

                {/* Output Handles (Right) */}
                < div className="absolute right-0 top-0 bottom-0 flex flex-col justify-center gap-4 -mr-3 z-10" >
                    {
                        outputs.map((output, index) => (
                            <div key={output.id} className="relative group">
                                <Handle
                                    type="source"
                                    position={Position.Right}
                                    id={output.id}
                                    className="w-3 h-3 border-2 border-[#0A0A0A] !bg-zinc-500 hover:!bg-indigo-400 transition-colors"
                                    isConnectable={true}
                                />
                                {output.label && (
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1 rounded whitespace-nowrap pointer-events-none">
                                        {output.label}
                                    </span>
                                )}
                            </div>
                        ))
                    }
                </div >
            </div >
        </Card >
    );
});

BaseNode.displayName = "BaseNode";
