"use client";

import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
    { day: 'Mon', value: 10000 },
    { day: 'Tue', value: 10250 },
    { day: 'Wed', value: 10100 },
    { day: 'Thu', value: 10600 },
    { day: 'Fri', value: 11200 },
    { day: 'Sat', value: 11150 },
    { day: 'Sun', value: 12450 },
];

export function EquityCurve() {
    return (
        <Card className="h-[400px] p-6 border-white/5 bg-[#0A0A0A]/50 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-white mb-6">Varlık Gelişimi (Equity Curve)</h3>
            <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a' }} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
}
