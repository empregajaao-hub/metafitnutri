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
    const neverShow = localStorage.getItem('ios-install-never-show');
    
    if (!isIOS || isInstalled || neverShow) {
      setShowBanner(false);
      return;
    }

    // Mostrar banner após 10 segundos
    const initialTimer = setTimeout(() => {
      setShowBanner(true);
    }, 10000); // 10 segundos

    // Continuar mostrando a cada 30 segundos até instalar
    const interval = setInterval(() => {
      if (isIOS && !isInstalled && !neverShow) {
        setShowBanner(true);
      }
    }, 30000); // 30 segundos

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isIOS, isInstalled]);

  const handleShowInstructions = () => {
    setShowBanner(false);
    setShowModal(true);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Banner voltará a aparecer em 30 segundos automaticamente
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
        <div className="fixed top-4 left-4 right-4 z-40 animate-in slide-in-from-top duration-300">
          <div className="bg-gradient-primary rounded-lg shadow-elegant p-4 border-2 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary-foreground/20 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse">
                <Smartphone className="w-6 h-6 text-primary-foreground" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-primary-foreground mb-1 text-base">
                  Instalar AngoNutri
                </h3>
                <p className="text-sm text-primary-foreground/90 mb-3">
                  Acesso rápido direto do teu ecrã principal! 🚀
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleShowInstructions}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
                  >
                    Ver Instruções
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
      )}

      {/* Modal com instruções */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Como instalar no iPhone
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="text-sm text-muted-foreground text-center">
                Segue estes 3 passos simples para instalar o AngoNutri
              </p>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">1</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2 font-semibold">
                  Toque no botão <strong>Partilhar</strong> <Share className="w-4 h-4 inline text-primary" /> 
                </p>
                <p className="text-xs text-muted-foreground">
                  No Safari, o botão está na parte inferior ou superior do ecrã
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">2</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2 font-semibold">
                  Escolhe <strong>"Adicionar ao ecrã principal"</strong> <Plus className="w-4 h-4 inline text-primary" />
                </p>
                <p className="text-xs text-muted-foreground">
                  Pode ser necessário deslocar a lista para baixo para encontrar esta opção
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-bold text-lg">3</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground mb-2 font-semibold">
                  Confirma tocando em <strong>"Adicionar"</strong>
                </p>
                <p className="text-xs text-muted-foreground">
                  Pronto! 🎉 O AngoNutri vai aparecer no teu ecrã principal como uma app
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={() => setShowModal(false)} className="w-full" size="lg">
              Perfeito, entendi!
            </Button>
            <Button onClick={handleNeverShow} variant="ghost" size="sm" className="text-xs">
              Não mostrar novamente
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstallInstructionsIOS;
