import { motion } from "framer-motion";

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  unit?: string;
  showValue?: boolean;
  gradient?: boolean;
  gradientId?: string;
}

const CircularProgress = ({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = "hsl(var(--primary))",
  trackColor = "hsl(var(--muted))",
  label,
  unit,
  showValue = true,
  gradient = false,
  gradientId = "progress-gradient",
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(value / max, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {gradient && (
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          )}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            opacity={0.3}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={gradient ? `url(#${gradientId})` : color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            strokeLinecap="round"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground leading-none">
              {value}
            </span>
            {unit && (
              <span className="text-[10px] text-muted-foreground mt-0.5">{unit}</span>
            )}
          </div>
        )}
      </div>
      {label && (
        <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
      )}
    </div>
  );
};

export default CircularProgress;
