import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useAssets, useCreateAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import { Plus, Briefcase, Building, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const assetSchema = z.object({
  name: z.string().min(1),
  value: z.coerce.number().min(0),
  type: z.string().min(1),
  userId: z.string().default("current") // Simplified
});

function AddAssetDialog() {
  const [open, setOpen] = useState(false);
  const createAsset = useCreateAsset();
  const { toast } = useToast();
  
  const form = useForm({
    resolver: zodResolver(assetSchema),
    defaultValues: { name: "", value: 0, type: "cash", userId: "current" }
  });

  const onSubmit = async (data: any) => {
    try {
      await createAsset.mutateAsync(data);
      toast({ title: "Success", description: "Asset added successfully" });
      setOpen(false);
    } catch {
      toast({ title: "Error", description: "Failed to add asset", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl px-6">
          <Plus className="w-4 h-4 mr-2" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-none text-foreground">
        <DialogHeader>
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Asset Name</Label>
            <Input {...form.register("name")} placeholder="e.g., E-Trade Portfolio" className="bg-black/20 border-white/10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label>Type</Label>
            <Select onValueChange={(val) => form.setValue("type", val)} defaultValue="cash">
              <SelectTrigger className="bg-black/20 border-white/10 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash / Bank</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="property">Real Estate</SelectItem>
                <SelectItem value="crypto">Crypto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Current Value</Label>
            <Input type="number" {...form.register("value")} className="bg-black/20 border-white/10 rounded-xl" />
          </div>
          <Button type="submit" className="w-full bg-primary rounded-xl" disabled={createAsset.isPending}>
            Save Asset
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function Assets() {
  const { data: assets, isLoading } = useAssets();

  const getIcon = (type: string) => {
    switch (type) {
      case 'property': return Building;
      case 'investment': return Briefcase;
      default: return DollarSign;
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Assets</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio and holdings.</p>
        </div>
        <AddAssetDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading assets...</p>
        ) : assets?.map((asset: any) => {
          const Icon = getIcon(asset.type);
          return (
            <GlassCard key={asset.id} className="hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground bg-black/20 px-2 py-1 rounded-md">
                  {asset.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
              <p className="text-2xl font-mono text-accent">${Number(asset.value).toLocaleString()}</p>
            </GlassCard>
          );
        })}
      </div>
    </Layout>
  );
}
