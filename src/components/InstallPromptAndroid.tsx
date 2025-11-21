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
    
    // Mostrar banner se: instalável, não iOS, não instalado, não foi dispensado há menos de 7 dias
    if (isInstallable && !isIOS && !isInstalled && daysSinceDismissed > 7) {
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
    <div className="fixed bottom-20 left-4 right-4 z-40 md:hidden animate-in slide-in-from-bottom">
      <div className="bg-card border border-border rounded-lg shadow-medium p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1">
              Instalar AngoNutri
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              Usar mais rápido como app? Instalar agora.
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                variant="default"
                size="sm"
                className="flex-1"
              >
                Instalar
              </Button>
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="text-muted-foreground hover:text-foreground transition-smooth p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptAndroid;
