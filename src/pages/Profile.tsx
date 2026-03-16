import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Bell, ArrowLeft, Trash2, ClipboardList, Settings, Shield, Sparkles } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlanBadge from "@/components/PlanBadge";
import PlanMembers from "@/components/PlanMembers";
import WeeklyPlanGenerator from "@/components/WeeklyPlanGenerator";
import { enableWebPush, disableWebPush, isPushEnabled } from "@/lib/pushNotifications";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
    isPushEnabled().then(setPushEnabled);
  }, []);

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

      setProfile(profileData || {});
      setNotifications(notifData || {});

      const isComplete = profileData && 
        profileData.Objetivo && 
        profileData.Idade && 
        profileData.peso && 
        profileData.Altura && 
        profileData["Nivel de Atividade"] &&
        profileData["Nome Completo"];
      
      setIsProfileComplete(!!isComplete);

      if (!isComplete) {
        toast({
          title: "Complete o seu perfil",
          description: "Complete o teste de anamnese para receber planos personalizados",
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

  const handleTogglePush = async (enable: boolean) => {
    setPushLoading(true);
    try {
      if (enable) {
        const res = await enableWebPush();
        if (res.enabled) {
          setPushEnabled(true);
          toast({ title: "Push activado", description: "Vais receber alertas no telemóvel." });
        } else {
          toast({ title: "Não foi possível activar", description: "O dispositivo não permite push ou a permissão foi negada.", variant: "destructive" });
        }
      } else {
        await disableWebPush();
        setPushEnabled(false);
        toast({ title: "Push desactivado", description: "Já não vais receber alertas push." });
      }
    } catch (error: any) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } finally {
      setPushLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      if (user?.id) {
        await supabase.from("meal_analyses").delete().eq("user_id", user.id);
        await supabase.from("recipes_generated").delete().eq("user_id", user.id);
        await supabase.from("favorite_recipes").delete().eq("user_id", user.id);
        await supabase.from("notification_preferences").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
        await supabase.from("user_roles").delete().eq("user_id", user.id);
      }

      await supabase.auth.signOut();

      toast({
        title: "Conta eliminada",
        description: "A tua conta e todos os dados foram eliminados com sucesso.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao eliminar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">A carregar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Perfil</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Plan Badge */}
          <PlanBadge showButton={true} showDetails={true} />

          {/* Profile Completion Alert */}
          {!isProfileComplete && (
            <Alert className="border-primary/20 bg-primary/5">
              <ClipboardList className="h-4 w-4 text-primary" />
              <AlertDescription className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-sm">Complete a anamnese para planos personalizados</span>
                <Button 
                  size="sm" 
                  onClick={() => navigate("/anamnesis")}
                  className="shrink-0"
                >
                  Completar
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Weekly Plan Generators */}
          <div className="grid gap-4">
            <WeeklyPlanGenerator type="meal" />
            <WeeklyPlanGenerator type="workout" />
          </div>

          {/* Personal Information */}
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Informações Pessoais</h2>
                <p className="text-xs text-muted-foreground">Dados do teu perfil</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={profile["Nome Completo"] || ""}
                  onChange={(e) => setProfile({ ...profile, "Nome Completo": e.target.value })}
                  className="bg-muted/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-sm">Objetivo</Label>
                  <select
                    id="goal"
                    value={profile.Objetivo || "maintain"}
                    onChange={(e) => setProfile({ ...profile, Objetivo: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-muted/30 text-sm"
                  >
                    <option value="lose">Perder Peso</option>
                    <option value="maintain">Manter Peso</option>
                    <option value="gain">Ganhar Massa</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.Idade || ""}
                    onChange={(e) => setProfile({ ...profile, Idade: parseInt(e.target.value) })}
                    className="bg-muted/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.peso || ""}
                    onChange={(e) => setProfile({ ...profile, peso: parseFloat(e.target.value) })}
                    className="bg-muted/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="height" className="text-sm">Altura (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.Altura || ""}
                    onChange={(e) => setProfile({ ...profile, Altura: parseFloat(e.target.value) })}
                    className="bg-muted/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity" className="text-sm">Nível de Actividade</Label>
                <select
                  id="activity"
                  value={profile["Nivel de Atividade"] || ""}
                  onChange={(e) => setProfile({ ...profile, "Nivel de Atividade": e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-muted/30 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  <option value="sedentary">Sedentário</option>
                  <option value="light">Leve</option>
                  <option value="moderate">Moderado</option>
                  <option value="active">Activo</option>
                  <option value="very_active">Muito Activo</option>
                </select>
              </div>

              <Button onClick={handleUpdateProfile} className="w-full mt-2">
                Guardar Alterações
              </Button>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notificações</h2>
                <p className="text-xs text-muted-foreground">Gerir preferências</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "workout_reminders", label: "Lembretes de treino" },
                { key: "meal_reminders", label: "Lembretes de refeições" },
                { key: "weight_loss_tips", label: "Dicas de emagrecimento" },
                { key: "muscle_gain_tips", label: "Dicas de ganho de massa" },
                { key: "daily_plan", label: "Plano diário angolano" },
                { key: "motivation", label: "Mensagens de motivação" },
                { key: "water_reminders", label: "Lembrete de água" },
              ].map((item) => (
                <div 
                  key={item.key} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <label
                    htmlFor={item.key}
                    className="text-sm cursor-pointer flex-1 min-w-0 leading-snug break-words"
                  >
                    {item.label}
                  </label>
                  <div className="pt-0.5 shrink-0">
                    <Checkbox
                      id={item.key}
                      checked={notifications[item.key] || false}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [item.key]: checked })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <Button onClick={handleUpdateNotifications} className="w-full">
                Guardar Preferências
              </Button>
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Bell className="w-5 h-5 text-primary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">Notificações Push</p>
                    <p className="text-xs text-muted-foreground leading-snug break-words">
                      {pushEnabled ? "Activo — recebes alertas no telemóvel" : "Desactivado"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={pushEnabled}
                  disabled={pushLoading}
                  onCheckedChange={handleTogglePush}
                />
              </div>
            </div>
          </Card>

          {/* Delete Account Section */}
          <Card className="p-6 border-destructive/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Zona de Perigo</h2>
                <p className="text-xs text-muted-foreground">Acções irreversíveis</p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apagar conta permanentemente?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita. Todos os teus dados serão eliminados:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Perfil e informações pessoais</li>
                      <li>Histórico de análises</li>
                      <li>Receitas favoritas</li>
                      <li>Preferências de notificações</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleting}
                  >
                    {deleting ? "A eliminar..." : "Confirmar"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
