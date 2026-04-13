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
  AlertCircle
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

interface AdminPaymentsProps {
  onRefresh: () => void;
}

export const AdminPayments = ({ onRefresh }: AdminPaymentsProps) => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; isPdf: boolean } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [loading, setLoading] = useState(true);
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

      const userIds = [...new Set(paymentsData?.map(p => p.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select('id, "Nome Completo", phone')
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);

      const paymentsWithUsers = paymentsData?.map(payment => ({
        ...payment,
        user_name: profilesMap.get(payment.user_id)?.["Nome Completo"] || "N/A",
        user_phone: profilesMap.get(payment.user_id)?.phone || "N/A",
      })) || [];

      setPayments(paymentsWithUsers);
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
        const m2 = decodedPath.match(/\/storage\/v1\/object\/(?:public|sign)?\/?([^/]+)\/(.+)$/);
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

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user_phone?.includes(searchTerm);
    const matchesStatus = filterStatus === "all" || payment.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const approvedPayments = payments.filter((p) => p.estado === "approved");
  const totalApproved = approvedPayments.reduce((sum, p) => sum + Number(p.Valor || 0), 0);
  const totalPending = payments
    .filter((p) => p.estado === "pending")
    .reduce((sum, p) => sum + Number(p.Valor || 0), 0);
  const pendingCount = payments.filter(p => p.estado === "pending").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500 hover:bg-green-600 border-0 gap-1"><CheckCircle className="w-3 h-3" />Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="border-0 gap-1"><XCircle className="w-3 h-3" />Rejeitado</Badge>;
      default:
        return <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20 gap-1"><Clock className="w-3 h-3" />Pendente</Badge>;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border-border/50 bg-gradient-to-br from-green-500/5 to-card/50 backdrop-blur-sm border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Ganhos Aprovados</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalApproved.toLocaleString()} Kz</p>
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
          <p className="text-2xl font-bold text-foreground">{totalPending.toLocaleString()} Kz</p>
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
            {payments.length > 0 ? ((approvedPayments.length / payments.length) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-[10px] text-muted-foreground mt-2">De todos os comprovativos</p>
        </Card>
      </div>

      {/* Main Payments Table */}
      <Card className="p-6 border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Gestão de Pagamentos
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Valide os comprovativos de transferência bancária.
            </p>
          </div>
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

        {pendingCount > 0 && (
          <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-orange-900">Atenção!</p>
              <p className="text-xs text-orange-800">Tens <span className="font-bold">{pendingCount}</span> pagamento{pendingCount !== 1 ? "s" : ""} pendente{pendingCount !== 1 ? "s" : ""} de revisão.</p>
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-border/50">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border/50">
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Utilizador</th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Plano / Valor</th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="text-left py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Estado</th>
                <th className="text-center py-4 px-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                        {payment.user_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{payment.user_name}</p>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{payment.user_phone}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-sm font-bold text-foreground">{getPlanLabel(payment.plano)}</p>
                      <p className="text-xs text-primary font-medium">{Number(payment.Valor).toLocaleString()} Kz</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(payment.created_at).toLocaleDateString("pt-PT")}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(payment.estado)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center items-center">
                      {payment.receipt_url ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs gap-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
                          onClick={() => viewReceipt(payment.receipt_url!)}
                          disabled={receiptLoading}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Sem anexo</span>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Gerir Pagamento</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {payment.estado !== "approved" && (
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-green-600 focus:text-green-600 focus:bg-green-50 cursor-pointer"
                              onClick={() => handleApprove(payment.id, payment.user_id, payment.plano)}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Aprovar e Ativar
                            </DropdownMenuItem>
                          )}
                          {payment.estado !== "rejected" && (
                            <DropdownMenuItem 
                              className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/5 cursor-pointer"
                              onClick={() => handleReject(payment.id)}
                            >
                              <XCircle className="w-4 h-4" />
                              Rejeitar Pagamento
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                            <Download className="w-4 h-4" />
                            Baixar Comprovativo
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
          </div>
        )}
      </Card>

      {/* Receipt Modal */}
      <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>Comprovativo de Pagamento</span>
              <Button variant="ghost" size="sm" onClick={() => window.open(selectedReceipt?.url, '_blank')}>
                <Download className="w-4 h-4 mr-2" />
                Abrir Original
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-muted/20 p-4 flex items-center justify-center overflow-auto">
            {selectedReceipt?.isPdf ? (
              <iframe src={selectedReceipt.url} className="w-full h-full rounded-lg border shadow-sm" title="PDF Receipt" />
            ) : (
              <img src={selectedReceipt?.url} alt="Receipt" className="max-w-full max-h-full object-contain rounded-lg shadow-md" />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
