import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Filter,
  MoreVertical,
  Phone,
  Calendar,
  Award,
  ChevronUp,
  ChevronDown,
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
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  analyses: number;
  plan: string;
  status: string;
}

const getPlanBadge = (plan: string) => {
  const plans: Record<string, { label: string; variant: "secondary" | "default" | "outline" | "destructive" }> = {
    free: { label: "Grátis", variant: "secondary" },
    monthly: { label: "Mensal", variant: "default" },
    annual: { label: "Anual", variant: "default" },
    essential: { label: "Individual", variant: "default" },
    evolution: { label: "Familiar", variant: "default" },
    personal_trainer: { label: "Profissional", variant: "default" },
  };
  return plans[plan] || { label: plan || "Grátis", variant: "secondary" };
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "joinDate" | "analyses">("joinDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Fetch subscriptions to get plans
      const { data: subs, error: subsError } = await supabase
        .from("user_subscriptions")
        .select("*");

      if (subsError) throw subsError;

      // Fetch meal analyses count
      const { data: analyses, error: analysesError } = await supabase
        .from("meal_analyses")
        .select("user_id");

      if (analysesError) throw analysesError;

      // Map data
      const mappedUsers: User[] = profiles.map((profile) => {
        const userSub = subs.find((s) => s.user_id === profile.id);
        const userAnalyses = analyses.filter((a) => a.user_id === profile.id).length;

        return {
          id: profile.id,
          name: profile.full_name || "Utilizador sem nome",
          email: profile.email || "Sem email",
          phone: profile.phone || "N/A",
          joinDate: profile.created_at,
          analyses: userAnalyses,
          plan: userSub?.plan || "free",
          status: userSub?.is_active ? "active" : "inactive",
        };
      });

      setUsers(mappedUsers);
    } catch (error: any) {
      console.error("Erro ao carregar utilizadores:", error);
      toast.error("Erro ao carregar utilizadores");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.phone || "").includes(searchTerm)
  );

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let compareA: any = a[sortBy];
    let compareB: any = b[sortBy];

    if (sortBy === "joinDate") {
      compareA = new Date(a.joinDate).getTime();
      compareB = new Date(b.joinDate).getTime();
    }

    if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
    if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (column: "name" | "joinDate" | "analyses") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
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
        <h1 className="text-4xl font-bold text-foreground mb-2">Utilizadores</h1>
        <p className="text-muted-foreground">Gestão de utilizadores registados</p>
      </div>

      <Card className="p-6 border border-border/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Procurar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={fetchUsers}>
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
                  Utilizador
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Contacto
                </th>
                <th
                  className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                  onClick={() => handleSort("joinDate")}
                >
                  <div className="flex items-center gap-1">
                    Registo
                    {sortBy === "joinDate" && (
                      sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider cursor-pointer hover:text-foreground transition-smooth"
                  onClick={() => handleSort("analyses")}
                >
                  <div className="flex items-center gap-1">
                    Atividade
                    {sortBy === "analyses" && (
                      sortOrder === "asc" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Plano
                </th>
                <th className="text-center py-4 px-6 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/20 transition-smooth group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {user.joinDate ? new Date(user.joinDate).toLocaleDateString("pt-PT") : "N/A"}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Award className="h-3 w-3 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{user.analyses}</span>
                      <span className="text-xs text-muted-foreground">análises</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant={getPlanBadge(user.plan).variant}>
                      {getPlanBadge(user.plan).label}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex justify-center">
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
                          <DropdownMenuLabel>Opções</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                          <DropdownMenuItem>Editar Plano</DropdownMenuItem>
                          <DropdownMenuItem>Enviar Mensagem</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedUsers.length === 0 && (
          <div className="text-center py-16 bg-muted/10">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-semibold text-foreground">Nenhum utilizador encontrado</h3>
            <p className="text-sm text-muted-foreground mt-1">Tenta ajustar os teus termos de pesquisa.</p>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          A mostrar <span className="font-semibold">{sortedUsers.length}</span> utilizadores
        </p>
      </div>
    </div>
  );
}
