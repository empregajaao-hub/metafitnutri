import { useEffect } from "react";

const Install = () => {
  useEffect(() => {
    let deferredPrompt: any = null;

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.finally(() => {
          deferredPrompt = null;
        });
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // If event already fired before mount, try from global
    if ((window as any).__pwaInstallPrompt) {
      const evt = (window as any).__pwaInstallPrompt;
      evt.prompt();
      evt.userChoice.finally(() => {
        (window as any).__pwaInstallPrompt = null;
      });
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  return <div />;
};

export default Install;
