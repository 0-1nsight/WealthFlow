import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { useAuth } from "@/hooks/use-auth";
import { useUserProfile, useUpdateProfile } from "@/hooks/use-user-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  
  const { register, handleSubmit } = useForm({
    values: {
      monthlyIncome: profile?.monthlyIncome || 0,
      currency: profile?.currency || "USD"
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await updateProfile.mutateAsync(data);
      toast({ title: "Updated", description: "Profile updated successfully" });
    } catch {
      toast({ title: "Error", variant: "destructive", description: "Failed to update profile" });
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-white mb-8">Your Profile</h1>
        
        <GlassCard className="mb-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
              {user?.firstName?.[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Monthly Income</Label>
                <Input type="number" {...register("monthlyIncome")} className="bg-black/20 border-white/10 rounded-xl" />
                <p className="text-xs text-muted-foreground">Used for proportional expense splitting.</p>
              </div>
              <div className="space-y-2">
                <Label>Preferred Currency</Label>
                <Input {...register("currency")} className="bg-black/20 border-white/10 rounded-xl" />
              </div>
            </div>
            
            <Button type="submit" disabled={updateProfile.isPending} className="bg-primary rounded-xl px-8">
              Save Changes
            </Button>
          </form>
        </GlassCard>
      </div>
    </Layout>
  );
}
