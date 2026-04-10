import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Previne o prompt padrão do browser
      e.preventDefault();
      // Guarda o evento para ser disparado mais tarde
      setDeferredPrompt(e);
      
      // Verifica se o utilizador já fechou o prompt nesta sessão
      const isDismissed = sessionStorage.getItem("pwaPromptDismissed");
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Se o evento já disparou antes do componente montar
    if ((window as any).__pwaInstallPrompt) {
      setDeferredPrompt((window as any).__pwaInstallPrompt);
      const isDismissed = sessionStorage.getItem("pwaPromptDismissed");
      if (!isDismissed) {
        setShowPrompt(true);
      }
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Mostra o prompt nativo
    deferredPrompt.prompt();

    // Espera pela escolha do utilizador
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);

    // Limpa o prompt guardado
    setDeferredPrompt(null);
    (window as any).__pwaInstallPrompt = null;
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guarda que o utilizador fechou o prompt nesta sessão para não ser chato
    sessionStorage.setItem("pwaPromptDismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-4 md:max-w-sm"
        >
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Instalar MetaFit</h3>
                  <p className="text-xs text-muted-foreground">
                    Instala o nosso app para uma melhor experiência e acesso rápido.
                  </p>
                </div>
              </div>
              <button 
                onClick={handleDismiss}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleInstall}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-2 h-auto text-sm font-semibold"
              >
                Instalar Agora
              </Button>
              <Button 
                variant="outline"
                onClick={handleDismiss}
                className="flex-1 rounded-xl py-2 h-auto text-sm"
              >
                Depois
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;
