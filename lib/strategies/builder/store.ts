"use client";

import { create } from 'zustand';
import {
    Connection,
    EdgeChange,
    NodeChange,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
    Position
} from 'reactflow';
import { StrategyNode, StrategyEdge, StrategyMeta, SavedStrategy, isConnectionValid } from './types';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';
import dagre from 'dagre';

// Undo/Redo history entry
interface HistoryEntry {
    nodes: StrategyNode[];
    edges: StrategyEdge[];
}

interface BuilderState {
    nodes: StrategyNode[];
    edges: StrategyEdge[];
    meta: StrategyMeta;
    selectedNodeId: string | null;
    selectedNodeIds: string[]; // Multi-select
    isDirty: boolean;
    validationErrors: { nodeId?: string; message: string; hint?: string }[];
    errorNodeIds: string[];
    warningNodeIds: string[];

    // Undo/Redo
    history: HistoryEntry[];
    historyIndex: number;

    // Actions
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: StrategyNode) => void;
    updateNodeData: (id: string, data: Partial<StrategyNode['data']>) => void;
    removeNode: (id: string) => void;
    removeSelectedNodes: () => void;
    setSelectedNode: (id: string | null) => void;
    setSelectedNodes: (ids: string[]) => void;
    toggleNodeSelection: (id: string) => void;
    setMeta: (meta: Partial<StrategyMeta>) => void;

    // Undo/Redo
    undo: () => void;
    redo: () => void;
    pushHistory: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // Layout
    autoLayout: () => void;

    // UI State
    isLibraryOpen: boolean;
    libraryCategoryFilter: string | null;
    openLibrary: (category?: string) => void;
    closeLibrary: () => void;

    // Zoom to node
    zoomToNode: (nodeId: string) => void;
    setZoomToNodeCallback: (cb: (nodeId: string) => void) => void;
    _zoomCallback: ((nodeId: string) => void) | null;

    // Config
    reset: () => void;
    loadStrategy: (strategy: SavedStrategy) => void;
    getStrategyJSON: () => any;
    validate: () => boolean;
}

const DEFAULT_META: StrategyMeta = {
    name: 'Untitled Strategy',
    timeframe: '1m',
    symbol: 'BTCUSDT'
};

// Model B Default Graph: Trigger -> CandleSource
const createDefaultGraph = (): { nodes: StrategyNode[]; edges: StrategyEdge[] } => ({
    nodes: [
        {
            id: 'trigger-1',
            type: 'triggerNode',
            position: { x: 100, y: 150 },
            data: {
                label: 'On Bar Close',
                type: 'TRIGGER',
                subType: 'ON_BAR_CLOSE',
                params: {},
                isCore: true
            },
            dragHandle: '.custom-drag-handle',
        },
        {
            id: 'candle-1',
            type: 'candleSourceNode',
            position: { x: 350, y: 150 },
            data: {
                label: 'OHLCV: close',
                type: 'CANDLE_SOURCE',
                subType: '',
                params: { field: 'close' },
                isCore: true
            },
            dragHandle: '.custom-drag-handle',
        }
    ],
    edges: [
        {
            id: 'e-trigger-candle',
            source: 'trigger-1',
            target: 'candle-1',
            sourceHandle: 'event',
            targetHandle: 'event',
            animated: true,
            style: { stroke: '#6366f1' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
        }
    ]
});

const DEFAULT_GRAPH = createDefaultGraph();
const MAX_HISTORY = 50;

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            nodes: DEFAULT_GRAPH.nodes,
            edges: DEFAULT_GRAPH.edges,
            meta: DEFAULT_META,
            selectedNodeId: null,
            selectedNodeIds: [],
            isDirty: false,
            validationErrors: [],
            errorNodeIds: [],
            warningNodeIds: [],
            history: [],
            historyIndex: -1,
            _zoomCallback: null,

            pushHistory: () => {
                const { nodes, edges, history, historyIndex } = get();
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
                if (newHistory.length > MAX_HISTORY) newHistory.shift();
                set({ history: newHistory, historyIndex: newHistory.length - 1 });
            },

            canUndo: () => get().historyIndex > 0,
            canRedo: () => get().historyIndex < get().history.length - 1,

            undo: () => {
                const { historyIndex, history } = get();
                if (historyIndex <= 0) return;
                const newIndex = historyIndex - 1;
                const entry = history[newIndex];
                // Don't restore if it would remove core nodes
                const hasTrigger = entry.nodes.some(n => n.data.type === 'TRIGGER');
                const hasCandle = entry.nodes.some(n => n.data.type === 'CANDLE_SOURCE');
                if (!hasTrigger || !hasCandle) return;
                set({ nodes: entry.nodes, edges: entry.edges, historyIndex: newIndex, isDirty: true });
            },

            redo: () => {
                const { historyIndex, history } = get();
                if (historyIndex >= history.length - 1) return;
                const newIndex = historyIndex + 1;
                const entry = history[newIndex];
                set({ nodes: entry.nodes, edges: entry.edges, historyIndex: newIndex, isDirty: true });
            },

            onNodesChange: (changes) => {
                const { nodes, pushHistory } = get();
                // Filter out removal of core nodes
                const filteredChanges = changes.filter(change => {
                    if (change.type === 'remove') {
                        const node = nodes.find(n => n.id === change.id);
                        if (node?.data.isCore) {
                            toast.error("Core nodes cannot be deleted");
                            return false;
                        }
                    }
                    return true;
                });

                if (filteredChanges.length === 0) return;

                // Push history before significant changes
                const hasRemove = filteredChanges.some(c => c.type === 'remove');
                if (hasRemove) pushHistory();

                set({
                    nodes: applyNodeChanges(filteredChanges, nodes),
                    isDirty: true
                });
            },

            onEdgesChange: (changes) => {
                const { pushHistory } = get();
                const hasRemove = changes.some(c => c.type === 'remove');
                if (hasRemove) pushHistory();

                set({
                    edges: applyEdgeChanges(changes, get().edges),
                    isDirty: true
                });
            },

            onConnect: (connection) => {
                if (!connection.source || !connection.target) return;

                const { nodes, edges, pushHistory } = get();
                const sourceNode = nodes.find(n => n.id === connection.source);
                const targetNode = nodes.find(n => n.id === connection.target);

                if (!sourceNode || !targetNode) return;

                const sType = sourceNode.data.type;
                const tType = targetNode.data.type;
                const sSubType = sourceNode.data.subType;
                const tSubType = targetNode.data.subType;

                // Use type-based validation
                const validation = isConnectionValid(sType, sSubType, tType, tSubType, connection.targetHandle || undefined);
                if (!validation.valid) {
                    toast.error(validation.reason || "Invalid connection");
                    return;
                }

                // Check for cycles
                const wouldCreateCycle = (source: string, target: string): boolean => {
                    const visited = new Set<string>();
                    const queue = [target];
                    while (queue.length > 0) {
                        const current = queue.shift()!;
                        if (current === source) return true;
                        if (visited.has(current)) continue;
                        visited.add(current);
                        edges.filter(e => e.source === current).forEach(e => {
                            if (e.target) queue.push(e.target);
                        });
                    }
                    return false;
                };

                if (wouldCreateCycle(connection.source, connection.target)) {
                    toast.error("Creating a cycle is not allowed");
                    return;
                }

                const exists = edges.some(e => e.source === connection.source && e.target === connection.target && e.sourceHandle === connection.sourceHandle && e.targetHandle === connection.targetHandle);
                if (exists) return;

                pushHistory();

                const edge: StrategyEdge = {
                    ...connection,
                    id: `e-${connection.source}-${connection.target}-${Date.now()}`,
                    source: connection.source,
                    target: connection.target,
                    animated: true,
                    style: { stroke: '#6366f1' },
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
                };
                set({
                    edges: addEdge(edge, get().edges),
                    isDirty: true
                });
            },

            addNode: (node) => {
                const { nodes, pushHistory } = get();

                if (node.data.type === 'TRIGGER') {
                    toast.error("Strategy already has a Trigger.");
                    return;
                }

                if (node.data.type === 'CANDLE_SOURCE') {
                    toast.error("Strategy already has a Candle Source.");
                    return;
                }

                if (node.data.type === 'RISK') {
                    const hasRisk = nodes.some(n => n.data.type === 'RISK');
                    if (hasRisk) {
                        toast.error("Strategy can only have one Risk Profile.");
                        return;
                    }
                }

                if (node.data.type === 'HEDGE') {
                    const hasHedge = nodes.some(n => n.data.type === 'HEDGE');
                    if (hasHedge) {
                        toast.error("Strategy can only have one Hedge Guard.");
                        return;
                    }
                }

                if (node.data.type === 'GUARD' && node.data.subType === 'COOLDOWN_BARS') {
                    const hasCooldown = nodes.some(n => n.data.type === 'GUARD' && n.data.subType === 'COOLDOWN_BARS');
                    if (hasCooldown) {
                        toast.error("Strategy can only have one Cooldown Guard.");
                        return;
                    }
                }

                // Recipe Builder singleton checks
                if (node.data.type === 'DAILY_GUARDS') {
                    const hasDailyGuards = nodes.some(n => n.data.type === 'DAILY_GUARDS');
                    if (hasDailyGuards) {
                        toast.error("Strategy can only have one Daily Guards node.");
                        return;
                    }
                }

                if (node.data.type === 'POSITION_POLICY') {
                    const hasPositionPolicy = nodes.some(n => n.data.type === 'POSITION_POLICY');
                    if (hasPositionPolicy) {
                        toast.error("Strategy can only have one Position Policy node.");
                        return;
                    }
                }

                pushHistory();

                // Lane-based Y positioning for auto-placement
                const { getLaneForNodeType } = require('./types');
                const lane = getLaneForNodeType(node.data.type);
                const laneYBase = lane === 'SIGNAL' ? 100 : lane === 'ORDER' ? 350 : 550;
                const adjustedNode = {
                    ...node,
                    position: {
                        x: node.position.x,
                        y: laneYBase + Math.random() * 80
                    }
                };

                set((state) => ({
                    nodes: [...state.nodes, adjustedNode],
                    selectedNodeId: node.id,
                    selectedNodeIds: [node.id],
                    isDirty: true
                }));
            },

            updateNodeData: (id, data) => {
                get().pushHistory();
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
                    ),
                    isDirty: true
                }));
            },

            removeNode: (id) => {
                const { nodes, pushHistory } = get();
                const node = nodes.find(n => n.id === id);
                if (node?.data.isCore) {
                    toast.error("Core nodes cannot be deleted");
                    return;
                }

                pushHistory();

                set((state) => ({
                    nodes: state.nodes.filter((node) => node.id !== id),
                    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
                    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
                    selectedNodeIds: state.selectedNodeIds.filter(nid => nid !== id),
                    isDirty: true
                }));
            },

            removeSelectedNodes: () => {
                const { selectedNodeIds, nodes, pushHistory } = get();
                const toRemove = selectedNodeIds.filter(id => {
                    const node = nodes.find(n => n.id === id);
                    return node && !node.data.isCore;
                });
                if (toRemove.length === 0) return;

                pushHistory();

                set((state) => ({
                    nodes: state.nodes.filter(n => !toRemove.includes(n.id)),
                    edges: state.edges.filter(e => !toRemove.includes(e.source) && !toRemove.includes(e.target)),
                    selectedNodeId: null,
                    selectedNodeIds: [],
                    isDirty: true
                }));
            },

            setSelectedNode: (id) => set({ selectedNodeId: id, selectedNodeIds: id ? [id] : [] }),

            setSelectedNodes: (ids) => set({ selectedNodeIds: ids, selectedNodeId: ids[0] || null }),

            toggleNodeSelection: (id) => {
                const { selectedNodeIds } = get();
                if (selectedNodeIds.includes(id)) {
                    set({ selectedNodeIds: selectedNodeIds.filter(nid => nid !== id), selectedNodeId: null });
                } else {
                    set({ selectedNodeIds: [...selectedNodeIds, id], selectedNodeId: id });
                }
            },

            setMeta: (meta) => set((state) => ({ meta: { ...state.meta, ...meta }, isDirty: true })),

            setZoomToNodeCallback: (cb) => set({ _zoomCallback: cb }),

            zoomToNode: (nodeId) => {
                const { _zoomCallback, nodes } = get();
                const node = nodes.find(n => n.id === nodeId);
                if (node && _zoomCallback) {
                    _zoomCallback(nodeId);
                }
                set({ selectedNodeId: nodeId, selectedNodeIds: [nodeId] });
            },



            reset: () => set({
                nodes: DEFAULT_GRAPH.nodes,
                edges: DEFAULT_GRAPH.edges,
                meta: DEFAULT_META,
                selectedNodeId: null,
                selectedNodeIds: [],
                isDirty: false,
                validationErrors: [],
                errorNodeIds: [],
                warningNodeIds: [],
                history: [],
                historyIndex: -1
            }),

            loadStrategy: (strategy) => {
                let nodes = [...(strategy.nodes || [])];
                let edges = [...(strategy.edges || [])];

                // Handle unknown node types
                const knownTypes = ['triggerNode', 'candleSourceNode', 'indicatorNode', 'conditionNode',
                    'actionNode', 'riskNode', 'hedgeNode', 'logicNode', 'valueNode',
                    'guardNode', 'exprNode'];
                nodes = nodes.map(n => {
                    if (!knownTypes.includes(n.type || '')) {
                        return {
                            ...n,
                            type: 'unknownNode',
                            data: { ...n.data, originalType: n.type, isUnknown: true }
                        };
                    }
                    return n;
                });

                // --- Normalize TRIGGER ---
                const triggers = nodes.filter(n => n.data.type === 'TRIGGER');
                let mainTriggerId = '';

                if (triggers.length === 0) {
                    const defaultTrigger = DEFAULT_GRAPH.nodes.find(n => n.data.type === 'TRIGGER')!;
                    nodes.push(defaultTrigger);
                    mainTriggerId = defaultTrigger.id;
                } else {
                    mainTriggerId = triggers[0].id;
                    nodes = nodes.map(n => n.id === mainTriggerId ? { ...n, data: { ...n.data, isCore: true } } : n);
                    if (triggers.length > 1) {
                        const duplicateIds = triggers.slice(1).map(t => t.id);
                        nodes = nodes.filter(n => !duplicateIds.includes(n.id));
                        edges = edges.map(e => duplicateIds.includes(e.source) ? { ...e, source: mainTriggerId } : e);
                        edges = edges.map(e => duplicateIds.includes(e.target) ? { ...e, target: mainTriggerId } : e);
                    }
                }

                // --- Normalize CANDLE_SOURCE ---
                const candleSources = nodes.filter(n => n.data.type === 'CANDLE_SOURCE');
                let mainCandleId = '';

                if (candleSources.length === 0) {
                    const defaultCandle = DEFAULT_GRAPH.nodes.find(n => n.data.type === 'CANDLE_SOURCE')!;
                    nodes.push(defaultCandle);
                    mainCandleId = defaultCandle.id;
                } else {
                    mainCandleId = candleSources[0].id;
                    nodes = nodes.map(n => n.id === mainCandleId ? { ...n, data: { ...n.data, isCore: true } } : n);
                    if (candleSources.length > 1) {
                        const duplicateIds = candleSources.slice(1).map(c => c.id);
                        nodes = nodes.filter(n => !duplicateIds.includes(n.id));
                        edges = edges.map(e => duplicateIds.includes(e.source) ? { ...e, source: mainCandleId } : e);
                        edges = edges.map(e => duplicateIds.includes(e.target) ? { ...e, target: mainCandleId } : e);
                    }
                }

                // Remove exact duplicate edges
                const seenEdges = new Set<string>();
                edges = edges.filter(e => {
                    const key = `${e.source}-${e.target}-${e.sourceHandle}-${e.targetHandle}`;
                    if (seenEdges.has(key)) return false;
                    seenEdges.add(key);
                    return true;
                });

                set({
                    nodes,
                    edges,
                    meta: strategy.meta || DEFAULT_META,
                    selectedNodeId: null,
                    selectedNodeIds: [],
                    isDirty: false,
                    validationErrors: [],
                    errorNodeIds: [],
                    warningNodeIds: [],
                    history: [{ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
                    historyIndex: 0
                });
            },

            validate: () => {
                const { nodes, edges } = get();
                const errors: { nodeId?: string; message: string; hint?: string }[] = [];
                const errorNodes: string[] = [];
                const warningNodes: string[] = [];

                // Unknown nodes error
                nodes.filter(n => n.data.isUnknown).forEach(n => {
                    errors.push({ nodeId: n.id, message: `[ERROR] Unknown node type: ${n.data.originalType}`, hint: 'Remove or update this node' });
                    errorNodes.push(n.id);
                });

                // Model B: Exactly 1 Trigger
                const triggers = nodes.filter(n => n.data.type === 'TRIGGER');
                if (triggers.length === 0) {
                    errors.push({ message: "[ERROR] Strategy must have exactly one Trigger." });
                } else if (triggers.length > 1) {
                    errors.push({ message: "[ERROR] Strategy can only have one Trigger." });
                    triggers.forEach(t => errorNodes.push(t.id));
                }

                // Model B: Exactly 1 CandleSource
                const candleSources = nodes.filter(n => n.data.type === 'CANDLE_SOURCE');
                if (candleSources.length === 0) {
                    errors.push({ message: "[ERROR] Strategy must have exactly one Candle Source." });
                } else if (candleSources.length > 1) {
                    errors.push({ message: "[ERROR] Strategy can only have one Candle Source." });
                    candleSources.forEach(c => errorNodes.push(c.id));
                }

                // Model B: Trigger must connect to CandleSource
                if (triggers.length === 1 && candleSources.length === 1) {
                    const triggerToCandleEdge = edges.find(e =>
                        e.source === triggers[0].id && e.target === candleSources[0].id
                    );
                    if (!triggerToCandleEdge) {
                        errors.push({ nodeId: triggers[0].id, message: "[ERROR] Trigger must connect to Candle Source.", hint: 'Connect Trigger event output to Candle Source' });
                        errorNodes.push(triggers[0].id);
                        errorNodes.push(candleSources[0].id);
                    }
                }

                // Reachability from Trigger
                if (triggers.length >= 1) {
                    const triggerId = triggers[0].id;
                    const reachable = new Set<string>([triggerId]);
                    const queue = [triggerId];
                    while (queue.length > 0) {
                        const current = queue.shift()!;
                        const outgoing = edges.filter(e => e.source === current);
                        for (const edge of outgoing) {
                            if (edge.target && !reachable.has(edge.target)) {
                                reachable.add(edge.target);
                                queue.push(edge.target);
                            }
                        }
                    }

                    const actions = nodes.filter(n => n.data.type === 'ACTION');
                    if (actions.length === 0) {
                        errors.push({ message: "[ERROR] Strategy needs at least one Action node." });
                    } else {
                        // Check each action has boolean gate upstream
                        actions.forEach(action => {
                            if (!reachable.has(action.id)) {
                                errors.push({ nodeId: action.id, message: `[ERROR] '${action.data.label}' not reachable from Trigger.`, hint: 'Connect this action to the main flow' });
                                errorNodes.push(action.id);
                            } else {
                                // Check boolean input
                                const incoming = edges.filter(e => e.target === action.id && e.targetHandle === 'trigger');
                                if (incoming.length === 0) {
                                    errors.push({ nodeId: action.id, message: `[ERROR] '${action.data.label}' has no trigger input.`, hint: 'Connect a condition/logic gate to trigger input' });
                                    errorNodes.push(action.id);
                                }
                            }
                        });
                    }

                    // Unreachable nodes warning (exclude config nodes)
                    const unreachable = nodes.filter(n =>
                        !reachable.has(n.id) &&
                        n.data.type !== 'RISK' &&
                        n.data.type !== 'VALUE' &&
                        n.data.type !== 'HEDGE' &&
                        n.data.type !== 'GUARD'
                    );

                    if (unreachable.length > 0) {
                        errors.push({ message: `[WARNING] ${unreachable.length} node(s) unreachable from trigger.` });
                        unreachable.forEach(u => warningNodes.push(u.id));
                    }
                }

                // Recipe Builder: Check Package Nodes connectivity
                const recipeNodes = nodes.filter(n => ['ENTRY_ORDER', 'EXIT_MANAGER', 'POSITION_POLICY', 'DAILY_GUARDS'].includes(n.data.type));
                recipeNodes.forEach(node => {
                    const incoming = edges.filter(e => e.target === node.id);
                    if (incoming.length === 0) {
                        errors.push({ nodeId: node.id, message: `[ERROR] '${node.data.label}' is disconnected.`, hint: 'Connect it to the flow.' });
                        errorNodes.push(node.id);
                    }
                });

                // Node Specific Validation
                nodes.forEach(n => {
                    // Indicator: Check Period
                    if (n.data.type === 'INDICATOR' && !n.data.params?.period) {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing 'period'.`, hint: 'Set period parameter in Inspector' });
                        errorNodes.push(n.id);
                    }


                    // Compare/Crossover: Check Inputs (skip price conditions)
                    if (n.data.type === 'CONDITION' &&
                        n.data.subType !== 'PRICE_CROSS_LEVEL' &&
                        n.data.subType !== 'PRICE_IN_RANGE') {
                        const incoming = edges.filter(e => e.target === n.id);
                        const hasA = incoming.some(e => e.targetHandle === 'a');
                        const hasB = incoming.some(e => e.targetHandle === 'b');

                        if (!hasA || !hasB) {
                            errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' requires 2 inputs.`, hint: 'Connect indicators or values to A and B inputs' });
                            errorNodes.push(n.id);
                        }

                        if (n.data.subType === 'COMPARE' && !n.data.params?.op) {
                            errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing operator.`, hint: 'Select operator in Inspector' });
                            errorNodes.push(n.id);
                        }
                        if (n.data.subType === 'CROSSOVER' && !n.data.params?.direction) {
                            errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing direction.`, hint: 'Select UP or DOWN in Inspector' });
                            errorNodes.push(n.id);
                        }
                    }

                    // Candle Source Warning
                    if (n.data.type === 'CANDLE_SOURCE') {
                        const outgoing = edges.filter(e => e.source === n.id);
                        if (outgoing.length === 0) {
                            errors.push({ nodeId: n.id, message: `[WARNING] Candle Source not connected.`, hint: 'Connect to indicators' });
                            warningNodes.push(n.id);
                        }
                    }

                    // EXPR validation
                    if (n.data.type === 'EXPR') {
                        const expr = n.data.params?.expression;
                        if (!expr || expr.trim() === '') {
                            errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' has no expression.`, hint: 'Enter a valid expression' });
                            errorNodes.push(n.id);
                        } else {
                            // Basic validation
                            const allowed = /^[a-zA-Z0-9_\s\(\)\+\-\*\/\<\>\=\!\&\|\.\,]+$/;
                            if (!allowed.test(expr)) {
                                errors.push({ nodeId: n.id, message: `[ERROR] Invalid characters in expression.`, hint: 'Only use: ema,sma,rsi,highest,lowest,abs,min,max' });
                                errorNodes.push(n.id);
                            }
                        }
                    }

                    // COOLDOWN validation
                    if (n.data.type === 'GUARD' && n.data.subType === 'COOLDOWN_BARS') {
                        const bars = n.data.params?.bars;
                        if (!bars || bars <= 0) {
                            errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' needs bars > 0.`, hint: 'Set cooldown bars in Inspector' });
                            errorNodes.push(n.id);
                        }
                    }
                });

                // HEDGE validation
                nodes.filter(n => n.data.type === 'HEDGE').forEach(n => {
                    const { minLongUnits, minShortUnits } = n.data.params || {};
                    if (minLongUnits === undefined || minLongUnits === null || minLongUnits === '') {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing minLongUnits.`, hint: 'Set minLongUnits in Inspector' });
                        errorNodes.push(n.id);
                    }
                    if (minShortUnits === undefined || minShortUnits === null || minShortUnits === '') {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing minShortUnits.`, hint: 'Set minShortUnits in Inspector' });
                        errorNodes.push(n.id);
                    }
                });

                // PRICE_CROSS_LEVEL validation
                nodes.filter(n => n.data.type === 'CONDITION' && n.data.subType === 'PRICE_CROSS_LEVEL').forEach(n => {
                    const incoming = edges.filter(e => e.target === n.id);
                    if (!incoming.some(e => e.targetHandle === 'price')) {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' needs price input.`, hint: 'Connect Candle Source series output' });
                        errorNodes.push(n.id);
                    }
                    if (!n.data.params?.level && n.data.params?.level !== 0) {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing level.`, hint: 'Set price level in Inspector' });
                        errorNodes.push(n.id);
                    }
                });

                // PRICE_IN_RANGE validation + spam warning
                nodes.filter(n => n.data.type === 'CONDITION' && n.data.subType === 'PRICE_IN_RANGE').forEach(n => {
                    const incoming = edges.filter(e => e.target === n.id);
                    if (!incoming.some(e => e.targetHandle === 'price')) {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' needs price input.`, hint: 'Connect Candle Source series output' });
                        errorNodes.push(n.id);
                    }
                    const { low, high } = n.data.params || {};
                    if (low === undefined || low === null || low === '') {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing low value.`, hint: 'Set low price in Inspector' });
                        errorNodes.push(n.id);
                    }
                    if (high === undefined || high === null || high === '') {
                        errors.push({ nodeId: n.id, message: `[ERROR] '${n.data.label}' missing high value.`, hint: 'Set high price in Inspector' });
                        errorNodes.push(n.id);
                    }

                    // Spam warning if no cooldown
                    const hasCooldown = nodes.some(g => g.data.type === 'GUARD' && g.data.subType === 'COOLDOWN_BARS');
                    if (!hasCooldown) {
                        errors.push({ nodeId: n.id, message: `[WARNING] Price range may fire continuously. Add COOLDOWN_BARS guard.`, hint: 'Add Cooldown guard from Block Library' });
                        warningNodes.push(n.id);
                    }
                });

                // General Warning: Missing Candle Source
                const hasCandleSource = nodes.some(n => n.data.type === 'CANDLE_SOURCE');
                const hasIndicators = nodes.some(n => n.data.type === 'INDICATOR');
                if (hasIndicators && !hasCandleSource) {
                    errors.push({ message: `[WARNING] Strategy has indicators but no Candle Source.` });
                }

                const errorCount = errors.filter(e => e.message.startsWith('[ERROR]')).length;

                set({ validationErrors: errors, errorNodeIds: errorNodes, warningNodeIds: warningNodes });
                return errorCount === 0;
            },

            // UI State Implementation
            isLibraryOpen: false,
            libraryCategoryFilter: null,
            openLibrary: (category) => set({ isLibraryOpen: true, libraryCategoryFilter: category || null }),
            closeLibrary: () => set({ isLibraryOpen: false, libraryCategoryFilter: null }),

            // Layout
            autoLayout: () => {
                const { nodes, edges, pushHistory } = get();
                pushHistory();

                const dagreGraph = new dagre.graphlib.Graph();
                dagreGraph.setGraph({ rankdir: 'LR', align: 'UL', ranksep: 80, nodesep: 30 });
                dagreGraph.setDefaultEdgeLabel(() => ({}));

                // Define lane boundaries (Y-axis centers)
                const LANES = {
                    SIGNAL: { center: 140 },
                    ORDER: { center: 380 },
                    RISK: { center: 580 }
                };

                // Group nodes by lane
                const { getLaneForNodeType } = require('./types');

                nodes.forEach((node) => {
                    dagreGraph.setNode(node.id, { width: 176, height: 80 });
                });

                edges.forEach((edge) => {
                    dagreGraph.setEdge(edge.source, edge.target);
                });

                dagre.layout(dagreGraph);

                const newNodes = nodes.map((node) => {
                    const nodeWithPosition = dagreGraph.node(node.id);
                    const laneType = getLaneForNodeType(node.data.type);

                    // Keep X from DAGRE (flow order) but FORCE Y based on Lane
                    let targetY = LANES.SIGNAL.center;
                    if (laneType === 'ORDER') targetY = LANES.ORDER.center;
                    if (laneType === 'RISK') targetY = LANES.RISK.center;

                    return {
                        ...node,
                        position: {
                            x: nodeWithPosition.x - 176 / 2 + 50,
                            y: targetY - 40 // Center node vertically in lane
                        },
                        targetPosition: Position.Left,
                        sourcePosition: Position.Right,
                    };
                });

                set({ nodes: newNodes, isDirty: true });
            },

            getStrategyJSON: () => {
                const { nodes, edges, meta } = get();

                const trigger = nodes.find(n => n.data.type === 'TRIGGER');
                const risk = nodes.find(n => n.data.type === 'RISK');
                const hedge = nodes.find(n => n.data.type === 'HEDGE');
                const cooldown = nodes.find(n => n.data.type === 'GUARD' && n.data.subType === 'COOLDOWN_BARS');

                const riskDefaults = {
                    positionSizePct: 10,
                    maxLeverage: 3,
                    maxDailyLossPct: 5,
                    cooldownMinutes: 0,
                    slPct: null,
                    tpPct: null
                };

                return {
                    version: '0.2',
                    meta,
                    graph: {
                        nodes: nodes.map(n => ({
                            id: n.id,
                            type: n.data.type,
                            params: {
                                ...n.data.params,
                                subType: n.data.subType
                            },
                            disabled: false
                        })),
                        edges: edges.map(e => ({
                            id: e.id,
                            source: e.source,
                            target: e.target,
                            sourceHandle: e.sourceHandle || null,
                            targetHandle: e.targetHandle || null
                        }))
                    },
                    entry: {
                        triggerNodeId: trigger?.id || null
                    },
                    risk: risk ? {
                        positionSizePct: risk.data.params?.positionSizePct ?? riskDefaults.positionSizePct,
                        maxLeverage: risk.data.params?.maxLeverage ?? riskDefaults.maxLeverage,
                        maxDailyLossPct: risk.data.params?.maxDailyLossPct ?? riskDefaults.maxDailyLossPct,
                        cooldownMinutes: risk.data.params?.cooldownMinutes ?? riskDefaults.cooldownMinutes,
                        slPct: risk.data.params?.slPct ?? riskDefaults.slPct,
                        tpPct: risk.data.params?.tpPct ?? riskDefaults.tpPct
                    } : riskDefaults,
                    hedge: hedge ? {
                        minLongUnits: hedge.data.params?.minLongUnits ?? 0,
                        minShortUnits: hedge.data.params?.minShortUnits ?? 0
                    } : null,
                    guards: {
                        cooldownBars: cooldown ? (cooldown.data.params?.bars ?? 0) : 0
                    }
                };
            },

        }),
        {
            name: 'strategy-builder-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                meta: state.meta
            }),
        }
    )
);
