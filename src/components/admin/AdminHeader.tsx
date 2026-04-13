import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  description?: string;
  lastUpdate?: string;
  alertCount?: number;
}

export const AdminHeader = ({
  title,
  description,
  lastUpdate,
  alertCount = 0,
}: AdminHeaderProps) => {
  return (
    <Card className="p-6 border-border/50 bg-gradient-to-r from-primary/5 via-card/50 to-card/50 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {alertCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="w-3 h-3" />
              {alertCount} alerta{alertCount !== 1 ? "s" : ""}
            </Badge>
          )}

          {lastUpdate && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
              <Clock className="w-3 h-3" />
              <span>Atualizado: {lastUpdate}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
