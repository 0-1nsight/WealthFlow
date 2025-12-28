import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { useExpenses, useDeleteExpense } from "@/hooks/use-expenses";
import { format } from "date-fns";
import { Trash2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Expenses() {
  const { data: expenses, isLoading } = useExpenses();
  const deleteExpense = useDeleteExpense();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense.mutateAsync(id);
      toast({ title: "Deleted", description: "Expense removed successfully" });
    } catch {
      toast({ title: "Error", variant: "destructive", description: "Could not delete expense" });
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Expenses</h1>
          <p className="text-muted-foreground mt-1">Track and manage your spending.</p>
        </div>
        <ExpenseForm />
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input placeholder="Search expenses..." className="pl-10 bg-black/20 border-white/10 rounded-xl" />
        </div>
        <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-xl">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              <tr>
                <th className="p-6">Description</th>
                <th className="p-6">Category</th>
                <th className="p-6">Date</th>
                <th className="p-6">Amount</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading expenses...</td>
                </tr>
              ) : expenses?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No expenses recorded yet.</td>
                </tr>
              ) : (
                expenses?.map((expense: any) => (
                  <tr key={expense.id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-6 font-medium text-white">{expense.description}</td>
                    <td className="p-6 text-muted-foreground">
                      <span className="px-2 py-1 rounded-md bg-white/5 text-xs border border-white/10">
                        General
                      </span>
                    </td>
                    <td className="p-6 text-muted-foreground text-sm">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-6 font-mono font-medium text-white group-hover:text-accent transition-colors">
                      ${Number(expense.amount).toFixed(2)}
                    </td>
                    <td className="p-6 text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </Layout>
  );
}
