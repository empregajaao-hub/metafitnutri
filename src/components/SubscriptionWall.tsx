import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock, Crown, Sparkles, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SubscriptionWall = ({ feature }: { feature?: string }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
    >
      <Card variant="glass" className="w-full p-10 border-white/5 relative overflow-hidden backdrop-blur-2xl shadow-2xl">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-3xl rounded-full -mr-20 -mt-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/10 blur-3xl rounded-full -ml-20 -mb-20 animate-pulse" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Icon Container with Glow */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative mb-8"
          >
            <div className="absolute inset-0 rounded-full blur-xl bg-primary/30 animate-pulse scale-150" />
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/30 shadow-inner relative z-10">
              <Lock className="w-12 h-12 text-primary drop-shadow-[0_0_8px_rgba(0,180,255,0.5)]" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background border border-primary/20 flex items-center justify-center shadow-lg z-20"
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          </motion.div>

          {/* Text Content */}
          <div className="space-y-4 mb-10">
            <h2 className="text-3xl font-black text-foreground tracking-tight leading-tight">
              Acesso Premium
            </h2>
            <div className="h-1 w-12 bg-primary/40 mx-auto rounded-full" />
            
            <div className="space-y-2">
              <p className="text-base text-muted-foreground font-medium leading-relaxed">
                {feature
                  ? `Para aceder a "${feature}", precisas de um plano ativo.`
                  : "O teu período de teste terminou."}
              </p>
              <p className="text-sm text-muted-foreground/80 leading-relaxed">
                Desbloqueia o teu potencial máximo com as ferramentas avançadas do METAFIT.
              </p>
            </div>
          </div>

          {/* Action Button */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full"
          >
            <Button 
              onClick={() => navigate("/subscription")} 
              className="w-full h-14 text-base font-black uppercase tracking-widest gap-3 bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(0,180,255,0.3)] group"
            >
              <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Ver Planos
              <ChevronRight className="w-5 h-5 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          
          <p className="mt-6 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.2em]">
            MetaFit Nutri &bull; Professional Edition
          </p>
        </div>
      </Card>
    </motion.div>
  );
};

export default SubscriptionWall;
