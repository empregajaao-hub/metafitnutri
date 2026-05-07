import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSubscriptionGuard } from "@/hooks/useSubscriptionGuard";
import Subscription from "@/pages/Subscription";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { isExpired, isLoading, isLoggedIn } = useSubscriptionGuard();
  const location = useLocation();
  const navigate = useNavigate();

  // Lista de rotas públicas que não devem ser bloqueadas
  const publicPaths = [
    "/auth",
    "/subscription",
    "/support",
    "/support-en",
    "/privacy",
    "/about",
    "/install"
  ];

  const isPublicPath = publicPaths.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    // Se o utilizador estiver logado e expirado, e tentar aceder a uma rota protegida que não seja /subscription
    // Redirecionamos para /subscription
    if (!isLoading && isLoggedIn && isExpired && !isPublicPath && location.pathname !== "/subscription") {
      navigate("/subscription");
    }
  }, [isExpired, isLoading, isLoggedIn, isPublicPath, location.pathname, navigate]);

  // Enquanto carrega o estado da subscrição, mostramos um loading simples
  if (isLoading && !isPublicPath) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-primary/20 rounded-full" />
          <p className="text-sm text-muted-foreground">A verificar acesso...</p>
        </div>
      </div>
    );
  }

  // Se estiver expirado e não for uma rota pública, mostramos o ecrã de subscrição diretamente
  // Isso garante que mesmo que o useEffect demore, o conteúdo protegido não seja visível
  if (isLoggedIn && isExpired && !isPublicPath) {
    return <Subscription />;
  }

  return <>{children}</>;
};

export default SubscriptionGuard;
