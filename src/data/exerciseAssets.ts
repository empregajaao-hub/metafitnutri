// Mapa central de assets visuais de exercícios.
// Para adicionar um novo exercício:
//   1. Coloca o GIF em /public/animations/<id>.gif (ou .png/.mp4)
//   2. Adiciona a entrada aqui com várias variações do nome em pt-AO/pt-PT/EN
// O matcher é tolerante (lowercase + sem acentos + contém).

export type ExerciseAssetKind = "gif" | "image" | "video";

export interface ExerciseAsset {
  id: string;
  url: string;
  kind: ExerciseAssetKind;
  /** Variações do nome para fazer match (pt-AO, pt-PT, EN). */
  aliases: string[];
  /** Objetivos para os quais este exercício é especialmente recomendado. */
  goals?: Array<"lose" | "maintain" | "gain">;
}

export const exerciseAssets: ExerciseAsset[] = [
  {
    id: "agachamento",
    url: "/animations/agachamento.png",
    kind: "image",
    aliases: [
      "agachamento",
      "agachamentos",
      "agachamento livre",
      "agachamento sumô",
      "agachamento com barra",
      "squat",
      "squats",
      "squat jumps",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "flexao",
    url: "/animations/flexao.png",
    kind: "image",
    aliases: [
      "flexao",
      "flexão",
      "flexoes",
      "flexões",
      "flexões diamante",
      "flexões inclinadas",
      "push-up",
      "push up",
      "pushups",
    ],
    goals: ["maintain", "gain"],
  },
  // Vídeos legados (mantidos como fallback até chegarem os GIFs novos)
  {
    id: "prancha",
    url: "/animations/prancha.jpg",
    kind: "image",
    aliases: ["prancha", "plank", "prancha lateral", "prancha com rotação"],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "saltos",
    url: "/animations/jumping_jacks.mp4",
    kind: "video",
    aliases: ["saltos", "jumping jack", "jumping jacks", "polichinelo"],
    goals: ["lose", "maintain"],
  },
  {
    id: "supino",
    url: "/animations/supino.png",
    kind: "image",
    aliases: ["supino", "supino reto", "supino inclinado", "bench press"],
    goals: ["maintain", "gain"],
  },
  {
    id: "alongamento-pernas-duplo",
    url: "/animations/alongamento-pernas-duplo.png",
    kind: "image",
    aliases: [
      "alongamento de pernas duplo",
      "alongamento pernas duplo",
      "double leg stretch",
      "duplo alongamento de pernas",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "alongamento-gluteos-deitado",
    url: "/animations/alongamento-gluteos-deitado.png",
    kind: "image",
    aliases: [
      "alongamento de gluteos deitado",
      "alongamento glúteos deitado",
      "alongamento gluteos",
      "lying glute stretch",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "alongamento-circulos-punhos",
    url: "/animations/alongamento-circulos-punhos.png",
    kind: "image",
    aliases: [
      "alongamento em circulos nos punhos",
      "circulos nos punhos",
      "wrist circles",
      "rotação de punhos",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "alongamento-isquiotibiais-perna-cruzada",
    url: "/animations/alongamento-isquiotibiais-perna-cruzada.png",
    kind: "image",
    aliases: [
      "alongamento dos isquiotibiais em pe com a perna cruzada",
      "isquiotibiais perna cruzada",
      "standing crossed leg hamstring stretch",
      "alongamento isquiotibiais",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "alongamento-flexores-quadril-joelho",
    url: "/animations/alongamento-flexores-quadril-joelho.png",
    kind: "image",
    aliases: [
      "alongamento dos flexores do quadril em posicao de joelho",
      "flexores do quadril",
      "kneeling hip flexor stretch",
      "afundo alongamento",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "alongamento-tendao-aquiles",
    url: "/animations/alongamento-tendao-aquiles.png",
    kind: "image",
    aliases: [
      "alongamento do tendao de aquiles em pe",
      "tendao de aquiles",
      "achilles stretch",
      "alongamento panturrilha",
    ],
    goals: ["lose", "maintain", "gain"],
  },
  {
    id: "alongamento-peitoral-reverso",
    url: "/animations/alongamento-peitoral-reverso.png",
    kind: "image",
    aliases: [
      "alongamento do peitoral reverso",
      "peitoral reverso",
      "reverse chest stretch",
      "alongamento peitoral",
    ],
    goals: ["maintain", "gain"],
  },
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function findExerciseAsset(name: string): ExerciseAsset | undefined {
  if (!name) return undefined;
  const n = normalize(name);
  // Match exato primeiro, depois "contains" em qualquer direção.
  const exact = exerciseAssets.find((a) =>
    a.aliases.some((al) => normalize(al) === n),
  );
  if (exact) return exact;
  return exerciseAssets.find((a) =>
    a.aliases.some((al) => {
      const na = normalize(al);
      return n.includes(na) || na.includes(n);
    }),
  );
}

/**
 * Devolve uma ordem de prioridade para exercícios consoante o objetivo:
 *  - lose: cardio/HIIT/full-body primeiro
 *  - gain: força/compostos primeiro
 *  - maintain: equilibrado
 */
export function goalPriority(
  exerciseName: string,
  goal: "lose" | "maintain" | "gain" | null | undefined,
): number {
  if (!goal) return 0;
  const n = normalize(exerciseName);
  const cardio = /(cardio|jump|burpee|mountain|hiit|salto|polichinelo|caminh|elip|esteira)/.test(n);
  const strength = /(supino|agachamento|leg press|peso morto|deadlift|rosca|desenvolvimento|remada|barra)/.test(n);
  if (goal === "lose") return cardio ? 2 : strength ? 0 : 1;
  if (goal === "gain") return strength ? 2 : cardio ? 0 : 1;
  return 1;
}
