import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  variant?: "default" | "success" | "warning" | "error";
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) => {
  const variantStyles = {
    default: "bg-background border-border/50",
    success: "bg-success/5 border-success/20",
    warning: "bg-warning/5 border-warning/20",
    error: "bg-destructive/5 border-destructive/20",
  };

  const iconColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-destructive",
  };

  const trendColors = {
    up: "text-success",
    down: "text-destructive",
  };

  return (
    <Card className={`p-6 border transition-smooth hover:shadow-elevated ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-muted/50">
          <Icon className={`h-6 w-6 ${iconColors[variant]}`} />
        </div>
        {trend && (
          <div className={`text-xs font-semibold ${trendColors[trend.direction]}`}>
            {trend.direction === "up" ? "↑" : "↓"} {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">{value}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </Card>
  );
};
