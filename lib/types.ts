export type Intent = 'REBALANCE' | 'FLIP' | 'TP' | 'NONE';
export type Bias = 'LONG' | 'SHORT';
export type Mode = 'HEDGE' | 'ONE_WAY';

export interface BotState {
  symbol: string;
  price: number;
  bias: Bias;
  mode: Mode;
  long_units: number;
  short_units: number;
  target_long_units: number;
  target_short_units: number;
  flip_level: number;
  supports: number[];
  resistances: number[];
  cooldown_remaining_sec: number;
  equity_usdt: number;
  pnl_unrealized_usdt: number;
  net_exposure_usdt: number;
  funding_hourly_usdt: number;
  ws_connected: boolean;
  latency_ms: number;
}

export interface DecisionLog {
  id: string;
  timestamp: string;
  intent: Intent;
  reason: string;
  diff_long: number;
  diff_short: number;
  price_at_decision: number;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'LIMIT' | 'MARKET';
  price: number;
  size: number;
  status: 'OPEN' | 'FILLED' | 'CANCELLED';
  timestamp: string;
}

export interface Metric {
  label: string;
  value: string | number;
  delta?: number; // percentage or absolute change
  trend?: 'up' | 'down' | 'neutral';
  history?: number[]; // for sparklines
}
