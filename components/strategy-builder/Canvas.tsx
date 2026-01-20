"use client";

import { useBuilderStore } from "@/lib/strategies/builder/store";
import { useCallback, useEffect } from "react";
import ReactFlow, {
    Background,
    Controls,
    ReactFlowProvider,
    useReactFlow,
    SelectionMode
} from "reactflow";
import "reactflow/dist/style.css";
import { toast } from "sonner";
import { Plus } from "lucide-react";

// Node Types
import { TriggerNode } from "./nodes/TriggerNode";
import { IndicatorNode } from "./nodes/IndicatorNode";
import { ConditionNode } from "./nodes/ConditionNode";
import { ActionNode } from "./nodes/ActionNode";
import { RiskNode } from "./nodes/RiskNode";
import { CandleSourceNode } from "./nodes/CandleSourceNode";
import { ValueNode } from "./nodes/ValueNode";
import { LogicNode } from "./nodes/LogicNode";
import { HedgeNode } from "./nodes/HedgeNode";
import { GuardNode } from "./nodes/GuardNode";
import { ExprNode } from "./nodes/ExprNode";
import { UnknownNode } from "./nodes/UnknownNode";
// Recipe Builder Package Nodes
import { EntryOrderNode } from "./nodes/EntryOrderNode";
import { ExitManagerNode } from "./nodes/ExitManagerNode";
import { PositionPolicyNode } from "./nodes/PositionPolicyNode";
import { DailyGuardsNode } from "./nodes/DailyGuardsNode";

const nodeTypes = {
    triggerNode: TriggerNode,
    indicatorNode: IndicatorNode,
    conditionNode: ConditionNode,
    actionNode: ActionNode,
    riskNode: RiskNode,
    candleSourceNode: CandleSourceNode,
    valueNode: ValueNode,
    logicNode: LogicNode,
    hedgeNode: HedgeNode,
    guardNode: GuardNode,
    exprNode: ExprNode,
    unknownNode: UnknownNode,
    // Recipe Builder
    entryOrderNode: EntryOrderNode,
    exitManagerNode: ExitManagerNode,
    positionPolicyNode: PositionPolicyNode,
    dailyGuardsNode: DailyGuardsNode,
};

function BuilderCanvas() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setSelectedNode,
        setSelectedNodes,
        toggleNodeSelection,
        selectedNodeIds,
        undo,
        redo,
        removeSelectedNodes,
        setZoomToNodeCallback,
        pushHistory
    } = useBuilderStore();

    const reactFlow = useReactFlow();

    // Register zoom callback
    useEffect(() => {
        setZoomToNodeCallback((nodeId: string) => {
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
                reactFlow.setCenter(node.position.x + 100, node.position.y + 50, { zoom: 1.2, duration: 500 });
            }
        });
    }, [nodes, reactFlow, setZoomToNodeCallback]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Undo: Ctrl+Z or Cmd+Z
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undo();
            }
            // Redo: Ctrl+Shift+Z or Ctrl+Y
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redo();
            }
            // Delete selected
            if (e.key === 'Delete' || e.key === 'Backspace') {
                if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    removeSelectedNodes();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, removeSelectedNodes]);

    // Push initial history on mount
    useEffect(() => {
        if (nodes.length > 0) {
            pushHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onNodeClick = useCallback((_: any, node: any) => {
        setSelectedNode(node.id);
    }, [setSelectedNode]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    const onSelectionChange = useCallback(({ nodes: selectedNodes }: { nodes: any[] }) => {
        setSelectedNodes(selectedNodes.map(n => n.id));
    }, [setSelectedNodes]);

    // Lane Logic: Access to store actions
    const openLibrary = useBuilderStore(s => s.openLibrary);

    return (
        <div className="h-full w-full bg-[#020202] text-white relative">
            <ReactFlow
                nodes={nodes.map(n => ({ ...n, selected: selectedNodeIds.includes(n.id) }))}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onSelectionChange={onSelectionChange}
                selectionMode={SelectionMode.Partial}
                panOnDrag={true}
                fitView
                snapToGrid
                snapGrid={[15, 15]}
                defaultEdgeOptions={{
                    animated: true,
                    style: { stroke: '#6366f1', strokeWidth: 2, filter: 'drop-shadow(0 0 3px #6366f1aa)' },
                }}
            >
                <Background color="#FFFFFF" gap={20} size={1} style={{ opacity: 0.05 }} />

                {/* Lane Background Bands */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {/* Signal Band */}
                    <div className="absolute top-0 left-0 right-0 h-[280px] bg-emerald-500/[0.02] border-b border-emerald-500/5 select-none" />
                    {/* Order Band */}
                    <div className="absolute top-[280px] left-0 right-0 h-[200px] bg-indigo-500/[0.02] border-b border-indigo-500/5 select-none" />
                    {/* Risk Band */}
                    <div className="absolute top-[480px] left-0 right-0 bottom-0 bg-rose-500/[0.02] select-none" />
                </div>

                {/* Lane Headers */}
                <div className="absolute left-6 top-6 z-20 space-y-[210px] pointer-events-none">
                    {/* Signal Header */}
                    <div className="flex flex-col gap-1 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Signal Lane</span>
                            <button
                                onClick={() => openLibrary('Logic')}
                                className="p-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 max-w-[150px]">Tetikleyiciler, indikatörler ve mantıksal koşullar.</p>
                    </div>

                    {/* Order Header */}
                    <div className="flex flex-col gap-1 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Order Lane</span>
                            <button
                                onClick={() => openLibrary('🍳 Recipe Blocks')}
                                className="p-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 max-w-[150px]">Emir tipi, yönü ve pozisyon politikası.</p>
                    </div>

                    {/* Risk Header */}
                    <div className="flex flex-col gap-1 pointer-events-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-widest text-rose-400">Risk & Guard Lane</span>
                            <button
                                onClick={() => openLibrary('Risk')}
                                className="p-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                        <p className="text-[10px] text-zinc-500 max-w-[150px]">Günlük limitler, SL/TP ve teknik korumalar.</p>
                    </div>
                </div>

                <Controls className="bg-zinc-900 border-zinc-800 fill-white text-white" />
            </ReactFlow>
        </div>
    );
}

export function Canvas() {
    return (
        <ReactFlowProvider>
            <BuilderCanvas />
        </ReactFlowProvider>
    );
}
