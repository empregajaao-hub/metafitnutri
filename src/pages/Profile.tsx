import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { User, LogOut, Bell } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [notifications, setNotifications] = useState<any>({});
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meu Perfil</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <div className="space-y-6">
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
                  value={profile.full_name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">Objetivo</Label>
                <select
                  id="goal"
                  value={profile.goal || "maintain"}
                  onChange={(e) =>
                    setProfile({ ...profile, goal: e.target.value })
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
                  value={profile.age || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, age: parseInt(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profile.weight || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, weight: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profile.height || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, height: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="activity">Nível de Actividade</Label>
                <select
                  id="activity"
                  value={profile.activity_level || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, activity_level: e.target.value })
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
    </div>
  );
};

export default Profile;