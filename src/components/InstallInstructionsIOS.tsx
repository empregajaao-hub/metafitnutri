import { useState, useEffect } from "react";
import { X, Share, Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePWAInstall } from "@/hooks/usePWAInstall";

const InstallInstructionsIOS = () => {
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const { isIOS, isInstalled } = usePWAInstall();

  useEffect(() => {
    const dismissed = localStorage.getItem('ios-install-dismissed');
    const neverShow = localStorage.getItem('ios-install-never-show');
    
    if (isIOS && !isInstalled && !neverShow && !dismissed) {
      // Mostrar banner após 3 segundos
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isIOS, isInstalled]);

  const handleShowInstructions = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  const handleDismiss = () => {
    localStorage.setItem('ios-install-dismissed', 'true');
    setShowBanner(false);
  };

  const handleNeverShow = () => {
    localStorage.setItem('ios-install-never-show', 'true');
    setShowModal(false);
    setShowBanner(false);
  };

  if (!isIOS || isInstalled) return null;

  return (
    <>
      {/* Banner compacto */}
      {showBanner && (
        <div className="fixed top-20 left-4 right-4 z-40 animate-in slide-in-from-top">
          <div className="bg-card border border-border rounded-lg shadow-medium p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-primary-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground mb-1">
                  Adicionar ao ecrã principal
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Acessa o AngoNutri mais rápido como uma app.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleShowInstructions}
                    variant="default"
                    size="sm"
                    className="flex-1"
                  >
                    Ver como fazer
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
      )}

      {/* Modal com instruções */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Como instalar no iPhone</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2">
                  Toque no botão <strong>Partilhar</strong> <Share className="w-4 h-4 inline" /> no Safari
                </p>
                <p className="text-xs text-muted-foreground">
                  (Está na parte inferior ou superior do navegador)
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2">
                  Escolhe <strong>"Adicionar ao ecrã principal"</strong> <Plus className="w-4 h-4 inline" />
                </p>
                <p className="text-xs text-muted-foreground">
                  (Pode ser necessário deslocar para baixo na lista)
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2">
                  Confirma e pronto! <span className="text-xl">🎉</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  O AngoNutri vai aparecer no teu ecrã principal
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={() => setShowModal(false)} className="w-full">
              Entendi
            </Button>
            <Button onClick={handleNeverShow} variant="ghost" size="sm">
              Não mostrar novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallInstructionsIOS;
