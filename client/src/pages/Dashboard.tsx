import { useAuth } from "@/hooks/use-auth";
import { useExpenses } from "@/hooks/use-expenses";
import { GlassCard } from "@/components/ui/glass-card";
import { NetWorthChart } from "@/components/charts/NetWorthChart";
import { ArrowUpRight, ArrowDownRight, TrendingUp, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: expenses, isLoading: loadingExpenses } = useExpenses({ limit: 5 });

  return (
    <Layout>
      <header className="mb-8">
        <h1 className="text-4xl font-display font-bold text-white mb-2">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground text-lg">Your financial overview for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard delay={0.1} className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Total Net Worth</p>
          <h2 className="text-3xl font-display font-bold text-white mb-4">$142,500.00</h2>
          <div className="flex items-center text-emerald-400 text-sm font-medium bg-emerald-400/10 w-fit px-2 py-1 rounded-lg">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            <span>+12.5% vs last month</span>
          </div>
        </GlassCard>

        <GlassCard delay={0.2}>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Monthly Expenses</p>
          <h2 className="text-3xl font-display font-bold text-white mb-4">$4,250.00</h2>
          <div className="flex items-center text-rose-400 text-sm font-medium bg-rose-400/10 w-fit px-2 py-1 rounded-lg">
            <ArrowDownRight className="w-4 h-4 mr-1" />
            <span>+2.1% vs last month</span>
          </div>
        </GlassCard>

        <GlassCard delay={0.3}>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-2">Active Investments</p>
          <h2 className="text-3xl font-display font-bold text-white mb-4">$85,000.00</h2>
          <div className="flex items-center text-accent text-sm font-medium bg-accent/10 w-fit px-2 py-1 rounded-lg">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>+5.3% returns</span>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <NetWorthChart />
        </div>

        <div className="lg:col-span-1">
          <GlassCard className="h-full">
            <h3 className="text-lg font-semibold mb-6 flex items-center justify-between">
              <span>Recent Activity</span>
              <button className="text-xs text-primary hover:text-primary/80 font-medium uppercase tracking-wide">View All</button>
            </h3>
            
            <div className="space-y-4">
              {loadingExpenses ? (
                <div className="text-center py-10 text-muted-foreground">Loading activity...</div>
              ) : expenses?.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">No recent activity</div>
              ) : (
                expenses?.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{expense.description}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'MMM d, h:mm a')}</p>
                      </div>
                    </div>
                    <span className="font-mono font-medium text-white group-hover:text-accent transition-colors">
                      -${Number(expense.amount).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </Layout>
  );
}
