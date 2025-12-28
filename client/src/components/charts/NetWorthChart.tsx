import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNetWorthHistory } from '@/hooks/use-net-worth';
import { GlassCard } from '@/components/ui/glass-card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function NetWorthChart() {
  const { data: history, isLoading } = useNetWorthHistory();

  if (isLoading) {
    return (
      <GlassCard className="h-[350px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </GlassCard>
    );
  }

  const chartData = history?.map(entry => ({
    date: new Date(entry.date!),
    value: Number(entry.totalValue)
  })) || [];

  return (
    <GlassCard className="h-[400px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Net Worth Growth</h3>
          <p className="text-sm text-muted-foreground">Total asset accumulation over time</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-gradient-primary">
            ${chartData.length > 0 ? chartData[chartData.length - 1].value.toLocaleString() : "0"}
          </p>
          <p className="text-xs text-emerald-400">+2.4% this month</p>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.3)" 
              tickFormatter={(date) => format(date, 'MMM d')}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.3)"
              tickFormatter={(value) => `$${value / 1000}k`}
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(10, 10, 20, 0.8)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: 'hsl(var(--accent))' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, "Net Worth"]}
              labelFormatter={(label) => format(new Date(label), 'PPP')}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorValue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
