import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  MoreVertical,
  DollarSign,
  TrendingUp,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatCard } from "@/components/StatCard";
import { toast } from "sonner";

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  plan: string;
  status: string;
  date: string;
  receipt?: string;
  provider?: string;
}

const getPlanLabel = (plan: string) => {
  const plans: Record<string, string> = {
    free: "Grátis",
    monthly: "Mensal",
    annual: "Anual",
    essential: "Individual",
    evolution: "Familiar",
    personal_trainer: "Profissional",
  };
  return plans[plan] || plan;
};

const getStatusBadge = (status: string) => {
  const statuses: Record<string, { label: string; color: string }> = {
    approved: { label: "Aprovado", color: "bg-success/10 text-success border-success/20" },
    completed: { label: "Concluído", color: "bg-success/10 text-success border-success/20" },
    pending: { label: "Pendente", color: "bg-warning/10 text-warning border-warning/20" },
    rejected: { label: "Rejeitado", color: "bg-destructive/10 text-destructive border-destructive/20" },
    failed: { label: "Falhou", color: "bg-destructive/10 text-destructive border-destructive/20" },
  };
  return statuses[status] || { label: status, color: "bg-muted/10 text-muted-foreground border-muted/20" };
};

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch payments from "Pagamentos" table
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from("Pagamentos")
        .select("*, profiles(full_name, phone)")
        .order("created_at", { ascending: false });

      if (pagamentosError) throw pagamentosError;

      const mappedPayments: Payment[] = (pagamentos || []).map((p: any) => ({
        id: p.payment_id || p.id,
        userId: p.user_id,
        userName: p.profiles?.full_name || "Utilizador Desconhecido",
        userPhone: p.profiles?.phone || "N/A",
        amount: Number(p.Valor || 0),
        plan: p.plano,
        status: p.estado,
        date: p.created_at,
        receipt: p.receipt_url,
        provider: p.provider || p["Forma de Pag"] || "N/A",
      }));

      setPayments(mappedPayments);
    } catch (error: any) {
      console.error("Erro ao carregar pagamentos:", error);
      toast.error("Erro ao carregar pagamentos");
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(
    (payment) =>
      (payment.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (payment.userPhone || "").includes(searchTerm) ||
      (payment.id || "").includes(searchTerm)
  );

  const stats = {
    approved: payments
      .filter((p) => p.status === "approved" || p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    pending: payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    approvalRate: payments.length > 0 
      ? ((payments.filter((p) => p.status === "approved" || p.status === "completed").length / payments.length) * 100).toFixed(1)
      : "0",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Pagamentos</h1>
        <p className="text-muted-foreground">Gestão de comprovativos e aprovações</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ganhos Aprovados"
          value={`${stats.approved.toLocaleString()} Kz`}
          description="Total de pagamentos aprovados"
          icon={DollarSign}
          trend={{ value: 0, direction: "up" }}
          variant="success"
        />
        <StatCard
          title="Em Análise"
          value={`${stats.pending.toLocaleString()} Kz`}
          description={`${payments.filter((p) => p.status === "pending").length} pagamentos`}
          icon={Clock}
          trend={{ value: 0, direction: "down" }}
          variant="warning"
        />
        <StatCard
          title="Taxa de Aprovação"
          value={`${stats.approvalRate}%`}
          description="Comprovativos aprovados"
          icon={TrendingUp}
          variant="default"
        />
      </div>

      <Card className="p-6 border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Procurar por nome, telefone ou ID de pagamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={fetchPayments}>
            Atualizar
          </Button>
        </div>
      </Card>

      <Card className="border border-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  ID / Provedor
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPayments.map((payment) => {
                const statusInfo = getStatusBadge(payment.status);
                return (
                  <tr key={payment.id} className="hover:bg-muted/20 transition-smooth group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-muted-foreground truncate w-24" title={payment.id}>
                          {payment.id}
                        </span>
                        <span className="text-xs font-bold text-primary uppercase">{payment.provider}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {payment.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{payment.userName}</p>
                          <p className="text-xs text-muted-foreground">{payment.userPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-foreground">{getPlanLabel(payment.plan)}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-foreground">
                        {payment.amount.toLocaleString()} Kz
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-muted-foreground">
                        {new Date(payment.date).toLocaleDateString("pt-PT")}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-center gap-2">
                        {payment.receipt && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(payment.receipt, "_blank")}
                            title="Ver comprovativo"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                            {payment.receipt && (
                              <DropdownMenuItem onClick={() => window.open(payment.receipt, "_blank")}>
                                <Download className="h-4 w-4 mr-2" />
                                Descarregar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-16 bg-muted/10">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum pagamento encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Tenta ajustar os teus termos de pesquisa.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
