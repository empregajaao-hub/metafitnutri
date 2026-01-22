import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Clock, 
  Crown, 
  Star, 
  Users, 
  AlertTriangle, 
  Sparkles,
  CalendarDays
} from "lucide-react";

interface PlanBadgeProps {
  showButton?: boolean;
  compact?: boolean;
  showDetails?: boolean;
}

export const PlanBadge = ({ showButton = true, compact = false, showDetails = true }: PlanBadgeProps) => {
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [paidDaysLeft, setPaidDaysLeft] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
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
        
        if (subscription.end_date) {
          const parsedEnd = new Date(subscription.end_date);
          setEndDate(parsedEnd);

          // Dias restantes (pago): calcula sempre a partir da end_date para decrescer dia a dia
          const now = new Date();
          const msPerDay = 1000 * 60 * 60 * 24;
          const diffDays = Math.ceil((parsedEnd.getTime() - now.getTime()) / msPerDay);
          setPaidDaysLeft(Math.max(0, diffDays));
        } else {
          setEndDate(null);
          setPaidDaysLeft(null);
        }
        
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
      console.error("Error checking subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;

  const getPlanIcon = () => {
    switch (currentPlan) {
      case "essential":
        return <Star className="w-5 h-5" />;
      case "evolution":
        return <Crown className="w-5 h-5" />;
      case "personal_trainer":
        return <Users className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
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
          ? `Período de Teste` 
          : "Período de Teste Expirado";
    }
  };

  const getPlanColor = () => {
    switch (currentPlan) {
      case "essential":
        return "bg-blue-500/10 text-blue-600 border-blue-500/30";
      case "evolution":
        return "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-500/30";
      case "personal_trainer":
        return "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-500/30";
      default:
        if (trialDays !== null && trialDays <= 2) {
          return "bg-red-500/10 text-red-600 border-red-500/30";
        }
        return "bg-gray-500/10 text-gray-600 border-gray-500/30";
    }
  };

  const isTrialExpired = currentPlan === "free" && (trialDays === null || trialDays <= 0);
  const canGeneratePlans = currentPlan === "evolution" || currentPlan === "personal_trainer";

  if (compact) {
    return (
      <Badge className={`gap-1.5 py-1 px-3 ${getPlanColor()}`}>
        {getPlanIcon()}
        <span className="font-semibold">{getPlanLabel()}</span>
        {currentPlan === "free" && trialDays !== null && trialDays > 0 && (
          <span className="ml-1 font-bold">({trialDays} dias)</span>
        )}
      </Badge>
    );
  }

  return (
    <Card className={`p-4 border-2 ${getPlanColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            currentPlan !== "free" 
              ? "bg-gradient-to-br from-primary/20 to-secondary/20" 
              : isTrialExpired 
                ? "bg-red-500/20"
                : "bg-amber-500/20"
          }`}>
            {isTrialExpired ? <AlertTriangle className="w-6 h-6 text-red-500" /> : getPlanIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-lg">{getPlanLabel()}</p>
              {(currentPlan === "evolution" || currentPlan === "personal_trainer") && (
                <Sparkles className="w-4 h-4 text-amber-500" />
              )}
            </div>
            {currentPlan === "free" && trialDays !== null && trialDays > 0 && (
              <p className="text-sm font-medium">
                <CalendarDays className="w-4 h-4 inline mr-1" />
                {trialDays} {trialDays === 1 ? "dia restante" : "dias restantes"}
              </p>
            )}
            {isTrialExpired && (
              <p className="text-sm text-red-500 font-medium">
                Subscreva para continuar
              </p>
            )}
            {endDate && currentPlan !== "free" && (
              <div className="space-y-0.5">
                <p className="text-sm text-muted-foreground">
                  Válido até {endDate.toLocaleDateString('pt-AO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                {paidDaysLeft !== null && (
                  <p className="text-sm font-medium">
                    <CalendarDays className="w-4 h-4 inline mr-1" />
                    {paidDaysLeft} {paidDaysLeft === 1 ? "dia restante" : "dias restantes"}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
        
        {showButton && currentPlan === "free" && (
          <Button 
            size="sm" 
            variant={isTrialExpired ? "destructive" : "default"}
            onClick={() => navigate("/subscription")}
          >
            {isTrialExpired ? "Subscrever" : "Ver Planos"}
          </Button>
        )}
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-current/10">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${canGeneratePlans ? "bg-green-500" : "bg-gray-300"}`} />
              <span className={canGeneratePlans ? "" : "text-muted-foreground"}>
                Gerar Planos de Alimentação
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${canGeneratePlans ? "bg-green-500" : "bg-gray-300"}`} />
              <span className={canGeneratePlans ? "" : "text-muted-foreground"}>
                Gerar Planos de Treino
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Análise de Refeições</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Receitas Personalizadas</span>
            </div>
          </div>

          {!canGeneratePlans && currentPlan !== "free" && (
            <p className="text-xs text-muted-foreground mt-3">
              ⚡ Faça upgrade para o Plano Evolução para gerar planos personalizados
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default PlanBadge;