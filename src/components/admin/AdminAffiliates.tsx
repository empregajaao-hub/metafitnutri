import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Users as UsersIcon, MousePointerClick, DollarSign, Clock, CheckCircle2,
  TrendingUp, Trophy, Settings as SettingsIcon, Download, FileText,
} from "lucide-react";

const fmt = (n: number) => `${(n || 0).toLocaleString("pt-PT")} Kz`;

export const AdminAffiliates = ({ subTab = "overview" }: { subTab?: string }) => {
  const { toast } = useToast();
  const [tab, setTab] = useState(subTab);
  useEffect(() => setTab(subTab), [subTab]);

  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [editAff, setEditAff] = useState<any>(null);
  const [payAff, setPayAff] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [a, c, p, ck, s] = await Promise.all([
      supabase.from("affiliates").select("*").order("created_at", { ascending: false }),
      supabase.from("commissions").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("affiliate_payments").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("affiliate_clicks").select("created_at").order("created_at", { ascending: false }).limit(1000),
      supabase.from("affiliate_settings").select("*").eq("id", 1).maybeSingle(),
    ]);
    setAffiliates(a.data || []);
    setCommissions(c.data || []);
    setPayments(p.data || []);
    setClicks(ck.data || []);
    setSettings(s.data);
    setLoading(false);
  };

  const totalAff = affiliates.length;
  const activeAff = affiliates.filter((a) => a.status === "active").length;
  const pendingAff = affiliates.filter((a) => a.status === "pending").length;
  const totalSales = commissions.reduce((s, c) => s + Number(c.sale_amount), 0);
  const totalPaid = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + Number(c.commission_amount), 0);
  const pendingComm = commissions.filter((c) => c.status === "approved" || c.status === "pending").reduce((s, c) => s + Number(c.commission_amount), 0);
  const totalClicks = clicks.length;
  const totalConversions = commissions.length;

  // weekly chart
  const weekly = (() => {
    const days: { day: string; vendas: number; comissoes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const day = d.toLocaleDateString("pt-PT", { weekday: "short" });
      const inDay = commissions.filter((c) => {
        const t = new Date(c.created_at).getTime();
        return t >= d.getTime() && t < next.getTime();
      });
      days.push({
        day,
        vendas: inDay.reduce((s, c) => s + Number(c.sale_amount), 0),
        comissoes: inDay.reduce((s, c) => s + Number(c.commission_amount), 0),
      });
    }
    return days;
  })();

  const topAff = [...affiliates]
    .sort((a, b) => Number(b.total_earned) - Number(a.total_earned))
    .slice(0, 10)
    .map((a) => ({ name: a.name?.split(" ")[0] || a.code, ganho: Number(a.total_earned) }));

  const updateStatus = async (id: string, status: string) => {
    const upd: any = { status };
    if (status === "active") upd.approved_at = new Date().toISOString();
    const { error } = await supabase.from("affiliates").update(upd).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Atualizado" }); loadAll(); }
  };

  const updateAffiliate = async () => {
    if (!editAff) return;
    const { error } = await supabase.from("affiliates")
      .update({ commission_percent: editAff.commission_percent, bonus: editAff.bonus, notes: editAff.notes })
      .eq("id", editAff.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Afiliado atualizado" }); setEditAff(null); loadAll(); }
  };

  const markCommissionPaid = async (id: string) => {
    const { error } = await supabase.from("commissions")
      .update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Comissão marcada como paga" }); loadAll(); }
  };

  const recordPayout = async () => {
    if (!payAff || !payAmount) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("affiliate_payments").insert({
      affiliate_id: payAff.id, amount: amt, method: payAff.payment_method, created_by: user?.id,
    });
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await supabase.from("affiliates").update({ total_paid: Number(payAff.total_paid) + amt }).eq("id", payAff.id);
    toast({ title: "Pagamento registado" });
    setPayAff(null); setPayAmount(""); loadAll();
  };

  const saveSettings = async () => {
    const { error } = await supabase.from("affiliate_settings").update({
      default_percent: settings.default_percent,
      min_payout: settings.min_payout,
      cookie_days: settings.cookie_days,
    }).eq("id", 1);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Configurações guardadas" });
  };

  const exportCSV = () => {
    const header = "ID,Nome,Email,Código,Status,%,Cliques,Conversões,Total Ganho,Total Pago\n";
    const rows = affiliates.map((a) =>
      [a.id, a.name, a.email, a.code, a.status, a.commission_percent, a.total_clicks, a.total_conversions, a.total_earned, a.total_paid].join(",")).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "afiliados.csv"; a.click();
  };

  if (loading) return <div className="py-12 text-center text-muted-foreground">A carregar afiliados...</div>;

  const rankPeriod = (days: number) => {
    const since = Date.now() - days * 24 * 60 * 60 * 1000;
    const map: Record<string, { name: string; sales: number; earned: number }> = {};
    commissions.filter((c) => new Date(c.created_at).getTime() >= since).forEach((c) => {
      const aff = affiliates.find((x) => x.id === c.affiliate_id);
      const key = c.affiliate_id;
      if (!map[key]) map[key] = { name: aff?.name || aff?.code || "?", sales: 0, earned: 0 };
      map[key].sales += 1;
      map[key].earned += Number(c.commission_amount);
    });
    return Object.entries(map).sort((a, b) => b[1].earned - a[1].earned).slice(0, 20);
  };

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/30 p-1">
        <TabsTrigger value="overview">Dashboard</TabsTrigger>
        <TabsTrigger value="list">Afiliados {pendingAff > 0 && <Badge className="ml-1 bg-orange-500">{pendingAff}</Badge>}</TabsTrigger>
        <TabsTrigger value="commissions">Comissões</TabsTrigger>
        <TabsTrigger value="payments">Pagamentos</TabsTrigger>
        <TabsTrigger value="ranking">Ranking</TabsTrigger>
        <TabsTrigger value="reports">Relatórios</TabsTrigger>
        <TabsTrigger value="settings">Configurações</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Kpi icon={UsersIcon} label="Total Afiliados" value={String(totalAff)} />
          <Kpi icon={CheckCircle2} label="Ativos" value={String(activeAff)} accent="text-green-500" />
          <Kpi icon={DollarSign} label="Total Vendas" value={fmt(totalSales)} />
          <Kpi icon={TrendingUp} label="Pago em Comissões" value={fmt(totalPaid)} />
          <Kpi icon={Clock} label="Comissão Pendente" value={fmt(pendingComm)} accent="text-amber-500" />
          <Kpi icon={MousePointerClick} label="Cliques Totais" value={String(totalClicks)} />
          <Kpi icon={Trophy} label="Conversões" value={String(totalConversions)} />
          <Kpi icon={Clock} label="Pendentes Aprovação" value={String(pendingAff)} accent="text-orange-500" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Vendas Semanais</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="vendas" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="comissoes" stroke="hsl(var(--accent))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Top 10 Afiliados</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topAff}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="ganho" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="list" className="mt-6">
        <Card className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Cliques</TableHead>
                <TableHead>Conv.</TableHead>
                <TableHead>Ganho</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {affiliates.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    <div className="font-medium">{a.name}</div>
                    <div className="text-xs text-muted-foreground">{a.email} • {a.whatsapp}</div>
                  </TableCell>
                  <TableCell><code className="text-xs">{a.code}</code></TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      a.status === "active" ? "border-green-500/40 text-green-500" :
                      a.status === "pending" ? "border-amber-500/40 text-amber-500" :
                      "border-destructive/40 text-destructive"}>{a.status}</Badge>
                  </TableCell>
                  <TableCell>{a.commission_percent}%</TableCell>
                  <TableCell>{a.total_clicks}</TableCell>
                  <TableCell>{a.total_conversions}</TableCell>
                  <TableCell>{fmt(a.total_earned)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {a.status !== "active" && <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "active")}>Aprovar</Button>}
                      {a.status === "active" && <Button size="sm" variant="outline" onClick={() => updateStatus(a.id, "suspended")}>Suspender</Button>}
                      {a.status === "pending" && <Button size="sm" variant="ghost" onClick={() => updateStatus(a.id, "rejected")}>Rejeitar</Button>}
                      <Button size="sm" variant="ghost" onClick={() => setEditAff({ ...a })}>Editar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setPayAff(a)}>Pagar</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {affiliates.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">Sem afiliados ainda.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="commissions" className="mt-6">
        <Card className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Afiliado</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Venda</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((c) => {
                const aff = affiliates.find((a) => a.id === c.affiliate_id);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{new Date(c.created_at).toLocaleDateString("pt-PT")}</TableCell>
                    <TableCell>{aff?.name || aff?.code}</TableCell>
                    <TableCell>{c.plan}</TableCell>
                    <TableCell>{fmt(c.sale_amount)}</TableCell>
                    <TableCell className="font-semibold">{fmt(c.commission_amount)}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{c.status}</Badge></TableCell>
                    <TableCell>
                      {c.status !== "paid" && <Button size="sm" variant="outline" onClick={() => markCommissionPaid(c.id)}>Marcar Paga</Button>}
                    </TableCell>
                  </TableRow>
                );
              })}
              {commissions.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">Sem comissões ainda.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="payments" className="mt-6">
        <Card className="p-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Afiliado</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead>Referência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => {
                const aff = affiliates.find((a) => a.id === p.affiliate_id);
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{new Date(p.paid_at).toLocaleDateString("pt-PT")}</TableCell>
                    <TableCell>{aff?.name || "?"}</TableCell>
                    <TableCell className="font-semibold">{fmt(p.amount)}</TableCell>
                    <TableCell>{p.method || "-"}</TableCell>
                    <TableCell className="text-xs">{p.reference || "-"}</TableCell>
                  </TableRow>
                );
              })}
              {payments.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">Sem pagamentos ainda.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="ranking" className="mt-6">
        <Tabs defaultValue="month">
          <TabsList>
            <TabsTrigger value="day">Diário</TabsTrigger>
            <TabsTrigger value="week">Semanal</TabsTrigger>
            <TabsTrigger value="month">Mensal</TabsTrigger>
          </TabsList>
          {[["day", 1], ["week", 7], ["month", 30]].map(([k, days]) => (
            <TabsContent key={k as string} value={k as string} className="mt-4">
              <Card className="p-4">
                <Table>
                  <TableHeader>
                    <TableRow><TableHead>#</TableHead><TableHead>Afiliado</TableHead><TableHead>Vendas</TableHead><TableHead>Ganho</TableHead></TableRow>
                  </TableHeader>
                  <TableBody>
                    {rankPeriod(days as number).map(([id, r], i) => (
                      <TableRow key={id}>
                        <TableCell className="font-bold">{i + 1}</TableCell>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.sales}</TableCell>
                        <TableCell>{fmt(r.earned)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>

      <TabsContent value="reports" className="mt-6 space-y-4">
        <Card className="p-6 flex items-center justify-between">
          <div>
            <h3 className="font-semibold flex items-center gap-2"><FileText className="w-4 h-4" /> Exportar Afiliados</h3>
            <p className="text-sm text-muted-foreground">Descarrega CSV com todos os afiliados e métricas.</p>
          </div>
          <Button onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
        </Card>
        <div className="grid md:grid-cols-3 gap-3">
          <Kpi icon={DollarSign} label="Receita Total" value={fmt(totalSales)} />
          <Kpi icon={TrendingUp} label="Comissões Pagas" value={fmt(totalPaid)} />
          <Kpi icon={Clock} label="A Pagar" value={fmt(pendingComm)} accent="text-amber-500" />
        </div>
      </TabsContent>

      <TabsContent value="settings" className="mt-6">
        {settings && (
          <Card className="p-6 max-w-lg space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><SettingsIcon className="w-4 h-4" /> Configurações Globais</h3>
            <div className="space-y-2">
              <Label>Percentagem Padrão (%)</Label>
              <Input type="number" value={settings.default_percent}
                onChange={(e) => setSettings({ ...settings, default_percent: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Pagamento Mínimo (Kz)</Label>
              <Input type="number" value={settings.min_payout}
                onChange={(e) => setSettings({ ...settings, min_payout: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Duração do Cookie (dias)</Label>
              <Input type="number" value={settings.cookie_days}
                onChange={(e) => setSettings({ ...settings, cookie_days: Number(e.target.value) })} />
            </div>
            <Button onClick={saveSettings}>Guardar</Button>
          </Card>
        )}
      </TabsContent>

      {/* Edit affiliate dialog */}
      <Dialog open={!!editAff} onOpenChange={(o) => !o && setEditAff(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Afiliado</DialogTitle></DialogHeader>
          {editAff && (
            <div className="space-y-3">
              <div><Label>Comissão (%)</Label>
                <Input type="number" value={editAff.commission_percent}
                  onChange={(e) => setEditAff({ ...editAff, commission_percent: Number(e.target.value) })} /></div>
              <div><Label>Bónus (Kz)</Label>
                <Input type="number" value={editAff.bonus || 0}
                  onChange={(e) => setEditAff({ ...editAff, bonus: Number(e.target.value) })} /></div>
              <div><Label>Notas</Label>
                <Input value={editAff.notes || ""} onChange={(e) => setEditAff({ ...editAff, notes: e.target.value })} /></div>
              <Button onClick={updateAffiliate} className="w-full">Guardar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payout dialog */}
      <Dialog open={!!payAff} onOpenChange={(o) => !o && setPayAff(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registar Pagamento</DialogTitle></DialogHeader>
          {payAff && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">A pagar a <b>{payAff.name}</b></p>
              <p className="text-xs text-muted-foreground">Método: {payAff.payment_method.toUpperCase()} — {payAff.payment_details}</p>
              <div><Label>Valor (Kz)</Label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} /></div>
              <Button onClick={recordPayout} className="w-full">Confirmar</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

const Kpi = ({ icon: Icon, label, value, accent }: any) => (
  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="p-4">
      <Icon className={`w-4 h-4 mb-2 ${accent || "text-primary"}`} />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  </motion.div>
);

export default AdminAffiliates;