import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Início" },
    { path: "/about", label: "Sobre" },
    { path: "/support", label: "Suporte" },
  ];

  const userLinks = user
    ? [
        { path: "/upload", label: "Analisar" },
        { path: "/history", label: "Histórico" },
        { path: "/meal-plan", label: "Plano" },
        { path: "/workout", label: "Treinos" },
        { path: "/profile", label: "Perfil" },
      ]
    : [];

  const allLinks = [...navLinks, ...userLinks];

  return (
    <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-md"></div>
              <img 
                src={logo} 
                alt="METAFIT" 
                className="h-12 w-12 object-cover rounded-full border-2 border-primary/30 shadow-lg relative z-10 hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {allLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </button>
            ))}

            {user ? (
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Button variant="hero" size="sm" onClick={() => navigate("/auth")}>
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3">
            {allLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsOpen(false);
                }}
                className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </button>
            ))}

            {user ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            ) : (
              <Button
                variant="hero"
                className="w-full"
                onClick={() => {
                  navigate("/auth");
                  setIsOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Entrar
              </Button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;