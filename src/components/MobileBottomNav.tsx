import { Home, ChefHat, User, Users, Camera } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const leftItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: ChefHat, label: "Receitas", path: "/angolan-recipes" },
  ];

  const rightItems = [
    { icon: Users, label: "Social", path: "/social" },
    { icon: User, label: "Perfil", path: "/profile" },
  ];

  const NavButton = ({ icon: Icon, label, path }: { icon: any; label: string; path: string }) => {
    const isActive = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={cn(
          "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors",
          "min-w-[44px]",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
      >
        <Icon className={cn("w-5 h-5", isActive && "scale-110")} />
        <span className="text-[10px]">{label}</span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden">
      <div className="flex justify-around items-center h-14 px-1 relative">
        {/* Left items */}
        {leftItems.map((item) => (
          <NavButton key={item.path} {...item} />
        ))}

        {/* Center Camera FAB */}
        <div className="flex-1 flex items-center justify-center">
          <button
            onClick={() => navigate("/upload")}
            className={cn(
              "absolute -top-5 w-14 h-14 rounded-full flex items-center justify-center",
              "bg-primary shadow-glow border-4 border-background",
              "active:scale-95 transition-transform"
            )}
          >
            <Camera className="w-6 h-6 text-primary-foreground" />
          </button>
          <span className="text-[10px] text-primary font-medium mt-5">Analisar</span>
        </div>

        {/* Right items */}
        {rightItems.map((item) => (
          <NavButton key={item.path} {...item} />
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
