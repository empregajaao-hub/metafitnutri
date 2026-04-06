import { Button } from "@/components/ui/button";
import { Lock, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SubscriptionWall = ({ feature }: { feature?: string }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Lock className="w-10 h-10 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Subscrição Necessária</h2>
      <p className="text-sm text-muted-foreground mb-1">
        {feature
          ? `Para aceder a "${feature}", precisas de um plano activo.`
          : "O teu período de teste terminou."}
      </p>
      <p className="text-xs text-muted-foreground mb-6">
        Subscreve para desbloquear todas as funcionalidades do METAFIT.
      </p>
      <Button onClick={() => navigate("/subscription")} className="gap-2">
        <Crown className="w-4 h-4" />
        Ver Planos
      </Button>
    </motion.div>
  );
};

export default SubscriptionWall;
