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
  Calendar
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedReceipt, setSelectedReceipt] = useState<{ url: string; isPdf: boolean } | null>(null);
  const [receiptLoading, setReceiptLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      // Get payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("Pagamentos")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Get user details for each payment
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
      // Update payment status
      const { error: paymentError } = await supabase
        .from("Pagamentos")
        .update({ estado: "approved" })
        .eq("id", paymentId);

      if (paymentError) throw paymentError;

      // Activate subscription
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
        title: "Pagamento Aprovado",
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
    // createSignedUrl expects a *path inside the bucket*, not a public URL.
    // We normalize common formats that may exist in old data:
    // 1) full URL: https://<project>.supabase.co/storage/v1/object/.../receipts/<path>
    // 2) bucket prefixed: receipts/<path>
    // 3) already a path: <path>
    try {
      const trimmed = raw.trim();
      if (!trimmed) return trimmed;

      // Full URL cases
      if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
        const url = new URL(trimmed);
        const decodedPath = decodeURIComponent(url.pathname);

        // /storage/v1/object/public/receipts/<path>
        // /storage/v1/object/sign/receipts/<path>
        // /storage/v1/object/receipts/<path>
        const m = decodedPath.match(/\/storage\/v1\/object\/(?:public|sign)?\/?receipts\/(.+)$/);
        if (m?.[1]) return m[1];

        // Some older URLs may be like /storage/v1/object/public/<bucket>/<path>
        const m2 = decodedPath.match(/\/storage\/v1\/object\/(?:public|sign)?\/?([^/]+)\/(.+)$/);
        if (m2?.[1] === "receipts" && m2?.[2]) return m2[2];

        return trimmed;
      }

      // bucket-prefixed path
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
    return matchesSearch;
  });

  const approvedPayments = payments.filter((p) => p.estado === "approved");
  const totalApproved = approvedPayments.reduce((sum, p) => sum + Number(p.Valor || 0), 0);
  const totalPending = payments
    .filter((p) => p.estado === "pending")
    .reduce((sum, p) => sum + Number(p.Valor || 0), 0);
  const totalRejected = payments
    .filter((p) => p.estado === "rejected")
    .reduce((sum, p) => sum + Number(p.Valor || 0), 0);

  const byPlan = approvedPayments.reduce(
    (acc, p) => {
      const key = p.plano || "unknown";
      acc[key] = (acc[key] || 0) + Number(p.Valor || 0);
      return acc;
    },
    {} as Record<string, number>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getPlanLabel = (plan: string) => {
    switch (plan) {
      case "essential":
        return "Plano Essencial";
      case "evolution":
        return "Plano Evolução";
      case "personal_trainer":
        return "Personal Trainer";
      default:
        return plan;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-4">Gestão de Pagamentos</h2>

          {/* Relatório financeiro */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Ganhos (Aprovados)</p>
              <p className="text-2xl font-bold text-foreground">{totalApproved.toLocaleString()} Kz</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Em análise (Pendentes)</p>
              <p className="text-2xl font-bold text-foreground">{totalPending.toLocaleString()} Kz</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-sm text-muted-foreground">Rejeitados</p>
              <p className="text-2xl font-bold text-foreground">{totalRejected.toLocaleString()} Kz</p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background/40 p-4 mb-6">
            <p className="text-sm font-semibold text-foreground mb-2">Ganhos por plano (aprovados)</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-md bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Essencial</p>
                <p className="font-semibold text-foreground">{Number(byPlan.essential || 0).toLocaleString()} Kz</p>
              </div>
              <div className="rounded-md bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Evolução</p>
                <p className="font-semibold text-foreground">{Number(byPlan.evolution || 0).toLocaleString()} Kz</p>
              </div>
              <div className="rounded-md bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Personal Trainer</p>
                <p className="font-semibold text-foreground">{Number(byPlan.personal_trainer || 0).toLocaleString()} Kz</p>
              </div>
            </div>
          </div>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Procurar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-4 text-sm font-semibold">Utilizador</th>
                <th className="text-left py-4 px-4 text-sm font-semibold">Plano</th>
                <th className="text-left py-4 px-4 text-sm font-semibold">Valor</th>
                <th className="text-left py-4 px-4 text-sm font-semibold">Estado</th>
                <th className="text-left py-4 px-4 text-sm font-semibold">Data</th>
                <th className="text-center py-4 px-4 text-sm font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span className="font-medium">{payment.user_name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{payment.user_phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm">{getPlanLabel(payment.plano)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold">{payment.Valor?.toLocaleString()} Kz</span>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(payment.estado)}
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {new Date(payment.created_at).toLocaleDateString("pt-PT")}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2 justify-center">
                      {payment.receipt_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => viewReceipt(payment.receipt_url!)}
                          disabled={receiptLoading}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {payment.estado === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleApprove(payment.id, payment.user_id, payment.plano)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(payment.id)}
                          >
                            <XCircle className="w-4 h-4" />
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
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhum pagamento encontrado.</p>
          </div>
        )}
      </Card>

      {/* Receipt Preview Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Comprovativo de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedReceipt &&
              (selectedReceipt.isPdf ? (
                <iframe
                  title="Comprovativo (PDF)"
                  src={selectedReceipt.url}
                  className="w-full h-[70vh] rounded-lg border"
                />
              ) : (
                <img
                  src={selectedReceipt.url}
                  alt="Comprovativo"
                  className="w-full rounded-lg"
                />
              ))}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => window.open(selectedReceipt!.url, "_blank")}
            >
              <Download className="w-4 h-4 mr-2" />
              Descarregar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
