
"use client";

import { useBuilderStore } from "@/lib/strategies/builder/store";
import { useCallback, useMemo } from "react";
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    ReactFlowProvider
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

const nodeTypes = {
    triggerNode: TriggerNode,
    indicatorNode: IndicatorNode,
    conditionNode: ConditionNode,
    actionNode: ActionNode,
    riskNode: RiskNode,
    candleSourceNode: CandleSourceNode,
    valueNode: ValueNode,
    logicNode: LogicNode,
};

function BuilderCanvas() {
    const {
        nodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        setSelectedNode
    } = useBuilderStore();

    const onNodeClick = useCallback((_: any, node: any) => {
        setSelectedNode(node.id);
    }, [setSelectedNode]);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    return (
        <div className="h-full w-full bg-[#020202] text-white">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
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
                <MiniMap
                    className="bg-zinc-900 border border-zinc-800 rounded-lg"
                    nodeColor={(n) => {
                        if (n.type === 'triggerNode') return '#10b981';
                        if (n.type === 'actionNode') return '#f43f5e';
                        return '#6366f1';
                    }}
                />
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
