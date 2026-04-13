import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Phone,
  User,
  Calendar,
  TrendingUp,
  Filter,
  MoreVertical,
  FileText,
  DollarSign,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Payment {
  id: string;
  user_id: string;
  plano: string;
  Valor: number;
  estado: string;
  receipt_url: string | null;
  created_at: string;
  user_name?: string;
  user_phone?: string;
}

interface AdminPaymentsAdvancedProps {
  onRefresh: () => void;
}

export const AdminPaymentsAdvanced = ({
  onRefresh,
}: AdminPaymentsAdvancedProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState<{
    url: string;
    isPdf: boolean;
  } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("Pagamentos")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      const userIds = [...new Set(paymentsData?.map((p) => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select('id, "Nome Completo", phone')
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      const paymentsWithUsers = paymentsData?.map((payment) => ({
        ...payment,
        user_name:
          profilesMap.get(payment.user_id)?.["Nome Completo"] || "N/A",
        user_phone: profilesMap.get(payment.user_id)?.phone || "N/A",
      })) || [];

      setPayments(paymentsWithUsers);

      // Generate chart data
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("pt-PT", {
          month: "short",
          day: "numeric",
        });

        const dayPayments = paymentsWithUsers.filter(
          (p) =>
            new Date(p.created_at).toLocaleDateString("pt-PT", {
              month: "short",
              day: "numeric",
            }) === dateStr && p.estado === "approved"
        );

        last7Days.push({
          date: dateStr,
          total: dayPayments.reduce((sum, p) => sum + Number(p.Valor || 0), 0),
          count: dayPayments.length,
        });
      }
      setChartData(last7Days);
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

  const handleApprove = async (paymentId: string, userId: string, plano: string) => {
    try {
      const { error: paymentError } = await supabase
        .from("Pagamentos")
        .update({ estado: "approved" })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const { error: subError } = await supabase
        .from("user_subscriptions")
        .update({
          plan: plano as any,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_active: true,
        })
        .eq("user_id", userId);

      if (subError) throw subError;

      toast({
        title: "Pagamento Aprovado ✅",
        description: "A subscrição foi activada com sucesso!",
      });

      loadPayments();
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      const { error } = await supabase
        .from("Pagamentos")
        .update({ estado: "rejected" })
        .eq("id", paymentId);

      if (error) throw error;

      toast({
        title: "Pagamento Rejeitado",
        description: "O pagamento foi marcado como rejeitado.",
      });

      loadPayments();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const normalizeReceiptPath = (raw: string) => {
    try {
      const trimmed = raw.trim();
      if (!trimmed) return trimmed;

      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        const decodedPath = decodeURIComponent(url.pathname);
        const m = decodedPath.match(/\/storage\/v1\/object\/(?:public|sign)?\/?receipts\/(.+)$/);
        if (m?.[1]) return m[1];
        const m2 = decodedPath.match(
          /\/storage\/v1\/object\/(?:public|sign)?\/?([^/]+)\/(.+)$/
        );
        if (m2?.[1] === "receipts" && m2?.[2]) return m2[2];
        return trimmed;
      }

      if (trimmed.startsWith("receipts/")) return trimmed.slice("receipts/".length);
      return trimmed;
    } catch {
      return raw;
    }
  };

  const viewReceipt = async (receiptUrl: string) => {
    try {
      setReceiptLoading(true);
      const objectPath = normalizeReceiptPath(receiptUrl);
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(objectPath, 3600);

      if (!data?.signedUrl) {
        throw new Error("signed_url_missing");
      }

      const isPdf = objectPath.toLowerCase().endsWith(".pdf");
      setSelectedReceipt({ url: data.signedUrl, isPdf });
    } catch (error: any) {
      toast({
        title: "Erro",
        description:
          error?.message === "signed_url_missing"
            ? "Não foi possível gerar link do comprovativo. Verifica se o ficheiro existe no Storage."
            : "Não foi possível carregar o comprovativo.",
        variant: "destructive",
      });
    } finally {
      setReceiptLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_phone?.includes(searchTerm);
    const matchesStatus =
      filterStatus === "all" || payment.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const approvedPayments = payments.filter((p) => p.estado === "approved");
  const totalApproved = approvedPayments.reduce(
    (sum, p) => sum + Number(p.Valor || 0),
    0
  );
  const totalPending = payments
    .filter((p) => p.estado === "pending")
    .reduce((sum, p) => sum + Number(p.Valor || 0), 0);
  const pendingCount = payments.filter((p) => p.estado === "pending").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 border-0 gap-1">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="border-0 gap-1">
            <XCircle className="w-3 h-3" />
            Rejeitado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1">
            <Clock className="w-3 h-3" />
            Pendente
          </Badge>
        );
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "essential":
        return "Individual";
      case "evolution":
        return "Familiar";
      case "personal_trainer":
        return "Profissional";
      default:
        return plan;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 border-border/50 bg-gradient-to-br from-green-500/5 to-card/50 backdrop-blur-sm border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Ganhos Aprovados</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalApproved.toLocaleString()} Kz
          </p>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-green-600 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+12% este mês</span>
          </div>
        </Card>

        <Card className="p-5 border-border/50 bg-gradient-to-br from-orange-500/5 to-card/50 backdrop-blur-sm border-orange-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Em Análise</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalPending.toLocaleString()} Kz
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            {pendingCount} pagamento{pendingCount !== 1 ? "s" : ""} aguardando
          </p>
        </Card>

        <Card className="p-5 border-border/50 bg-gradient-to-br from-primary/5 to-card/50 backdrop-blur-sm border-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-primary">Taxa de Aprovação</p>
          </div>
          <p className="text-2xl font-bold text-primary">
            {payments.length > 0
              ? ((approvedPayments.length / payments.length) * 100).toFixed(1)
              : 0}
            %
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">
            {approvedPayments.length} de {payments.length} pagamentos
          </p>
        </Card>

        <Card className="p-5 border-border/50 bg-gradient-to-br from-blue-500/5 to-card/50 backdrop-blur-sm border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Total Transações</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{payments.length}</p>
          <p className="text-[10px] text-muted-foreground mt-2">
            Todas as transações
          </p>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Receita nos Últimos 7 Dias
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Evolução diária de pagamentos aprovados</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
            />
            <Legend />
            <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} name="Receita (Kz)" />
            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Quantidade" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Payments Table */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Gestão de Pagamentos</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total de <span className="font-bold text-foreground">{payments.length}</span> transações.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar Relatório
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Procurar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-48 bg-background/50 border-border/50">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Estados</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="rejected">Rejeitados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Utilizador
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Valor
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Data
                </th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-center py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {payment.user_name
                          ? payment.user_name.charAt(0).toUpperCase()
                          : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-foreground font-semibold text-sm">
                          {payment.user_name}
                        </p>
                        {payment.user_phone && (
                          <p className="text-xs text-muted-foreground">
                            {payment.user_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline">
                      {getPlanLabel(payment.plano)}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-foreground font-bold">
                      {Number(payment.Valor).toLocaleString()} Kz
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString("pt-PT")}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(payment.estado)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {payment.receipt_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewReceipt(payment.receipt_url!)}
                          disabled={receiptLoading}
                          className="gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </Button>
                      )}
                      {payment.estado === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleApprove(
                                payment.id,
                                payment.user_id,
                                payment.plano
                              )
                            }
                            className="gap-1 text-green-600 border-green-500/20 hover:bg-green-500/10"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Aprovar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(payment.id)}
                            className="gap-1 text-red-600 border-red-500/20 hover:bg-red-500/10"
                          >
                            <XCircle className="w-4 h-4" />
                            Rejeitar
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-16 bg-muted/10 rounded-lg border border-dashed border-border mt-4">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">
              Nenhum pagamento encontrado
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tenta ajustar os teus filtros.
            </p>
          </div>
        )}
      </Card>

      {/* Receipt Viewer Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Visualizar Comprovativo</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="w-full h-96 bg-muted rounded-lg overflow-hidden">
              {selectedReceipt.isPdf ? (
                <iframe
                  src={selectedReceipt.url}
                  className="w-full h-full"
                  title="PDF Receipt"
                />
              ) : (
                <img
                  src={selectedReceipt.url}
                  alt="Receipt"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
