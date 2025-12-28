import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />

      <header className="container mx-auto px-6 py-8 flex justify-between items-center z-10">
        <h1 className="text-2xl font-display font-bold text-white">EquiFinance</h1>
        <Button onClick={handleLogin} variant="outline" className="border-white/10 text-white hover:bg-white/10 rounded-xl">
          Sign In
        </Button>
      </header>

      <main className="flex-1 container mx-auto px-6 flex flex-col justify-center items-center text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-3xl space-y-8"
        >
          <h2 className="text-6xl md:text-7xl font-display font-bold leading-tight text-white tracking-tight">
            Wealth management <br />
            <span className="text-gradient-primary">reimagined.</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Track your net worth, split expenses proportionally, and scan receipts with AI. 
            The premium financial operating system for modern couples and individuals.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button 
              onClick={handleLogin}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105"
            >
              Get Started
            </Button>
            <Button 
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-2xl backdrop-blur-md"
            >
              View Demo
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Preview Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 60, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="mt-24 w-full max-w-5xl perspective-1000"
        >
          <div className="glass-card p-2 rounded-2xl border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl transform-style-3d rotate-x-12">
             <div className="w-full h-[400px] md:h-[600px] rounded-xl bg-gradient-to-br from-gray-900 to-black overflow-hidden relative border border-white/5">
                {/* Abstract UI representation */}
                <div className="absolute top-8 left-8 right-8 flex gap-6">
                   <div className="w-64 h-full bg-white/5 rounded-xl border border-white/5 hidden md:block"></div>
                   <div className="flex-1 space-y-6">
                      <div className="flex gap-6">
                        <div className="flex-1 h-32 bg-primary/20 rounded-xl border border-white/5"></div>
                        <div className="flex-1 h-32 bg-white/5 rounded-xl border border-white/5"></div>
                        <div className="flex-1 h-32 bg-white/5 rounded-xl border border-white/5"></div>
                      </div>
                      <div className="w-full h-80 bg-white/5 rounded-xl border border-white/5"></div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </main>

      <footer className="container mx-auto px-6 py-8 text-center text-sm text-muted-foreground border-t border-white/5 mt-20">
        © 2025 EquiFinance. Built with precision.
      </footer>
    </div>
  );
}
