import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useToast } from "@/hooks/use-toast";

const InstallPromptAndroid = () => {
  const [showBanner, setShowBanner] = useState(false);
  const { isInstallable, isIOS, isInstalled, installPWA } = usePWAInstall();
  const { toast } = useToast();

  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
    
    // Mostrar banner se: instalável, não iOS, não instalado, não foi dispensado há menos de 2 dias
    if (isInstallable && !isIOS && !isInstalled && daysSinceDismissed > 2) {
      // Mostrar imediatamente
      setShowBanner(true);
    }
  }, [isInstallable, isIOS, isInstalled]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast({
        title: "App instalada com sucesso!",
        description: "O AngoNutri foi adicionado ao teu ecrã principal.",
      });
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-primary rounded-lg shadow-elegant p-4 border-2 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
            <Download className="w-6 h-6 text-primary-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-primary-foreground mb-1 text-base">
              Instalar AngoNutri
            </h3>
            <p className="text-sm text-primary-foreground/90 mb-3">
              Acesso rápido, offline e sem ocupar espaço! 🚀
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                variant="outline"
                size="sm"
                className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
              >
                Instalar Agora
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                Mais tarde
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-primary-foreground/70 hover:text-primary-foreground transition-smooth p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptAndroid;
