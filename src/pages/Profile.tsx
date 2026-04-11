import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { 
  User, LogOut, Bell, ArrowLeft, Trash2, ClipboardList, 
  Settings, Shield, Sparkles, Target, Scale, Ruler, 
  Activity, ChevronRight, Mail, ShieldCheck, Zap,
  Smartphone, Lock, Heart, Star
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PlanBadge from "@/components/PlanBadge";
import PlanMembers from "@/components/PlanMembers";
import { enableWebPush, disableWebPush, isPushEnabled } from "@/lib/pushNotifications";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
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
  const [activeTab, setActiveTab] = useState<"personal" | "notifications" | "security">("personal");
  
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
        description: "As tuas alterações foram guardadas com sucesso.",
      });
      setIsProfileComplete(true);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateNotifications = async (newNotifs?: any) => {
    const dataToUpdate = newNotifs || notifications;
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .update(dataToUpdate)
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
          <p className="text-muted-foreground text-sm font-medium">A carregar o teu universo...</p>
        </div>
      </div>
    );
  }

  const getObjectiveLabel = (obj: string) => {
    switch(obj) {
      case 'lose': return 'Perder Peso';
      case 'gain': return 'Ganho Muscular';
      case 'maintain': return 'Manutenção';
      default: return 'Definir Objetivo';
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl pb-32">
        {/* Header */}
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                variant="glass" 
                size="icon"
                onClick={() => navigate(-1)}
                className="rounded-full bg-white/5 border-white/10 backdrop-blur-md shadow-elegant"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </motion.div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground">Perfil</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span className="text-xs font-medium">{user?.email}</span>
              </div>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair
            </Button>
          </motion.div>
        </header>

        <div className="space-y-8">
          {/* User Hero Section */}
          <section>
            <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-secondary/5 p-8 shadow-glow">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-primary" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary to-accent p-1 shadow-lg">
                    <div className="w-full h-full rounded-[14px] bg-background flex items-center justify-center overflow-hidden">
                      <User className="w-12 h-12 text-primary" />
                    </div>
                  </div>
                  {isProfileComplete && (
                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg border-2 border-background">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-2xl font-black text-foreground">
                    {profile?.["Nome Completo"] || "Utilizador MetaFit"}
                  </h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    <PlanBadge showButton={false} showDetails={false} />
                    <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <Target className="w-3 h-3" />
                      {getObjectiveLabel(profile?.Objetivo)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Quick View */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-primary/10">
                <div className="text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Peso</p>
                  <p className="text-lg font-black text-foreground">{profile?.peso || "--"} <span className="text-[10px] font-normal text-muted-foreground">kg</span></p>
                </div>
                <div className="text-center border-x border-primary/10">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Altura</p>
                  <p className="text-lg font-black text-foreground">{profile?.Altura || "--"} <span className="text-[10px] font-normal text-muted-foreground">cm</span></p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Idade</p>
                  <p className="text-lg font-black text-foreground">{profile?.Idade || "--"}</p>
                </div>
              </div>
            </Card>
          </section>

          {/* Profile Completion Alert */}
          <AnimatePresence>
            {!isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert className="border-primary/30 bg-primary/5 backdrop-blur-md overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <AlertDescription className="flex items-center justify-between flex-wrap gap-4 relative z-10">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">Desbloqueia o teu potencial!</p>
                      <p className="text-xs text-muted-foreground">Completa a tua anamnese para receberes planos 100% personalizados por IA.</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => navigate("/anamnesis")}
                      className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                    >
                      Completar Agora
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Tabs */}
          <div className="flex p-1 bg-muted/30 rounded-2xl border border-border/50 backdrop-blur-sm">
            {[
              { id: "personal", label: "Dados", icon: User },
              { id: "notifications", label: "Alertas", icon: Bell },
              { id: "security", label: "Segurança", icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id 
                    ? "bg-background text-primary shadow-soft border border-border/50" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary" : ""}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "personal" && (
              <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">Informações Pessoais</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Ajusta o teu motor biológico</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nome Completo</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="fullName"
                        placeholder="Como te devemos chamar?"
                        value={profile?.["Nome Completo"] || ""}
                        onChange={(e) => setProfile({ ...profile, "Nome Completo": e.target.value })}
                        className="pl-10 h-12 bg-muted/20 border-border/50 rounded-xl focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="goal" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Objetivo Principal</Label>
                      <div className="relative group">
                        <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <select
                          id="goal"
                          value={profile?.Objetivo || "maintain"}
                          onChange={(e) => setProfile({ ...profile, Objetivo: e.target.value })}
                          className="w-full pl-10 h-12 rounded-xl border border-border/50 bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                        >
                          <option value="lose">Perder Peso</option>
                          <option value="maintain">Manutenção</option>
                          <option value="gain">Ganho Muscular</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="age" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Idade</Label>
                      <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="age"
                          type="number"
                          placeholder="Anos"
                          value={profile?.Idade || ""}
                          onChange={(e) => setProfile({ ...profile, Idade: parseInt(e.target.value) })}
                          className="pl-10 h-12 bg-muted/20 border-border/50 rounded-xl focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="weight" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Peso Atual (kg)</Label>
                      <div className="relative group">
                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="weight"
                          type="number"
                          placeholder="0.0"
                          value={profile?.peso || ""}
                          onChange={(e) => setProfile({ ...profile, peso: parseFloat(e.target.value) })}
                          className="pl-10 h-12 bg-muted/20 border-border/50 rounded-xl focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="height" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Altura (cm)</Label>
                      <div className="relative group">
                        <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                          id="height"
                          type="number"
                          placeholder="000"
                          value={profile?.Altura || ""}
                          onChange={(e) => setProfile({ ...profile, Altura: parseFloat(e.target.value) })}
                          className="pl-10 h-12 bg-muted/20 border-border/50 rounded-xl focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="activity" className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nível de Actividade</Label>
                    <div className="relative group">
                      <Activity className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <select
                        id="activity"
                        value={profile?.["Nivel de Atividade"] || ""}
                        onChange={(e) => setProfile({ ...profile, "Nivel de Atividade": e.target.value })}
                        className="w-full pl-10 h-12 rounded-xl border border-border/50 bg-muted/20 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                      >
                        <option value="">Seleccionar nível...</option>
                        <option value="sedentary">Sedentário (Escritório)</option>
                        <option value="light">Leve (1-2x semana)</option>
                        <option value="moderate">Moderado (3-5x semana)</option>
                        <option value="active">Activo (Diário)</option>
                        <option value="very_active">Muito Activo (Atleta)</option>
                      </select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleUpdateProfile} 
                    className="w-full h-14 mt-4 bg-gradient-to-r from-primary to-accent hover:shadow-glow text-white font-black rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Guardar Configurações
                  </Button>
                </div>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">Central de Alertas</h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Mantém o foco no teu progresso</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Notificações Push</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Alertas em tempo real no dispositivo</p>
                      </div>
                    </div>
                    <Switch
                      checked={pushEnabled}
                      disabled={pushLoading}
                      onCheckedChange={handleTogglePush}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  <div className="grid gap-3">
                    {[
                      { key: "workout_reminders", label: "Lembretes de Treino", icon: Zap },
                      { key: "meal_reminders", label: "Lembretes de Refeições", icon: Heart },
                      { key: "water_reminders", label: "Lembrete de Água", icon: Sparkles },
                      { key: "motivation", label: "Doses de Motivação", icon: Star },
                      { key: "daily_plan", label: "Resumo Diário", icon: ClipboardList },
                    ].map((item) => (
                      <div 
                        key={item.key} 
                        className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 hover:bg-muted/30 border border-transparent hover:border-border/50 transition-all group cursor-pointer"
                        onClick={() => {
                          const newNotifs = { ...notifications, [item.key]: !notifications[item.key] };
                          setNotifications(newNotifs);
                          handleUpdateNotifications(newNotifs);
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
                            <item.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <span className="text-sm font-bold text-foreground">{item.label}</span>
                        </div>
                        <Checkbox
                          id={item.key}
                          checked={notifications[item.key] || false}
                          className="rounded-md border-border/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          onCheckedChange={(checked) => {
                            const newNotifs = { ...notifications, [item.key]: checked };
                            setNotifications(newNotifs);
                            handleUpdateNotifications(newNotifs);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {activeTab === "security" && (
              <div className="space-y-6">
                <Card className="p-8 border-border/50 bg-card/50 backdrop-blur-sm space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-foreground">Segurança da Conta</h2>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Protege os teus dados e progresso</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-muted/20 border border-border/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Principal</p>
                          <p className="text-sm font-bold text-foreground">{user?.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600 bg-green-500/5">Verificado</Badge>
                    </div>

                    <PlanMembers />
                  </div>
                </Card>

                <Card className="p-8 border-destructive/20 bg-destructive/5 backdrop-blur-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-destructive">Zona de Perigo</h2>
                      <p className="text-xs text-destructive/70 font-medium uppercase tracking-wider">Acções críticas irreversíveis</p>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ao apagar a tua conta, todos os teus dados, incluindo histórico de treinos, análises de refeições e receitas favoritas, serão removidos permanentemente dos nossos servidores.
                  </p>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full h-12 border-destructive/30 text-destructive hover:bg-destructive hover:text-white font-bold rounded-xl transition-all">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar Conta Permanentemente
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="rounded-3xl border-border/50 backdrop-blur-xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black">Tens a certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-medium">
                          Esta ação não pode ser desfeita. Vais perder acesso a:
                          <ul className="list-disc list-inside mt-4 space-y-2 text-destructive font-bold">
                            <li>Todo o teu histórico de evolução</li>
                            <li>Receitas personalizadas guardadas</li>
                            <li>Configurações de plano e notificações</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-6 gap-3">
                        <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-bold"
                          disabled={deleting}
                        >
                          {deleting ? "A eliminar..." : "Sim, eliminar tudo"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </Card>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default Profile;
