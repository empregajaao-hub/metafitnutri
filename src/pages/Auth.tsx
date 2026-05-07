import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, Phone, ArrowLeft, Sparkles, Gift } from "lucide-react";
import { loginSchema } from "@/lib/validations";
import { z } from "zod";
import logo from "@/assets/logo.png";
import GoalCelebration from "@/components/GoalCelebration";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const signupParam = searchParams.get("signup");
  const [isLogin, setIsLogin] = useState(!inviteToken && signupParam !== "1");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load invite info if token present
  useEffect(() => {
    if (inviteToken) {
      loadInviteInfo();
    }
  }, [inviteToken]);

  const loadInviteInfo = async () => {
    const { data } = await supabase
      .from("plan_members")
      .select("*")
      .eq("invite_token", inviteToken)
      .eq("status", "pending")
      .maybeSingle();
    
    if (data) {
      setInviteInfo(data);
      if (data.member_email) setEmail(data.member_email);
    } else {
      toast({
        title: "Convite inválido",
        description: "Este link de convite já foi usado ou é inválido.",
        variant: "destructive",
      });
    }
  };

  const signupSchemaOptionalPhone = z.object({
    email: z.string().trim().min(1, 'Email é obrigatório').email('Email inválido'),
    password: z.string()
      .min(1, 'Senha é obrigatória')
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Za-z]/, 'Deve conter uma letra')
      .regex(/[0-9]/, 'Deve conter um número'),
    fullName: z.string()
      .trim()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    phoneNumber: z.string()
      .trim()
      .optional()
      .refine((val) => {
        if (!val || val === '') return true;
        return /^\+?[0-9\s-]{9,20}$/.test(val);
      }, 'Formato de telefone inválido'),
  });

  const validateForm = (): boolean => {
    setErrors({});
    
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchemaOptionalPhone.parse({ 
          email, 
          password, 
          fullName, 
          phoneNumber: phoneNumber || undefined 
        });
      }
      return true;
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          const field = err.path[0];
          if (field && !newErrors[field]) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: isAdmin } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });

          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }

        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              phone_number: phoneNumber.trim() || null,
            },
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (error) throw error;

        // If registering via invite, accept the invite
        if (inviteToken && signUpData.user) {
          await supabase
            .from("plan_members")
            .update({
              member_id: signUpData.user.id,
              status: "active",
            })
            .eq("invite_token", inviteToken)
            .eq("status", "pending");

          // Copy the owner's subscription plan to the new member
          if (inviteInfo?.owner_id) {
            const { data: ownerSub } = await supabase
              .from("user_subscriptions")
              .select("plan, end_date")
              .eq("user_id", inviteInfo.owner_id)
              .single();

            if (ownerSub) {
              await supabase
                .from("user_subscriptions")
                .update({
                  plan: ownerSub.plan,
                  end_date: ownerSub.end_date,
                  is_active: true,
                  start_date: new Date().toISOString(),
                })
                .eq("user_id", signUpData.user.id);
            }
          }

          toast({
            title: "Conta criada no Plano Evolução! 🎉",
            description: "Foste adicionado ao plano. Complete a anamnese para personalizar!",
          });
        } else {
          toast({
            title: "Conta criada!",
            description: "Complete o teste de anamnese para planos personalizados!",
          });
        }
        setShowCelebration(true);
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


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-4">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <img 
                src={logo} 
                alt="METAFIT" 
                className="w-20 h-20 object-cover rounded-full border-2 border-primary/30 shadow-glow relative z-10" 
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {inviteToken ? "Convite Especial" : isLogin ? "Bem-vindo" : "Criar Conta"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {inviteToken
                  ? "Cria a tua conta para entrar no plano"
                  : isLogin
                    ? "Entre para continuar"
                    : "Comece a sua jornada fitness"}
              </p>
            </div>
          </div>

          {/* Invite Banner */}
          {inviteToken && inviteInfo && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Gift className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">Plano Evolução</p>
                <p className="text-xs text-muted-foreground">Foste convidado(a)! Cria a conta para aceder.</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João Silva"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                    }}
                    className={`pl-10 bg-muted/30 ${errors.fullName ? 'border-destructive' : 'border-border/50'}`}
                    required={!isLogin}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm">Telefone <span className="text-muted-foreground">(opcional)</span></Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="+244 900 000 000"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value);
                      if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                    }}
                    className={`pl-10 bg-muted/30 ${errors.phoneNumber ? 'border-destructive' : 'border-border/50'}`}
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-xs text-destructive">{errors.phoneNumber}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="teu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`pl-10 bg-muted/30 ${errors.email ? 'border-destructive' : 'border-border/50'}`}
                  required
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`pl-10 bg-muted/30 ${errors.password ? 'border-destructive' : 'border-border/50'}`}
                  required
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Aguarde...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {isLogin ? "Entrar" : "Criar Conta"}
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin
                ? "Não tens conta? Criar agora"
                : "Já tens conta? Entrar"}
            </button>
          </div>
        </div>
      </div>

      <GoalCelebration
        show={showCelebration}
        type="account_created"
        userName={fullName}
        onClose={() => {
          setShowCelebration(false);
          navigate("/anamnesis");
        }}
      />
    </div>
  );
};

export default Auth;
