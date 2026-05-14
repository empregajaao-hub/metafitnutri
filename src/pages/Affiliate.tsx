import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Copy, Share2, Wallet, MousePointerClick, Users as UsersIcon,
  TrendingUp, Clock, CheckCircle2, MessageCircle, Facebook, Instagram, Trophy,
  AlertCircle, CheckCircle, Zap,
} from "lucide-react";
import { AffiliateQRCode } from "@/components/AffiliateQRCode";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().trim().min(2).max(100),
  whatsapp: z.string().trim().min(8).max(20),
  email: z.string().trim().email().max(255),
  payment_method: z.enum(["iban", "wallet"]),
  payment_details: z.string().trim().min(4).max(200),
});

const fmt = (n: number) => `${(n || 0).toLocaleString("pt-PT")} Kz`;

const Affiliate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [aff, setAff] = useState<any>(null);
  const [stats, setStats] = useState({ pending: 0, paid: 0, approved: 0 });
  const [commissions, setCommissions] = useState<any[]>([]);
  const [rank, setRank] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    whatsapp: "",
    email: "",
    payment_method: "iban" as "iban" | "wallet",
    payment_details: "",
  });

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) {
        navigate("/auth");
        return;
      }
      setUser(u);
      setForm((f) => ({ ...f, email: u.email || "" }));
      const { data: profile } = await supabase
        .from("profiles").select('"Nome Completo", phone').eq("id", u.id).maybeSingle();
      if (profile) {
        setForm((f) => ({
          ...f,
          name: f.name || profile["Nome Completo"] || "",
          whatsapp: f.whatsapp || profile.phone || "",
        }));
      }
      await loadAffiliate(u.id);
      setLoading(false);
    })();
  }, []);

  const loadAffiliate = async (uid: string) => {
    const { data } = await supabase
      .from("affiliates").select("*").eq("user_id", uid).maybeSingle();
    if (data) {
      setAff(data);
      const { data: comms } = await supabase
        .from("commissions").select("*").eq("affiliate_id", data.id).order("created_at", { ascending: false });
      const all = comms || [];
      setCommissions(all);
      setStats({
        pending: all.filter((c: any) => c.status === "pending").reduce((s: number, c: any) => s + Number(c.commission_amount), 0),
        approved: all.filter((c: any) => c.status === "approved").reduce((s: number, c: any) => s + Number(c.commission_amount), 0),
        paid: all.filter((c: any) => c.status === "paid").reduce((s: number, c: any) => s + Number(c.commission_amount), 0),
      });
      // ranking by total_earned
      const { data: rankList } = await supabase
        .from("affiliates").select("id,total_earned").eq("status", "active")
        .order("total_earned", { ascending: false }).limit(100);
      const idx = rankList?.findIndex((r: any) => r.id === data.id);
      setRank(idx !== undefined && idx >= 0 ? idx + 1 : null);
    }
  };

  const apply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = formSchema.safeParse(form);
    if (!parsed.success) {
      toast({ title: "Verifica os campos", description: parsed.error.issues[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const base = (form.name.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "user").slice(0, 12);
      const code = `${base}${Math.floor(Math.random() * 9000 + 1000)}`;
      const { error } = await supabase.from("affiliates").insert({
        user_id: user.id,
        code,
        name: form.name,
        whatsapp: form.whatsapp,
        email: form.email,
        payment_method: form.payment_method,
        payment_details: form.payment_details,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Candidatura enviada!", description: "A nossa equipa vai aprovar em breve." });
      await loadAffiliate(user.id);
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const link = aff ? `${window.location.origin}/ref/${aff.code}` : "";
  const shareText = `Junta-te à METAFIT NUTRI e transforma a tua nutrição com IA! ${link}`;
  const conversionRate = aff && aff.total_clicks > 0 ? ((aff.total_conversions / aff.total_clicks) * 100).toFixed(1) : 0;

  const copyLink = async () => {
    await navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!", description: "Partilha-o agora." });
  };

  const share = (platform: "whatsapp" | "facebook" | "instagram") => {
    let url = "";
    if (platform === "whatsapp") url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    else if (platform === "facebook") url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
    else url = `https://www.instagram.com/`;
    window.open(url, "_blank");
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary" />
    </div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border/50">
        <div className="container max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <h1 className="font-semibold">Programa de Afiliados</h1>
        </div>
      </header>

      <main className="container max-w-3xl mx-auto px-4 py-6 space-y-6">
        {!aff && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="p-6 space-y-4">
              <div className="space-y-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">Ganha 40% por venda</Badge>
                <h2 className="text-2xl font-bold">Torna-te Afiliado METAFIT</h2>
                <p className="text-sm text-muted-foreground">
                  Indica amigos, partilha o teu link único e recebe comissão por cada assinatura ativada.
                </p>
              </div>
              <form onSubmit={apply} className="space-y-3">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>WhatsApp</Label>
                  <Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+244 ..." required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Método de Pagamento</Label>
                  <Select value={form.payment_method} onValueChange={(v: any) => setForm({ ...form, payment_method: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iban">IBAN (Transferência Bancária)</SelectItem>
                      <SelectItem value="wallet">Carteira Digital</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{form.payment_method === "iban" ? "IBAN" : "Detalhes da Carteira"}</Label>
                  <Input value={form.payment_details} onChange={(e) => setForm({ ...form, payment_details: e.target.value })} required />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "A enviar..." : "Enviar Candidatura"}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {aff && aff.status === "pending" && (
          <Card className="p-6 text-center space-y-3">
            <Clock className="w-12 h-12 mx-auto text-amber-500" />
            <h2 className="text-xl font-bold">Candidatura em Análise</h2>
            <p className="text-sm text-muted-foreground">Vamos rever os teus dados e ativar o teu link em breve.</p>
          </Card>
        )}

        {aff && aff.status === "rejected" && (
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-xl font-bold">Candidatura Não Aprovada</h2>
            <p className="text-sm text-muted-foreground">Contacta o suporte para mais informações.</p>
          </Card>
        )}

        {aff && aff.status === "suspended" && (
          <Card className="p-6 text-center space-y-3">
            <h2 className="text-xl font-bold">Conta Suspensa</h2>
            <p className="text-sm text-muted-foreground">A tua conta de afiliado está temporariamente suspensa.</p>
          </Card>
        )}

        {aff && aff.status === "active" && (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6 bg-gradient-to-br from-primary/15 to-primary/5 border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-primary/20 text-primary border-primary/30">{aff.commission_percent}% por venda</Badge>
                  {rank && <Badge variant="outline"><Trophy className="w-3 h-3 mr-1" /> #{rank}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground mb-1">O teu link de indicação</p>
                <div className="flex gap-2 mb-4">
                  <Input value={link} readOnly className="font-mono text-sm" />
                  <Button onClick={copyLink} size="icon" variant="secondary"><Copy className="w-4 h-4" /></Button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Button variant="outline" size="sm" onClick={() => share("whatsapp")}><MessageCircle className="w-4 h-4 mr-1" /> WhatsApp</Button>
                  <Button variant="outline" size="sm" onClick={() => share("facebook")}><Facebook className="w-4 h-4 mr-1" /> Facebook</Button>
                  <Button variant="outline" size="sm" onClick={() => share("instagram")}><Instagram className="w-4 h-4 mr-1" /> Instagram</Button>
                </div>
                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-3">QR Code do teu link</p>
                  <div className="flex justify-center">
                    <AffiliateQRCode link={link} affiliateName={aff.name} size={160} />
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={MousePointerClick} label="Cliques" value={String(aff.total_clicks)} />
              <StatCard icon={UsersIcon} label="Conversões" value={String(aff.total_conversions)} />
              <StatCard icon={Wallet} label="Total Ganho" value={fmt(aff.total_earned)} />
              <StatCard icon={TrendingUp} label="Taxa Conversão" value={`${conversionRate}%`} accent />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Histórico de Comissões</h3>
                {commissions.length === 0 ? (
                  <div className="text-center py-6">
                    <Zap className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Ainda sem comissões. Partilha o teu link!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {commissions.slice(0, 20).map((c) => (
                      <motion.div key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{c.plan || "Plano"}</p>
                          <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-PT")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">{fmt(Number(c.commission_amount))}</p>
                          <Badge variant="outline" className={`text-[10px] capitalize ${
                            c.status === 'paid' ? 'border-green-500/40 text-green-500' :
                            c.status === 'approved' ? 'border-blue-500/40 text-blue-500' :
                            'border-amber-500/40 text-amber-500'
                          }`}>{c.status}</Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-4 flex items-center justify-between text-sm bg-green-50 border-green-200">
                <div className="flex items-center gap-2 text-green-700"><CheckCircle className="w-4 h-4" /> Pago</div>
                <span className="font-semibold text-green-700">{fmt(stats.paid)}</span>
              </Card>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }: any) => (
  <Card className="p-3">
    <Icon className={`w-4 h-4 mb-2 ${accent ? "text-amber-500" : "text-primary"}`} />
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-base font-bold">{value}</p>
  </Card>
);

export default Affiliate;