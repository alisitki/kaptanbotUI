
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
                        type === 'RISK' ? 'riskNode' : 'default',
    position: { x, y },
    data: { label: subType.replace(/_/g, ' '), type, subType, params }
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
        version: '0.1',
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
            // Model B: Trigger -> CandleSource
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            // CandleSource -> Indicators
            createEdge('candle-1', 'ema-20', 'series', 'in'),
            createEdge('candle-1', 'ema-50', 'series', 'in'),
            // Indicators -> CrossOver
            createEdge('ema-20', 'cross-1', 'out', 'a'),
            createEdge('ema-50', 'cross-1', 'out', 'b'),
            // CrossOver -> Action
            createEdge('cross-1', 'action-1', 'out', 'trigger'),
        ]
    },

    'RSI_OVERSOLD': {
        version: '0.1',
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
            // Model B: Trigger -> CandleSource
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            // CandleSource -> Indicator
            createEdge('candle-1', 'rsi-14', 'series', 'in'),
            // RSI < 30
            createEdge('rsi-14', 'comp-1', 'out', 'a'),
            createEdge('val-30', 'comp-1', 'value', 'b'),
            // Compare -> Action
            createEdge('comp-1', 'action-1', 'out', 'trigger')
        ]
    },

    'BREAKOUT': {
        version: '0.1',
        updatedAt: Date.now(),
        meta: { ...COMMON_META, name: 'Donchian Breakout' },
        nodes: [
            createNode('trigger-1', 'TRIGGER', 'ON_BAR_CLOSE', 50, 150),
            createNode('candle-1', 'CANDLE_SOURCE', '', 250, 150, { field: 'close' }),
            createNode('high-20', 'INDICATOR', 'HIGHEST', 450, 80, { period: 20 }),
            createNode('val-prev', 'VALUE', 'NUMBER', 450, 220, { value: 0 }), // Placeholder for previous high
            createNode('comp-1', 'CONDITION', 'COMPARE', 650, 150, { op: '>' }),
            createNode('action-1', 'ACTION', 'OPEN_LONG', 850, 150, { qtyPct: 100 }),
            createNode('risk-1', 'RISK', '', 50, 350)
        ],
        edges: [
            // Model B: Trigger -> CandleSource
            createEdge('trigger-1', 'candle-1', 'event', 'event'),
            // CandleSource -> Indicator
            createEdge('candle-1', 'high-20', 'series', 'in'),
            // Close > Highest High
            createEdge('high-20', 'comp-1', 'out', 'a'),
            createEdge('val-prev', 'comp-1', 'value', 'b'),
            // Compare -> Action
            createEdge('comp-1', 'action-1', 'out', 'trigger')
        ]
    }
};
