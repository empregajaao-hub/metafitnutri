import { useState } from "react";
import { Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Bell,
  ChefHat,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  currentTab?: string;
  onLogout?: () => void;
}

export const Sidebar = ({ currentTab = "dashboard", onLogout }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "#dashboard" },
    { id: "users", label: "Utilizadores", icon: Users, href: "#users" },
    { id: "payments", label: "Pagamentos", icon: CreditCard, href: "#payments" },
    { id: "recipes", label: "Receitas", icon: ChefHat, href: "#recipes" },
    { id: "analytics", label: "Análises", icon: BarChart3, href: "#analytics" },
    { id: "notifications", label: "Notificações", icon: Bell, href: "#notifications" },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border transition-smooth flex flex-col ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-sidebar-foreground">MetaFitNutri</h1>
              <p className="text-xs text-sidebar-foreground/60">Admin Pro</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <Link key={item.id} href={item.href}>
              <a
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </a>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <Link href="#settings">
          <a className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-smooth">
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Definições</span>}
          </a>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-4 py-3 h-auto text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>
      </div>
    </aside>
  );
};
