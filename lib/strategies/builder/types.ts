
import { Node, Edge } from 'reactflow';

export type StrategyTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

// Lane types for canvas organization
export type Lane = 'SIGNAL' | 'ORDER' | 'RISK';

// Data types for connection validation
export type DataType = 'Event' | 'Series' | 'Scalar' | 'Boolean' | 'Config' | 'OrderIntent' | 'ExitPolicy';

// Get output data type for a node type
export function getNodeOutputType(nodeType: BuilderNodeType, subType?: string): DataType {
    switch (nodeType) {
        case 'TRIGGER':
            return 'Event';
        case 'CANDLE_SOURCE':
        case 'INDICATOR':
            return 'Series';
        case 'VALUE':
            return 'Scalar';
        case 'CONDITION':
        case 'LOGIC':
            return 'Boolean';
        case 'EXPR':
            return 'Boolean';
        case 'ACTION':
        case 'RISK':
        case 'HEDGE':
        case 'GUARD':
            return 'Config';
        // NEW PACKAGE NODES
        case 'ENTRY_ORDER':
        case 'POSITION_POLICY':
        case 'DAILY_GUARDS':
            return 'OrderIntent';
        case 'EXIT_MANAGER':
            return 'ExitPolicy';
        default:
            return 'Series';
    }
}

// Get expected input types for a node's handles
export function getHandleInputType(nodeType: BuilderNodeType, handleId: string, subType?: string): DataType[] {
    switch (nodeType) {
        case 'INDICATOR':
            return ['Series']; // Only Series input (from Candle Source)
        case 'CONDITION':
            // Price conditions can also take Series for price input
            if (subType === 'PRICE_CROSS_LEVEL' || subType === 'PRICE_IN_RANGE') {
                return ['Series'];
            }
            return ['Series', 'Scalar']; // Compare can take both
        case 'LOGIC':
            return ['Boolean']; // AND/OR needs boolean inputs
        case 'ACTION':
            return ['Boolean']; // Boolean gate only (Model B)
        case 'RISK':
        case 'HEDGE':
        case 'GUARD':
            return []; // Config nodes - no inputs
        case 'EXPR':
            return ['Series']; // Takes price series
        case 'CANDLE_SOURCE':
            return ['Event']; // Event input from Trigger (Model B)
        case 'VALUE':
            return []; // No inputs
        case 'TRIGGER':
            return []; // No inputs
        // RECIPE BUILDER PACKAGE NODES
        case 'ENTRY_ORDER':
            return ['Boolean']; // Boolean gate from signal
        case 'EXIT_MANAGER':
            return ['OrderIntent']; // From ENTRY_ORDER
        case 'POSITION_POLICY':
            return ['OrderIntent']; // From ENTRY_ORDER
        case 'DAILY_GUARDS':
            return ['OrderIntent']; // From POSITION_POLICY or ENTRY_ORDER
        default:
            return ['Series', 'Scalar', 'Boolean', 'Event'];
    }
}

// Check if a connection is valid based on types
export function isConnectionValid(
    sourceType: BuilderNodeType,
    sourceSubType: string | undefined,
    targetType: BuilderNodeType,
    targetSubType: string | undefined,
    targetHandle: string | undefined
): { valid: boolean; reason?: string } {
    const outputType = getNodeOutputType(sourceType, sourceSubType);
    const acceptedTypes = getHandleInputType(targetType, targetHandle || 'in');

    // 1. Terminal nodes (no outputs)
    if (sourceType === 'ACTION') {
        return { valid: false, reason: 'Actions are terminal nodes' };
    }
    if (sourceType === 'RISK') {
        return { valid: false, reason: 'Risk nodes are terminal' };
    }
    if (sourceType === 'HEDGE') {
        return { valid: false, reason: 'Hedge guards are terminal' };
    }
    if (sourceType === 'GUARD') {
        return { valid: false, reason: 'Guard nodes are terminal' };
    }

    // 2. Model B: Trigger can ONLY connect to CandleSource
    if (sourceType === 'TRIGGER' && targetType !== 'CANDLE_SOURCE') {
        return { valid: false, reason: 'Trigger must connect to Candle Source' };
    }

    // 3. Model B: CandleSource(Series) can ONLY connect to Indicator
    if (sourceType === 'CANDLE_SOURCE' && targetType !== 'INDICATOR') {
        return { valid: false, reason: 'Candle Source must connect to Indicator' };
    }

    // 4. Indicator -> Indicator blocked
    if (sourceType === 'INDICATOR' && targetType === 'INDICATOR') {
        return { valid: false, reason: 'Indicator → Indicator not allowed' };
    }

    // 5. Boolean -> Series input blocked
    if (outputType === 'Boolean' && acceptedTypes.includes('Series') && !acceptedTypes.includes('Boolean')) {
        return { valid: false, reason: 'Boolean cannot connect to Series input' };
    }

    // 6. CrossOver requires Series inputs only
    if (targetType === 'CONDITION' && targetSubType === 'CROSSOVER') {
        if (outputType !== 'Series') {
            return { valid: false, reason: 'CrossOver requires Series input' };
        }
    }

    // 7. Action trigger requires Boolean
    if (targetType === 'ACTION') {
        if (outputType !== 'Boolean') {
            return { valid: false, reason: 'Action requires Boolean input' };
        }
    }

    // 8. General type compatibility
    if (!acceptedTypes.includes(outputType)) {
        return { valid: false, reason: `${outputType} cannot connect to ${targetType}` };
    }

    return { valid: true };
}

export interface StrategyMeta {
    name: string;
    description?: string;
    timeframe: StrategyTimeframe;
    symbol: string;
}

export type BuilderNodeType =
    | 'TRIGGER'
    | 'CANDLE_SOURCE'
    | 'INDICATOR'
    | 'CONDITION'
    | 'LOGIC'
    | 'VALUE'
    | 'ACTION'
    | 'RISK'
    | 'HEDGE'
    | 'GUARD'
    | 'EXPR'
    // RECIPE BUILDER PACKAGE NODES
    | 'ENTRY_ORDER'
    | 'EXIT_MANAGER'
    | 'POSITION_POLICY'
    | 'DAILY_GUARDS';

// Get lane for a node type (for auto-placement)
export function getLaneForNodeType(type: BuilderNodeType): Lane {
    switch (type) {
        case 'TRIGGER':
        case 'CANDLE_SOURCE':
        case 'INDICATOR':
        case 'CONDITION':
        case 'LOGIC':
        case 'EXPR':
        case 'VALUE':
            return 'SIGNAL';
        case 'ENTRY_ORDER':
        case 'EXIT_MANAGER':
        case 'POSITION_POLICY':
            return 'ORDER';
        case 'DAILY_GUARDS':
        case 'GUARD':
        case 'RISK':
        case 'HEDGE':
            return 'RISK';
        case 'ACTION':
        default:
            return 'SIGNAL';
    }
}

export interface StrategyNodeData {
    label: string;
    type: BuilderNodeType;
    subType?: string; // e.g. 'EMA', 'RSI', 'CROSSOVER'
    params: Record<string, any>;
    isCore?: boolean; // Cannot be deleted
    // Validation status
    isValid?: boolean;
    error?: string;
    // Unknown node handling
    isUnknown?: boolean;
    originalType?: string;
}

export type StrategyNode = Node<StrategyNodeData>;
export type StrategyEdge = Edge;

export interface StrategyValidationResult {
    valid: boolean;
    errors: { nodeId?: string; message: string }[];
}

export interface SavedStrategy {
    version: string;
    meta: StrategyMeta;
    nodes: StrategyNode[];
    edges: StrategyEdge[];
    updatedAt: number;
}
