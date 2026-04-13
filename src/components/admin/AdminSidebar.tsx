import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Bell,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingPayments?: number;
}

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  pendingPayments = 0,
}: AdminSidebarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const menuItems = [
    {
      id: "overview",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Visão geral executiva",
    },
    {
      id: "users",
      label: "Utilizadores",
      icon: Users,
      description: "Gestão avançada de contas",
    },
    {
      id: "payments",
      label: "Pagamentos",
      icon: CreditCard,
      description: "Gestão de transações",
      badge: pendingPayments > 0 ? pendingPayments : null,
    },
    {
      id: "analytics",
      label: "Análises",
      icon: BarChart3,
      description: "Estatísticas avançadas",
    },
    {
      id: "notifications",
      label: "Notificações",
      icon: Bell,
      description: "Enviar mensagens push",
    },
    {
      id: "audit",
      label: "Auditoria",
      icon: BarChart3,
      description: "Registo de ações",
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Sessão Encerrada",
        description: "Foste desconectado com sucesso.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleMenuItemClick = (id: string) => {
    onTabChange(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-card/50 backdrop-blur-sm border-border/50"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card/50 backdrop-blur-sm border-r border-border/50 z-40 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground text-lg">Admin</h2>
              <p className="text-xs text-muted-foreground">METAFIT Nutri</p>
            </div>
          </div>
          <Badge variant="outline" className="w-full justify-center text-xs bg-primary/5 text-primary border-primary/20">
            Painel Administrativo
          </Badge>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground border border-transparent"
                }`}
              >
                {/* Background animation on hover */}
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                    isActive ? "bg-primary/5" : "bg-primary/5"
                  }`}
                />

                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-medium text-sm">{item.label}</p>
                      <p className="text-xs opacity-70">{item.description}</p>
                    </div>
                  </div>

                  {item.badge && (
                    <Badge className="bg-orange-500 text-white text-xs h-5 w-5 flex items-center justify-center p-0 rounded-full animate-pulse">
                      {item.badge}
                    </Badge>
                  )}

                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-2 flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
          <p className="text-xs text-muted-foreground text-center pt-2">
            v1.0 • Painel Admin
          </p>
        </div>
      </aside>

      {/* Main Content Offset (Desktop) */}
      <div className="hidden md:block w-64" />
    </>
  );
};
