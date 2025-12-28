import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LayoutDashboard, Wallet, PiggyBank, User, LogOut, PieChart } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Wallet, label: "Expenses", href: "/expenses" },
    { icon: PiggyBank, label: "Assets", href: "/assets" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div className="h-screen w-64 glass border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8">
        <h1 className="text-2xl font-display font-bold text-gradient-primary tracking-tight">
          EquiFinance
        </h1>
        <p className="text-xs text-muted-foreground mt-1 tracking-wider uppercase">Premium Wealth OS</p>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
              isActive 
                ? "bg-primary/10 text-primary border border-primary/20 shadow-lg shadow-primary/5" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
                <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-accent")} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(var(--accent),0.8)]" />
                )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white shadow-lg">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate text-foreground">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
