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

    return (
        <div className="h-full w-full bg-[#020202] text-white">
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
                    style: { stroke: '#6366f1', strokeWidth: 2 },
                }}
            >
                <Background color="#FFFFFF" gap={20} size={1} style={{ opacity: 0.05 }} />
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
