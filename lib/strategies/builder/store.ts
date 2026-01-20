
import { create } from 'zustand';
import {
    Connection,
    EdgeChange,
    NodeChange,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType
} from 'reactflow';
import { StrategyNode, StrategyEdge, StrategyMeta, SavedStrategy, isConnectionValid } from './types';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

interface BuilderState {
    nodes: StrategyNode[];
    edges: StrategyEdge[];
    meta: StrategyMeta;
    selectedNodeId: string | null;
    isDirty: boolean;
    validationErrors: string[];
    errorNodeIds: string[];
    warningNodeIds: string[];

    // Actions
    onNodesChange: (changes: NodeChange[]) => void;
    onEdgesChange: (changes: EdgeChange[]) => void;
    onConnect: (connection: Connection) => void;
    addNode: (node: StrategyNode) => void;
    updateNodeData: (id: string, data: Partial<StrategyNode['data']>) => void;
    removeNode: (id: string) => void;
    setSelectedNode: (id: string | null) => void;
    setMeta: (meta: Partial<StrategyMeta>) => void;

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

export const useBuilderStore = create<BuilderState>()(
    persist(
        (set, get) => ({
            nodes: DEFAULT_GRAPH.nodes,
            edges: DEFAULT_GRAPH.edges,
            meta: DEFAULT_META,
            selectedNodeId: null,
            isDirty: false,
            validationErrors: [],
            errorNodeIds: [],
            warningNodeIds: [],

            onNodesChange: (changes) => {
                // Filter out removal of core nodes
                const filteredChanges = changes.filter(change => {
                    if (change.type === 'remove') {
                        const node = get().nodes.find(n => n.id === change.id);
                        if (node?.data.isCore) {
                            toast.error("Core nodes cannot be deleted");
                            return false;
                        }
                    }
                    return true;
                });

                if (filteredChanges.length === 0) return;

                set({
                    nodes: applyNodeChanges(filteredChanges, get().nodes),
                    isDirty: true
                });
            },

            onEdgesChange: (changes) => {
                set({
                    edges: applyEdgeChanges(changes, get().edges),
                    isDirty: true
                });
            },

            onConnect: (connection) => {
                if (!connection.source || !connection.target) return;

                const { nodes, edges } = get();
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
                const { nodes } = get();

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

                set((state) => ({
                    nodes: [...state.nodes, node],
                    selectedNodeId: node.id,
                    isDirty: true
                }));
            },

            updateNodeData: (id, data) => {
                set((state) => ({
                    nodes: state.nodes.map((node) =>
                        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
                    ),
                    isDirty: true
                }));
            },

            removeNode: (id) => {
                const { nodes } = get();
                const node = nodes.find(n => n.id === id);
                if (node?.data.isCore) {
                    toast.error("Core nodes cannot be deleted");
                    return;
                }

                set((state) => ({
                    nodes: state.nodes.filter((node) => node.id !== id),
                    edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
                    selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
                    isDirty: true
                }));
            },

            setSelectedNode: (id) => set({ selectedNodeId: id }),

            setMeta: (meta) => set((state) => ({ meta: { ...state.meta, ...meta }, isDirty: true })),

            reset: () => set({
                nodes: DEFAULT_GRAPH.nodes,
                edges: DEFAULT_GRAPH.edges,
                meta: DEFAULT_META,
                selectedNodeId: null,
                isDirty: false,
                validationErrors: [],
                errorNodeIds: [],
                warningNodeIds: []
            }),

            loadStrategy: (strategy) => {
                let nodes = [...(strategy.nodes || [])];
                let edges = [...(strategy.edges || [])];

                // --- Normalize TRIGGER ---
                const triggers = nodes.filter(n => n.data.type === 'TRIGGER');
                let mainTriggerId = '';

                if (triggers.length === 0) {
                    // Add missing trigger
                    const defaultTrigger = DEFAULT_GRAPH.nodes.find(n => n.data.type === 'TRIGGER')!;
                    nodes.push(defaultTrigger);
                    mainTriggerId = defaultTrigger.id;
                } else {
                    mainTriggerId = triggers[0].id;
                    // Mark as core
                    nodes = nodes.map(n => n.id === mainTriggerId ? { ...n, data: { ...n.data, isCore: true } } : n);
                    // Remove duplicates
                    if (triggers.length > 1) {
                        const duplicateIds = triggers.slice(1).map(t => t.id);
                        nodes = nodes.filter(n => !duplicateIds.includes(n.id));
                        // Redirect edges from duplicates to main
                        edges = edges.map(e => duplicateIds.includes(e.source) ? { ...e, source: mainTriggerId } : e);
                        edges = edges.map(e => duplicateIds.includes(e.target) ? { ...e, target: mainTriggerId } : e);
                    }
                }

                // --- Normalize CANDLE_SOURCE ---
                const candleSources = nodes.filter(n => n.data.type === 'CANDLE_SOURCE');
                let mainCandleId = '';

                if (candleSources.length === 0) {
                    // Add missing candle source
                    const defaultCandle = DEFAULT_GRAPH.nodes.find(n => n.data.type === 'CANDLE_SOURCE')!;
                    nodes.push(defaultCandle);
                    mainCandleId = defaultCandle.id;
                } else {
                    mainCandleId = candleSources[0].id;
                    // Mark as core
                    nodes = nodes.map(n => n.id === mainCandleId ? { ...n, data: { ...n.data, isCore: true } } : n);
                    // Remove duplicates
                    if (candleSources.length > 1) {
                        const duplicateIds = candleSources.slice(1).map(c => c.id);
                        nodes = nodes.filter(n => !duplicateIds.includes(n.id));
                        // Redirect edges
                        edges = edges.map(e => duplicateIds.includes(e.source) ? { ...e, source: mainCandleId } : e);
                        edges = edges.map(e => duplicateIds.includes(e.target) ? { ...e, target: mainCandleId } : e);
                    }
                }

                // Remove exact duplicate edges that might have been created by redirection
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
                    isDirty: false,
                    validationErrors: [],
                    errorNodeIds: [],
                    warningNodeIds: []
                });
            },

            validate: () => {
                const { nodes, edges } = get();
                const errors: string[] = [];
                const errorNodes: string[] = [];
                const warningNodes: string[] = [];

                // Model B: Exactly 1 Trigger
                const triggers = nodes.filter(n => n.data.type === 'TRIGGER');
                if (triggers.length === 0) {
                    errors.push("[ERROR] Strategy must have exactly one Trigger.");
                } else if (triggers.length > 1) {
                    errors.push("[ERROR] Strategy can only have one Trigger.");
                    triggers.forEach(t => errorNodes.push(t.id));
                }

                // Model B: Exactly 1 CandleSource
                const candleSources = nodes.filter(n => n.data.type === 'CANDLE_SOURCE');
                if (candleSources.length === 0) {
                    errors.push("[ERROR] Strategy must have exactly one Candle Source.");
                } else if (candleSources.length > 1) {
                    errors.push("[ERROR] Strategy can only have one Candle Source.");
                    candleSources.forEach(c => errorNodes.push(c.id));
                }

                // Model B: Trigger must connect to CandleSource
                if (triggers.length === 1 && candleSources.length === 1) {
                    const triggerToCandleEdge = edges.find(e =>
                        e.source === triggers[0].id && e.target === candleSources[0].id
                    );
                    if (!triggerToCandleEdge) {
                        errors.push("[ERROR] Trigger must connect to Candle Source.");
                        errorNodes.push(triggers[0].id);
                        errorNodes.push(candleSources[0].id);
                    }
                }

                // Reachability from Trigger
                if (triggers.length >= 1) {
                    const triggerAndId = triggers[0].id;
                    const reachable = new Set<string>([triggerAndId]);
                    const queue = [triggerAndId];
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
                        errors.push("[ERROR] Strategy needs at least one Action node.");
                    } else {
                        const reachableAction = actions.some(a => reachable.has(a.id));
                        if (!reachableAction) {
                            errors.push("[ERROR] No Action is reachable from the Trigger.");
                            actions.forEach(a => errorNodes.push(a.id));
                        }
                    }

                    // Unreachable nodes warning (exclude Risk/Value)
                    const unreachable = nodes.filter(n =>
                        !reachable.has(n.id) &&
                        n.data.type !== 'RISK' &&
                        n.data.type !== 'VALUE'
                    );

                    if (unreachable.length > 0) {
                        errors.push(`[WARNING] ${unreachable.length} node(s) unreachable from trigger.`);
                        unreachable.forEach(u => warningNodes.push(u.id));
                    }
                }

                // Node Specific Validation
                nodes.forEach(n => {
                    // Indicator: Check Period
                    if (n.data.type === 'INDICATOR' && !n.data.params?.period) {
                        errors.push(`[ERROR] '${n.data.label}' missing 'period'.`);
                        errorNodes.push(n.id);
                    }

                    // Compare/Crossover: Check Inputs
                    if (n.data.type === 'CONDITION') {
                        const incoming = edges.filter(e => e.target === n.id);
                        const hasA = incoming.some(e => e.targetHandle === 'a');
                        const hasB = incoming.some(e => e.targetHandle === 'b');

                        if (!hasA || !hasB) {
                            errors.push(`[ERROR] '${n.data.label}' requires 2 inputs.`);
                            errorNodes.push(n.id);
                        }

                        if (n.data.subType === 'COMPARE' && !n.data.params?.op) {
                            errors.push(`[ERROR] '${n.data.label}' missing operator.`);
                            errorNodes.push(n.id);
                        }
                        if (n.data.subType === 'CROSSOVER' && !n.data.params?.direction) {
                            errors.push(`[ERROR] '${n.data.label}' missing direction.`);
                            errorNodes.push(n.id);
                        }
                    }

                    // Candle Source Warning
                    if (n.data.type === 'CANDLE_SOURCE') {
                        // Check if it has any outgoing connections
                        const outgoing = edges.filter(e => e.source === n.id);
                        if (outgoing.length === 0) {
                            errors.push(`[WARNING] Candle Source not connected.`);
                            warningNodes.push(n.id);
                        }
                    }
                });

                // General Warning: Missing Candle Source
                const hasCandleSource = nodes.some(n => n.data.type === 'CANDLE_SOURCE');
                const hasIndicators = nodes.some(n => n.data.type === 'INDICATOR');
                if (hasIndicators && !hasCandleSource) {
                    errors.push(`[WARNING] Strategy has indicators but no Candle Source.`);
                }

                const errorCount = errors.filter(e => e.startsWith('[ERROR]')).length;
                const warningCount = errors.filter(e => e.startsWith('[WARNING]')).length;

                set({ validationErrors: errors, errorNodeIds: errorNodes, warningNodeIds: warningNodes });
                return errorCount === 0;
            },

            getStrategyJSON: () => {
                const { nodes, edges, meta } = get();

                const trigger = nodes.find(n => n.data.type === 'TRIGGER');
                const risk = nodes.find(n => n.data.type === 'RISK');

                // Canonical v0.1 Defaults
                const riskDefaults = {
                    positionSizePct: 10,
                    maxLeverage: 3,
                    maxDailyLossPct: 5,
                    cooldownMinutes: 0,
                    slPct: null,
                    tpPct: null
                };

                return {
                    version: '0.1',
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
                };
            }
        }),
        {
            name: 'kaptanbot-strategy-builder-draft',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                nodes: state.nodes,
                edges: state.edges,
                meta: state.meta
            })
        }
    )
);
