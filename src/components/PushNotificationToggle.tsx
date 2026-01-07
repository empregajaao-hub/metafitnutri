import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface PushNotificationToggleProps {
  compact?: boolean;
}

const PushNotificationToggle = ({ compact = false }: PushNotificationToggleProps) => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return null;
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">Notificações Push</p>
            <p className="text-xs text-muted-foreground">
              {isSubscribed ? "Ativadas" : "Desativadas"}
            </p>
          </div>
        </div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={handleToggle}
          disabled={isLoading}
        />
      </div>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full ${isSubscribed ? 'bg-primary/20' : 'bg-muted'}`}>
          {isLoading ? (
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          ) : isSubscribed ? (
            <Bell className="w-6 h-6 text-primary" />
          ) : (
            <BellOff className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Lembretes de Refeições
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            {isSubscribed 
              ? "Vais receber lembretes para registar as tuas refeições, beber água e manter a tua rotina de fitness."
              : "Ativa as notificações para receber lembretes personalizados baseados no teu objetivo."}
          </p>
          <Button
            variant={isSubscribed ? "outline" : "default"}
            size="sm"
            onClick={handleToggle}
            disabled={isLoading}
            className={isSubscribed ? "" : "bg-gradient-primary hover:opacity-90"}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A processar...
              </>
            ) : isSubscribed ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Desativar Notificações
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Ativar Notificações
              </>
            )}
          </Button>
          {permission === 'denied' && (
            <p className="text-xs text-destructive mt-2">
              As notificações foram bloqueadas. Precisas permitir nas configurações do navegador.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PushNotificationToggle;
