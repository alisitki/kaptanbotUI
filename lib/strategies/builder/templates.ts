
import { SavedStrategy, StrategyNode, StrategyEdge, StrategyTimeframe } from './types';
import { MarkerType } from 'reactflow';

const COMMON_META: { timeframe: StrategyTimeframe; symbol: string } = {
    timeframe: '1m',
    symbol: 'BTCUSDT'
};

// Helper to create nodes/edges easily
const createNode = (id: string, type: any, subType: string, x: number, y: number, params: any = {}): StrategyNode => ({
    id,
    type: type === 'TRIGGER' ? 'triggerNode' :
        type === 'ACTION' ? 'actionNode' :
            type === 'CONDITION' ? 'conditionNode' :
                type === 'INDICATOR' ? 'indicatorNode' :
                    type === 'CANDLE_SOURCE' ? 'candleSourceNode' :
                        type === 'RISK' ? 'riskNode' :
                            type === 'HEDGE' ? 'hedgeNode' :
                                type === 'GUARD' ? 'guardNode' :
                                    type === 'EXPR' ? 'exprNode' : 'default',
    position: { x, y },
    data: { label: subType.replace(/_/g, ' ') || type, type, subType, params }
});

const createEdge = (source: string, target: string, sourceHandle?: string, targetHandle?: string): StrategyEdge => ({
    id: `e-${source}-${target}`,
    source,
    target,
    sourceHandle,
    targetHandle,
    animated: true,
    style: { stroke: '#6366f1' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
});

export const STRATEGY_TEMPLATES: Record<string, SavedStrategy> = {
    'EMA_CROSS_LONG': {
        version: '0.2',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'EMA Cross Long' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('ema-20', 'INDICATOR', 'EMA', 450, 80, { period: 20 }),
            createNode('ema-50', 'INDICATOR', 'EMA', 450, 220, { period: 50 }),
            createNode('cross-1', 'CONDITION', 'CROSSOVER', 650, 150, { direction: 'UP' }),
            createNode('action-1', 'ACTION', 'OPEN_LONG', 850, 150, { qtyPct: 100 }),
            createNode('risk-1', 'RISK', '', 50, 300, { maxLeverage: 3, positionSizePct: 10 })
        ],
        edges: [
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            createEdge('candle-1', 'ema-20', 'series', 'in'),
            createEdge('candle-1', 'ema-50', 'series', 'in'),
            createEdge('ema-20', 'cross-1', 'out', 'a'),
            createEdge('ema-50', 'cross-1', 'out', 'b'),
            createEdge('cross-1', 'action-1', 'out', 'trigger'),
        ]
    },

    'RSI_OVERSOLD': {
        version: '0.2',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'RSI Oversold Long' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('rsi-14', 'INDICATOR', 'RSI', 450, 100, { period: 14 }),
            createNode('val-30', 'VALUE', 'NUMBER', 450, 250, { value: 30 }),
            createNode('comp-1', 'CONDITION', 'COMPARE', 650, 150, { op: '<' }),
            createNode('action-1', 'ACTION', 'OPEN_LONG', 850, 150, { qtyPct: 100 }),
            createNode('risk-1', 'RISK', '', 50, 350, { maxLeverage: 2, positionSizePct: 15 })
        ],
        edges: [
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            createEdge('candle-1', 'rsi-14', 'series', 'in'),
            createEdge('rsi-14', 'comp-1', 'out', 'a'),
            createEdge('val-30', 'comp-1', 'value', 'b'),
            createEdge('comp-1', 'action-1', 'out', 'trigger')
        ]
    },

    'BREAKOUT': {
        version: '0.2',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'Donchian Breakout' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('high-20', 'INDICATOR', 'HIGHEST', 450, 80, { period: 20 }),
            createNode('val-prev', 'VALUE', 'NUMBER', 450, 220, { value: 0 }),
            createNode('comp-1', 'CONDITION', 'COMPARE', 650, 150, { op: '>' }),
            createNode('action-1', 'ACTION', 'OPEN_LONG', 850, 150, { qtyPct: 100 }),
            createNode('risk-1', 'RISK', '', 50, 350)
        ],
        edges: [
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            createEdge('candle-1', 'high-20', 'series', 'in'),
            createEdge('high-20', 'comp-1', 'out', 'a'),
            createEdge('val-prev', 'comp-1', 'value', 'b'),
            createEdge('comp-1', 'action-1', 'out', 'trigger')
        ]
    },

    'KAPTAN_HEDGE_REBALANCE': {
        version: '0.2',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'Kaptan Hedge Rebalance' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('price-cross-1', 'CONDITION', 'PRICE_CROSS_LEVEL', 480, 150, { direction: 'DOWN', level: 91400 }),
            createNode('action-long', 'ACTION', 'SET_LONG_UNITS', 720, 80, { units: 3 }),
            createNode('action-short', 'ACTION', 'SET_SHORT_UNITS', 720, 220, { units: 15 }),
            createNode('hedge-1', 'HEDGE', 'MIN_HEDGE', 50, 320, { minLongUnits: 3, minShortUnits: 2 })
        ],
        edges: [
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            createEdge('candle-1', 'price-cross-1', 'series', 'price'),
            createEdge('price-cross-1', 'action-long', 'out', 'trigger'),
            createEdge('price-cross-1', 'action-short', 'out', 'trigger')
        ]
    },

    'RANGE_COOLDOWN': {
        version: '0.2',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'Range + Cooldown' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('range-1', 'CONDITION', 'PRICE_IN_RANGE', 480, 150, { low: 90000, high: 92000 }),
            createNode('action-long', 'ACTION', 'SET_LONG_UNITS', 720, 80, { units: 5 }),
            createNode('action-short', 'ACTION', 'SET_SHORT_UNITS', 720, 220, { units: 10 }),
            createNode('cooldown-1', 'GUARD', 'COOLDOWN_BARS', 50, 320, { bars: 10 }),
            createNode('hedge-1', 'HEDGE', 'MIN_HEDGE', 50, 420, { minLongUnits: 2, minShortUnits: 2 })
        ],
        edges: [
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            createEdge('candle-1', 'range-1', 'series', 'price'),
            createEdge('range-1', 'action-long', 'out', 'trigger'),
            createEdge('range-1', 'action-short', 'out', 'trigger')
        ]
    },

    'EXPR_EXAMPLE': {
        version: '0.2',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'Expr Example' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('expr-1', 'EXPR', 'CUSTOM', 480, 150, { expression: 'rsi(close,14) < 30 && ema(close,20) > ema(close,50)' }),
            createNode('action-1', 'ACTION', 'OPEN_LONG', 720, 150, { qtyPct: 100 }),
            createNode('risk-1', 'RISK', '', 50, 320, { maxLeverage: 2, positionSizePct: 10 })
        ],
        edges: [
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            createEdge('candle-1', 'expr-1', 'series', 'series'),
            createEdge('expr-1', 'action-1', 'out', 'trigger')
        ]
    }
};
