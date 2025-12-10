import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Mail, Calendar, Award, Trash2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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

interface User {
  id: string;
  full_name: string | null;
  email?: string;
  phone?: string | null;
  created_at: string;
  plan: string;
  is_active: boolean;
  total_analyses: number;
}

interface AdminUsersProps {
  users: User[];
  onRefresh: () => void;
}

export const AdminUsers = ({ users, onRefresh }: AdminUsersProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const { toast } = useToast();

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const handleChangePlan = async (userId: string, newPlan: "free" | "monthly" | "annual") => {
    try {
      const endDate = new Date();
      if (newPlan === "monthly") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (newPlan === "annual") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      }

      const { error } = await supabase
        .from("user_subscriptions")
        .update({
          plan: newPlan,
          is_active: newPlan !== "free",
          start_date: new Date().toISOString(),
          end_date: newPlan !== "free" ? endDate.toISOString() : null,
        })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Plano Atualizado",
        description: "O plano do utilizador foi alterado com sucesso.",
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      // Delete user data (RLS policies will handle cascading deletes)
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Utilizador Removido",
        description: `${userName} foi removido com sucesso.`,
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Gestão de Utilizadores</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Procurar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={filterPlan === "all" ? "default" : "outline"}
              onClick={() => setFilterPlan("all")}
            >
              Todos
            </Button>
            <Button
              variant={filterPlan === "free" ? "default" : "outline"}
              onClick={() => setFilterPlan("free")}
            >
              Grátis
            </Button>
            <Button
              variant={filterPlan === "monthly" ? "default" : "outline"}
              onClick={() => setFilterPlan("monthly")}
            >
              Mensal
            </Button>
            <Button
              variant={filterPlan === "annual" ? "default" : "outline"}
              onClick={() => setFilterPlan("annual")}
            >
              Anual
            </Button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Utilizador
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Plano Atual
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Análises
              </th>
              <th className="text-left py-4 px-4 text-sm font-semibold text-foreground">
                Registo
              </th>
              <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="py-4 px-4">
                  <div>
                    <p className="text-foreground font-medium">{user.full_name || "N/A"}</p>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{user.phone || "N/A"}</span>
                    </div>
                    {user.email && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant={user.plan === "free" ? "secondary" : "default"}>
                    {user.plan === "free" ? "Grátis" : user.plan === "monthly" ? "Mensal" : "Anual"}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="font-semibold">{user.total_analyses}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-muted-foreground">
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    {new Date(user.created_at).toLocaleDateString("pt-PT")}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2 justify-center items-center">
                    <select
                      className="text-sm border border-border rounded px-2 py-1 bg-background"
                      value={user.plan}
                      onChange={(e) => handleChangePlan(user.id, e.target.value as any)}
                    >
                      <option value="free">Grátis</option>
                      <option value="monthly">Mensal</option>
                      <option value="annual">Anual</option>
                    </select>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Tens a certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isto irá permanentemente remover
                            o utilizador <strong>{user.full_name || "N/A"}</strong> e todos os seus dados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.id, user.full_name || "Utilizador")}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum utilizador encontrado.</p>
        </div>
      )}
    </Card>
  );
};
