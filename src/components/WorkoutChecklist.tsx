import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RotateCcw, Target } from "lucide-react";

type GoalType = "lose" | "maintain" | "gain" | null;

type ChecklistItem = {
  id: string;
  label: string;
};

function getTodayKey() {
  const d = new Date();
  // local date key (no timezone surprises)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getChecklist(goal: GoalType): ChecklistItem[] {
  switch (goal) {
    case "lose":
      return [
        { id: "water", label: "Beber água (mín. 2L)" },
        { id: "cardio", label: "Fazer cardio/caminhada (20-30 min)" },
        { id: "protein", label: "Bater a proteína do dia" },
        { id: "sugar", label: "Evitar bebidas açucaradas" },
        { id: "sleep", label: "Dormir 7-8 horas" },
      ];
    case "gain":
      return [
        { id: "protein", label: "Bater a proteína do dia" },
        { id: "strength", label: "Treino de força (com carga progressiva)" },
        { id: "meals", label: "Fazer 4-6 refeições (sem pular)" },
        { id: "water", label: "Beber água (mín. 2L)" },
        { id: "sleep", label: "Dormir 7-8 horas" },
      ];
    case "maintain":
    default:
      return [
        { id: "water", label: "Beber água (mín. 2L)" },
        { id: "steps", label: "Caminhar/atividade leve (mín. 6.000 passos)" },
        { id: "workout", label: "Fazer o treino do dia" },
        { id: "balanced", label: "Refeições equilibradas (legumes + proteína)" },
        { id: "sleep", label: "Dormir 7-8 horas" },
      ];
  }
}

export default function WorkoutChecklist({ goal }: { goal: GoalType }) {
  const items = useMemo(() => getChecklist(goal), [goal]);
  const storageKey = useMemo(() => `metafit:workout-checklist:${getTodayKey()}:${goal || "unknown"}`, [goal]);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
      else setChecked({});
    } catch {
      setChecked({});
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(checked));
    } catch {
      // ignore
    }
  }, [checked, storageKey]);

  const doneCount = items.reduce((acc, it) => acc + (checked[it.id] ? 1 : 0), 0);
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Checklist de Metas (Hoje)</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Conclui estas metas para acelerar o teu objetivo.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setChecked({})}
          className="shrink-0"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium text-foreground">{doneCount}/{items.length}</span>
        </div>
        <Progress value={pct} className="mt-2" />
      </div>

      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <label key={it.id} className="flex items-start gap-3 cursor-pointer">
            <Checkbox
              checked={!!checked[it.id]}
              onCheckedChange={(v) => setChecked((prev) => ({ ...prev, [it.id]: Boolean(v) }))}
              className="mt-0.5"
            />
            <span className="text-sm text-foreground leading-5">{it.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
