import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Bell, AlertCircle, Crown, Clock, Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any>({});
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeUntilRenewal, setTimeUntilRenewal] = useState<string>("");
  const [renewalProgress, setRenewalProgress] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const planNames: Record<string, string> = {
    free: "Gratuito",
    monthly: "Mensal",
    annual: "Anual",
    personal_trainer: "Personal Trainer",
  };

  const planDurations: Record<string, number> = {
    monthly: 30,
    annual: 365,
    personal_trainer: 30,
  };

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listen for payment status changes
    const paymentChannel = supabase
      .channel('payment-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'payments',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new?.status;
          if (newStatus === 'approved') {
            toast({
              title: "🎉 Pagamento Aprovado!",
              description: "O teu pagamento foi aprovado com sucesso. Obrigado!",
            });
          }
        }
      )
      .subscribe();

    // Listen for subscription changes (activation, plan change, etc.)
    const subscriptionChannel = supabase
      .channel('subscription-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_subscriptions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new;
          const oldData = payload.old;
          
          // Immediately update local state with new subscription data
          setSubscription(newData);
          
          // Check if plan changed
          if (oldData?.plan !== newData?.plan) {
            toast({
              title: "🔄 Plano Alterado!",
              description: `O teu plano foi alterado para ${planNames[newData?.plan as string] || newData?.plan}!`,
            });
          }
          
          // Check if plan was activated
          if (newData?.is_active && !oldData?.is_active && newData?.plan !== 'free') {
            toast({
              title: "✅ Plano Activado!",
              description: `O teu plano ${planNames[newData.plan as string] || newData.plan} foi activado com sucesso!`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentChannel);
      supabase.removeChannel(subscriptionChannel);
    };
  }, [user]);

  // Update countdown timer and check for expiration warnings
  useEffect(() => {
    if (!subscription || subscription.plan === 'free' || !subscription.end_date) return;

    const updateCountdown = () => {
      const now = new Date();
      const endDate = new Date(subscription.end_date);
      const startDate = new Date(subscription.start_date || subscription.created_at);
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const remaining = endDate.getTime() - now.getTime();
      
      if (remaining <= 0) {
        setTimeUntilRenewal("Expirado");
        setRenewalProgress(100);
        return;
      }

      const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeUntilRenewal(`${days} dias, ${hours} horas`);
      } else if (hours > 0) {
        setTimeUntilRenewal(`${hours} horas, ${minutes} minutos`);
      } else {
        setTimeUntilRenewal(`${minutes} minutos`);
      }

      const elapsed = now.getTime() - startDate.getTime();
      const progress = Math.min(100, (elapsed / totalDuration) * 100);
      setRenewalProgress(progress);
      
      // Check for expiration warnings (3 days, 1 day, expired)
      checkExpirationWarning(days, remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [subscription]);

  // Check and show expiration warnings
  const checkExpirationWarning = (daysRemaining: number, remaining: number) => {
    const warningKey = `expiration_warning_${subscription?.id}_${daysRemaining}`;
    const hasShownWarning = localStorage.getItem(warningKey);
    
    if (hasShownWarning) return;
    
    if (remaining <= 0) {
      localStorage.setItem(warningKey, 'true');
      toast({
        title: "⚠️ Plano Expirado!",
        description: "O teu plano expirou e a conta voltou ao plano gratuito. Renova para continuar a usar todas as funcionalidades!",
        variant: "destructive",
        duration: 10000,
      });
    } else if (daysRemaining <= 1) {
      localStorage.setItem(warningKey, 'true');
      toast({
        title: "⏰ Último Dia!",
        description: "O teu plano expira amanhã! Renova agora para não perder acesso às funcionalidades premium.",
        duration: 10000,
      });
    } else if (daysRemaining <= 3) {
      localStorage.setItem(warningKey, 'true');
      toast({
        title: "📅 Plano a Expirar",
        description: `O teu plano expira em ${daysRemaining} dias. Renova para continuar a usar todas as funcionalidades!`,
        duration: 8000,
      });
    }
  };

  const loadSubscription = async (userId: string) => {
    const { data: subData } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .single();
    
    setSubscription(subData);
  };

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const { data: notifData } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      await loadSubscription(user.id);

      setProfile(profileData || {});
      setNotifications(notifData || {});

      // Verificar campos obrigatórios faltando
      const missing = [];
      if (!profileData?.Objetivo) missing.push('objetivo');
      if (!profileData?.Idade) missing.push('idade');
      if (!profileData?.peso) missing.push('peso');
      if (!profileData?.Altura) missing.push('altura');
      if (!profileData?.["Nivel de Atividade"]) missing.push('nível de actividade');
      
      if (missing.length > 0) {
        toast({
          title: "Complete o seu perfil",
          description: `Campos em falta: ${missing.join(', ')}`,
          duration: 5000,
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(profile)
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Perfil actualizado!",
        description: "As tuas alterações foram guardadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotifications = async () => {
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update(notifications)
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Preferências guardadas!",
        description: "As tuas notificações foram actualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'annual':
        return 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white';
      case 'monthly':
        return 'bg-gradient-to-r from-primary to-primary/80 text-white';
      case 'personal_trainer':
        return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="space-y-6">
          {/* Subscription Card */}
          <Card className="p-6 border-primary/20 bg-gradient-to-br from-card to-card/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">
                  Meu Plano
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getPlanBadgeColor(subscription?.plan || 'free')}>
                    {planNames[subscription?.plan as string] || "Gratuito"}
                  </Badge>
                  {subscription?.is_active && subscription?.plan !== 'free' && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Activo
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {subscription?.plan && subscription.plan !== 'free' && subscription.end_date && (
              <div className="space-y-3 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Data de Renovação:</span>
                  </div>
                  <span className="font-medium text-foreground">
                    {new Date(subscription.end_date).toLocaleDateString('pt-AO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Tempo Restante:</span>
                  </div>
                  <span className={`font-bold ${timeUntilRenewal === 'Expirado' ? 'text-destructive' : 'text-primary'}`}>
                    {timeUntilRenewal}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso do Plano</span>
                    <span>{Math.round(renewalProgress)}%</span>
                  </div>
                  <Progress value={renewalProgress} className="h-2" />
                </div>
              </div>
            )}

            {(!subscription || subscription.plan === 'free') && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground mb-3">
                  Faça upgrade para desbloquear análises ilimitadas e funcionalidades premium!
                </p>
                <Button 
                  onClick={() => navigate('/pricing')} 
                  className="w-full"
                  variant="default"
                >
                  Ver Planos Premium
                </Button>
              </div>
            )}
          </Card>

          {(!profile.Objetivo || !profile.Idade || !profile.peso || !profile.Altura || !profile["Nivel de Atividade"]) && (
            <Alert className="border-primary/50 bg-primary/5">
              <AlertCircle className="h-4 w-4 text-primary" />
              <AlertDescription>
                Complete todos os campos abaixo para receber notificações personalizadas baseadas no teu objetivo!
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <User className="w-12 h-12 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Informações Pessoais
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={profile["Nome Completo"] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, "Nome Completo": e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo</Label>
                <select
                  id="goal"
                  value={profile.Objetivo || "maintain"}
                  onChange={(e) =>
                    setProfile({ ...profile, Objetivo: e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="lose">Perder Peso</option>
                  <option value="maintain">Manter Peso</option>
                  <option value="gain">Ganhar Massa</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Idade</Label>
                <Input
                  id="age"
                  type="number"
                  value={profile.Idade || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, Idade: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.peso || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, peso: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.Altura || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, Altura: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Nível de Actividade</Label>
                <select
                  id="activity"
                  value={profile["Nivel de Atividade"] || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, "Nivel de Atividade": e.target.value })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Seleccionar...</option>
                  <option value="sedentary">Sedentário</option>
                  <option value="light">Leve</option>
                  <option value="moderate">Moderado</option>
                  <option value="active">Activo</option>
                  <option value="very-active">Muito Activo</option>
                </select>
              </div>
            </div>

            <Button onClick={handleUpdateProfile} className="mt-6 w-full">
              Guardar Alterações
            </Button>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Bell className="w-8 h-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Preferências de Notificações
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolhe as notificações que queres receber
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: "workout_reminders", label: "Notificação de horas de treino" },
                { key: "meal_reminders", label: "Notificação de refeições" },
                { key: "weight_loss_tips", label: "Notificação de dicas de emagrecimento" },
                { key: "muscle_gain_tips", label: "Notificação de ganho de massa" },
                { key: "daily_plan", label: "Notificação diária do plano angolano" },
                { key: "motivation", label: "Notificação de motivação" },
                { key: "water_reminders", label: "Lembrete de beber água" },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={item.key}
                    checked={notifications[item.key] || false}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, [item.key]: checked })
                    }
                  />
                  <label
                    htmlFor={item.key}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>

            <Button onClick={handleUpdateNotifications} className="mt-6 w-full">
              Guardar Preferências
            </Button>
          </Card>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
