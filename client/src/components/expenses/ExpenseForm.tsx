import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateExpense } from '@/hooks/use-expenses';
import { useProcessReceipt } from '@/hooks/use-receipts';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, Loader2, ScanLine } from 'lucide-react';
import { api } from '@shared/routes';

// Create a simplified schema for the form
const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be positive"),
  categoryId: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ExpenseForm() {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { toast } = useToast();
  const createExpense = useCreateExpense();
  const processReceipt = useProcessReceipt();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createExpense.mutateAsync({
        ...data,
        description: data.description,
        amount: String(data.amount), // Cast for API
        payerId: "current-user", // Backend handles this actually or assumes
        categoryId: data.categoryId,
        // Simplified splitting logic for MVP - assumes equal split or single payer
        splits: [] 
      });
      toast({ title: "Success", description: "Expense created successfully" });
      setOpen(false);
      form.reset();
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to create expense", 
        variant: "destructive" 
      });
    }
  };

  const handleReceiptUpload = async () => {
    // Simulated file upload for now
    setIsProcessing(true);
    try {
      // In a real app, this would be a file input
      const result = await processReceipt.mutateAsync({ 
        imageUrl: "https://example.com/receipt.jpg" 
      });
      
      if (result.total) form.setValue("amount", result.total);
      if (result.date) {
        // Handle date if form had a date field
      }
      toast({ title: "Receipt Processed", description: "Details extracted automatically." });
    } catch (e) {
      toast({ title: "Error", description: "Could not process receipt", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-none text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">New Expense</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div 
            onClick={handleReceiptUpload}
            className="border-2 border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <ScanLine className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground group-hover:text-accent transition-colors">Scan Receipt with AI</span>
              </>
            )}
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                {...form.register("description")}
                placeholder="Dinner, Uber, Groceries..." 
                className="bg-black/20 border-white/10 focus:border-primary rounded-xl"
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input 
                  type="number" 
                  step="0.01"
                  {...form.register("amount")}
                  className="pl-8 bg-black/20 border-white/10 focus:border-primary rounded-xl font-mono"
                />
              </div>
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select onValueChange={(val) => form.setValue("categoryId", Number(val))}>
                <SelectTrigger className="bg-black/20 border-white/10 rounded-xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Food & Dining</SelectItem>
                  <SelectItem value="2">Transportation</SelectItem>
                  <SelectItem value="3">Housing</SelectItem>
                  <SelectItem value="4">Entertainment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white font-semibold py-6 rounded-xl shadow-lg shadow-primary/20"
                disabled={createExpense.isPending}
              >
                {createExpense.isPending ? "Creating..." : "Create Expense"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
