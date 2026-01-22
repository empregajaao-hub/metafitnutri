import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Bell, AlertCircle, ArrowLeft, Trash2, ClipboardList } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlanBadge from "@/components/PlanBadge";
import WeeklyPlanGenerator from "@/components/WeeklyPlanGenerator";
import { enableWebPush } from "@/lib/pushNotifications";
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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
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

      // Check if profile is complete
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

  const handleEnablePush = async () => {
    try {
      const res = await enableWebPush();
      if (res.enabled) {
        toast({
          title: "Push activado",
          description: "A partir de agora vais receber alertas no telemóvel/navegador (quando permitido).",
        });
      } else {
        toast({
          title: "Não foi possível activar",
          description: "O teu dispositivo/navegador não permite push ou a permissão foi negada.",
          variant: "destructive",
        });
      }
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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Delete user data from all tables
      if (user?.id) {
        await supabase.from("meal_analyses").delete().eq("user_id", user.id);
        await supabase.from("recipes_generated").delete().eq("user_id", user.id);
        await supabase.from("favorite_recipes").delete().eq("user_id", user.id);
        await supabase.from("notification_preferences").delete().eq("user_id", user.id);
        await supabase.from("profiles").delete().eq("id", user.id);
        await supabase.from("user_roles").delete().eq("user_id", user.id);
      }

      // Sign out the user (account deletion from auth.users requires admin/service role)
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
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-24">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="space-y-6">
          {/* Plan Badge - Most Prominent */}
          <PlanBadge showButton={true} showDetails={true} />

          {/* Profile Completion Alert */}
          {!isProfileComplete && (
            <Alert className="border-amber-500/50 bg-amber-500/5">
              <ClipboardList className="h-4 w-4 text-amber-500" />
              <AlertDescription className="flex items-center justify-between">
                <span>Complete o teste de anamnese para desbloquear planos personalizados!</span>
                <Button 
                  size="sm" 
                  variant="default"
                  onClick={() => navigate("/anamnesis")}
                  className="ml-4"
                >
                  Completar Teste
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Weekly Plan Generators */}
          <div className="grid md:grid-cols-2 gap-4">
            <WeeklyPlanGenerator type="meal" />
            <WeeklyPlanGenerator type="workout" />
          </div>

          {/* Personal Information */}
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
                  <option value="very_active">Muito Activo</option>
                </select>
              </div>
            </div>

            <Button onClick={handleUpdateProfile} className="mt-6 w-full">
              Guardar Alterações
            </Button>
          </Card>

          {/* Notification Preferences */}
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

            <Button onClick={handleEnablePush} variant="outline" className="mt-3 w-full">
              Activar Notificações Push
            </Button>
          </Card>

          {/* Delete Account Section */}
          <Card className="p-6 border-destructive/50">
            <div className="flex items-center gap-4 mb-4">
              <Trash2 className="w-8 h-8 text-destructive" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Apagar Conta
                </h2>
                <p className="text-sm text-muted-foreground">
                  Esta ação é permanente e não pode ser desfeita
                </p>
              </div>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Apagar Minha Conta
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é permanente e não pode ser desfeita. Todos os teus dados serão eliminados, incluindo:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Perfil e informações pessoais</li>
                      <li>Histórico de análises de refeições</li>
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
                    {deleting ? "Eliminando..." : "Sim, Apagar Conta"}
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