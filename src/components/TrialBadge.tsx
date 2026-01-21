import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Clock, Crown, Star, Users, AlertTriangle } from "lucide-react";

interface TrialBadgeProps {
  showButton?: boolean;
  compact?: boolean;
}

export const TrialBadge = ({ showButton = true, compact = false }: TrialBadgeProps) => {
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (subscription) {
        setCurrentPlan(subscription.plan || "free");
        
        if (subscription.plan === "free") {
          const trialStart = new Date(subscription.trial_start_date || subscription.created_at);
          const now = new Date();
          const daysPassed = Math.floor((now.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
          const remainingDays = Math.max(0, 7 - daysPassed);
          setTrialDays(remainingDays);
        } else {
          setTrialDays(null);
        }
      }
    } catch (error) {
      console.error("Error checking trial status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;

  const getPlanIcon = () => {
    switch (currentPlan) {
      case "essential":
        return <Star className="w-4 h-4" />;
      case "evolution":
        return <Crown className="w-4 h-4" />;
      case "personal_trainer":
        return <Users className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getPlanLabel = () => {
    switch (currentPlan) {
      case "essential":
        return "Plano Essencial";
      case "evolution":
        return "Plano Evolução";
      case "personal_trainer":
        return "Personal Trainer";
      default:
        return trialDays !== null && trialDays > 0 
          ? `${trialDays} dias de teste` 
          : "Período de Teste Expirado";
    }
  };

  const getBadgeVariant = () => {
    if (currentPlan !== "free") return "default";
    if (trialDays !== null && trialDays <= 2) return "destructive";
    return "secondary";
  };

  const isTrialExpired = currentPlan === "free" && (trialDays === null || trialDays <= 0);

  if (compact) {
    return (
      <Badge variant={getBadgeVariant()} className="gap-1">
        {getPlanIcon()}
        {getPlanLabel()}
      </Badge>
    );
  }

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            currentPlan !== "free" 
              ? "bg-primary/10 text-primary" 
              : isTrialExpired 
                ? "bg-destructive/10 text-destructive"
                : "bg-yellow-500/10 text-yellow-600"
          }`}>
            {isTrialExpired ? <AlertTriangle className="w-5 h-5" /> : getPlanIcon()}
          </div>
          <div>
            <p className="font-medium">{getPlanLabel()}</p>
            {currentPlan === "free" && trialDays !== null && trialDays > 0 && (
              <p className="text-sm text-muted-foreground">
                Aproveite todas as funcionalidades
              </p>
            )}
            {isTrialExpired && (
              <p className="text-sm text-destructive">
                Subscreva para continuar a usar
              </p>
            )}
          </div>
        </div>
        
        {showButton && currentPlan === "free" && (
          <Button 
            size="sm" 
            variant={isTrialExpired ? "destructive" : "outline"}
            onClick={() => navigate("/subscription")}
          >
            {isTrialExpired ? "Subscrever Agora" : "Ver Planos"}
          </Button>
        )}
      </div>
    </div>
  );
};
