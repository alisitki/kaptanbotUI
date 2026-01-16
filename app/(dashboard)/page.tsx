"use client";

import useSWR from 'swr';
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, DollarSign, TrendingUp, TrendingDown, Layers } from "lucide-react";
import { BotState, DecisionLog } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// Fetcher
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  const { data: state, error: stateError } = useSWR<BotState>('/api/mock/state', fetcher, { refreshInterval: 1000 });
  const { data: decisions } = useSWR<DecisionLog[]>('/api/mock/decisions', fetcher);

  if (!state) return <DashboardSkeleton />;

  return (
    <>
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Equity"
          value={`$${state.equity_usdt.toLocaleString()}`}
          delta="+2.4%"
          trend="up"
          icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
        />
        <MetricCard
          title="Unrealized PnL"
          value={`$${state.pnl_unrealized_usdt.toFixed(2)}`}
          delta="-12%"
          trend="down"
          icon={<TrendingUp className="h-4 w-4 text-zinc-500" />}
        />
        <MetricCard
          title="Net Exposure"
          value={`$${state.net_exposure_usdt.toLocaleString()}`}
          trend="neutral"
          icon={<Layers className="h-4 w-4 text-blue-500" />}
        />
        <MetricCard
          title="Long Units"
          value={state.long_units.toString()}
          delta="Target: 3"
          trend="neutral"
        />
        <MetricCard
          title="Short Units"
          value={state.short_units.toString()}
          delta="Target: 15"
          trend="neutral"
        />
        <MetricCard
          title="Funding (1h)"
          value={`$${state.funding_hourly_usdt}`}
          trend="down"
          icon={<TrendingDown className="h-4 w-4 text-red-500" />}
        />
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 md:grid-cols-7 lg:grid-cols-7">

        {/* Chart Area (Simplified Placeholder for now, can be expanded) */}
        <Card className="col-span-4 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>BTCUSDT Price Action</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] flex items-center justify-center text-zinc-500">
            {/* Integrate Recharts component here later */}
            <div className="text-center">
              <h3 className="text-2xl font-mono text-white mb-2">{state.price.toFixed(1)}</h3>
              <p>Chart Component Placeholder</p>
              <div className="flex gap-2 mt-4 justify-center">
                <Badge variant="outline">Support: {state.supports[0]}</Badge>
                <Badge variant="outline" className="text-red-400 border-red-900/40">Resist: {state.resistances[0]}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bot State Card */}
        <Card className="col-span-3 bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Bot Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-white/5">
                <div>
                  <p className="text-sm text-zinc-400">Current Bias</p>
                  <h3 className="text-xl font-bold text-red-500">{state.bias}</h3>
                </div>
                <div>
                  <p className="text-sm text-zinc-400 text-right">Mode</p>
                  <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/20">{state.mode}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Cooldown</span>
                  <span className="font-mono text-white">{state.cooldown_remaining_sec}s</span>
                </div>
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000"
                    style={{ width: `${(state.cooldown_remaining_sec / 60) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <h4 className="text-sm font-medium mb-3 text-zinc-300">Flip Level Distance</h4>
                <div className="flex items-center justify-between">
                  <div className="font-mono text-lg text-white">{state.flip_level}</div>
                  <div className="text-sm text-zinc-500">
                    {((state.price - state.flip_level) / state.price * 100).toFixed(2)}% away
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Decisions Table */}
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle>Recent Decisions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-zinc-800">
                <TableHead>Time</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Impact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decisions?.map((d) => (
                <TableRow key={d.id} className="hover:bg-white/5 border-zinc-800">
                  <TableCell className="font-mono text-zinc-400">{new Date(d.timestamp).toLocaleTimeString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                      {d.intent}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-300">{d.reason}</TableCell>
                  <TableCell className="text-right font-mono">
                    <span className="text-emerald-500">{d.diff_long > 0 ? '+' : ''}{d.diff_long}L</span>
                    {" / "}
                    <span className="text-red-500">{d.diff_short > 0 ? '+' : ''}{d.diff_short}S</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-6">
        {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 w-full bg-zinc-900" />)}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[400px] bg-zinc-900" />
        <Skeleton className="col-span-3 h-[400px] bg-zinc-900" />
      </div>
    </div>
  )
}
