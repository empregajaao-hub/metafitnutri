import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Target, AlertTriangle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ExerciseDetails {
  name: string;
  muscleGroup: string;
  illustration: {
    emoji: string;
    positions: string[];
  };
  startPosition: string[];
  execution: string[];
  commonMistakes: string[];
  tips: string[];
  breathing: string;
}

const exerciseDatabase: Record<string, ExerciseDetails> = {
  "agachamentos": {
    name: "Agachamentos",
    muscleGroup: "Pernas & Glúteos",
    illustration: {
      emoji: "🧍➡️🧎➡️🧍",
      positions: ["Em pé", "Descer", "Subir"],
    },
    startPosition: [
      "Pés à largura dos ombros",
      "Pontas dos pés ligeiramente viradas para fora",
      "Costas retas, peito aberto",
      "Olhar em frente",
    ],
    execution: [
      "Inspira e começa a descer como se fosses sentar numa cadeira",
      "Mantém os joelhos alinhados com os pés",
      "Desce até as coxas ficarem paralelas ao chão",
      "Mantém o peso nos calcanhares",
      "Expira e empurra o chão para subir",
    ],
    commonMistakes: [
      "Joelhos a ultrapassar as pontas dos pés em excesso",
      "Curvar as costas durante o movimento",
      "Levantar os calcanhares do chão",
      "Deixar os joelhos caírem para dentro",
    ],
    tips: [
      "Imagina que estás a sentar-te numa cadeira invisível",
      "Mantém o core contraído durante todo o movimento",
    ],
    breathing: "Inspira ao descer, expira ao subir",
  },
  "flexões": {
    name: "Flexões",
    muscleGroup: "Peito & Braços",
    illustration: {
      emoji: "🙆‍♂️➡️⬇️➡️🙆‍♂️",
      positions: ["Braços estendidos", "Descer", "Subir"],
    },
    startPosition: [
      "Mãos no chão, ligeiramente mais largas que os ombros",
      "Corpo em linha reta da cabeça aos pés",
      "Core contraído",
      "Braços estendidos",
    ],
    execution: [
      "Inspira e dobra os cotovelos para descer o corpo",
      "Mantém os cotovelos a 45° do corpo (não totalmente abertos)",
      "Desce até o peito quase tocar o chão",
      "Expira e empurra o chão para subir",
      "Mantém o corpo reto durante todo o movimento",
    ],
    commonMistakes: [
      "Deixar a anca cair ou subir em excesso",
      "Abrir os cotovelos a 90° (forma de T)",
      "Não descer o suficiente",
      "Mexer a cabeça para cima ou para baixo",
    ],
    tips: [
      "Começa com flexões nos joelhos se necessário",
      "Mantém o olhar no chão, ligeiramente à frente",
    ],
    breathing: "Inspira ao descer, expira ao subir",
  },
  "prancha": {
    name: "Prancha",
    muscleGroup: "Core & Abdómen",
    illustration: {
      emoji: "🧘‍♀️ (posição mantida)",
      positions: ["Posição isométrica"],
    },
    startPosition: [
      "Antebraços no chão, cotovelos sob os ombros",
      "Corpo em linha reta da cabeça aos calcanhares",
      "Pés à largura da anca",
      "Olhar para o chão",
    ],
    execution: [
      "Contrai o abdómen como se esperasses um soco na barriga",
      "Aperta os glúteos",
      "Empurra os cotovelos contra o chão",
      "Mantém a posição sem deixar a anca descer",
      "Respira normalmente durante o exercício",
    ],
    commonMistakes: [
      "Deixar a anca cair (costas arqueadas)",
      "Subir a anca demasiado (forma de triângulo)",
      "Prender a respiração",
      "Deixar a cabeça cair ou levantar",
    ],
    tips: [
      "Usa um espelho ou filma-te para verificar a postura",
      "Começa com 20 segundos e vai aumentando",
    ],
    breathing: "Respiração contínua e controlada",
  },
  "lunges": {
    name: "Lunges (Avanços)",
    muscleGroup: "Pernas & Equilíbrio",
    illustration: {
      emoji: "🧍➡️🏃➡️🧍",
      positions: ["Em pé", "Avanço", "Voltar"],
    },
    startPosition: [
      "Em pé, pés juntos",
      "Mãos na cintura ou ao lado do corpo",
      "Costas retas, olhar em frente",
    ],
    execution: [
      "Dá um passo largo à frente com uma perna",
      "Desce o corpo até o joelho de trás quase tocar o chão",
      "O joelho da frente deve ficar a 90°",
      "Empurra o chão com o pé da frente para voltar",
      "Alterna as pernas",
    ],
    commonMistakes: [
      "Joelho da frente a ultrapassar o pé",
      "Tronco inclinado para a frente",
      "Passo demasiado curto",
      "Perder o equilíbrio lateral",
    ],
    tips: [
      "Foca num ponto fixo à frente para manter equilíbrio",
      "O movimento é para baixo, não para a frente",
    ],
    breathing: "Inspira ao descer, expira ao subir",
  },
  "supino reto": {
    name: "Supino Reto",
    muscleGroup: "Peito",
    illustration: {
      emoji: "🏋️‍♂️ (deitado)",
      positions: ["Barra em cima", "Descer", "Subir"],
    },
    startPosition: [
      "Deitado no banco, pés bem apoiados no chão",
      "Olhos alinhados com a barra",
      "Pegada ligeiramente mais larga que os ombros",
      "Omoplatas juntas e pressionadas no banco",
    ],
    execution: [
      "Retira a barra do suporte com os braços estendidos",
      "Inspira e desce a barra até tocar levemente o peito",
      "Mantém os cotovelos a 45-75° do corpo",
      "Expira e empurra a barra para cima",
      "Não bloqueies os cotovelos completamente no topo",
    ],
    commonMistakes: [
      "Levantar a anca do banco",
      "Abrir os cotovelos a 90° (lesão no ombro)",
      "Não descer a barra até ao peito",
      "Fazer o movimento com impulsão",
    ],
    tips: [
      "Usa sempre um parceiro de treino para segurança",
      "Começa com pesos leves para dominar a técnica",
    ],
    breathing: "Inspira ao descer, expira ao empurrar",
  },
  "agachamento com barra": {
    name: "Agachamento com Barra",
    muscleGroup: "Pernas & Glúteos",
    illustration: {
      emoji: "🏋️➡️🧎➡️🏋️",
      positions: ["Em pé com barra", "Descer", "Subir"],
    },
    startPosition: [
      "Barra apoiada nos trapézios (não no pescoço!)",
      "Pés à largura dos ombros ou ligeiramente mais",
      "Pontas dos pés ligeiramente para fora",
      "Peito aberto, core contraído",
    ],
    execution: [
      "Inspira profundamente e contrai o core",
      "Inicia o movimento empurrando a anca para trás",
      "Desce controladamente mantendo as costas retas",
      "Desce até as coxas ficarem paralelas ou abaixo",
      "Expira e empurra o chão para subir",
    ],
    commonMistakes: [
      "Barra no pescoço em vez dos trapézios",
      "Costas arredondadas (muito perigoso!)",
      "Joelhos a cair para dentro",
      "Levantar os calcanhares",
    ],
    tips: [
      "Pratica primeiro sem peso para dominar a técnica",
      "Usa calçado com sola rígida e plana",
    ],
    breathing: "Inspira antes de descer, expira ao subir",
  },
  "remada curvada": {
    name: "Remada Curvada",
    muscleGroup: "Costas",
    illustration: {
      emoji: "🏋️‍♂️ (inclinado)",
      positions: ["Posição inicial", "Puxar", "Estender"],
    },
    startPosition: [
      "Pés à largura dos ombros",
      "Joelhos ligeiramente fletidos",
      "Inclina o tronco a 45-60° mantendo as costas retas",
      "Barra pendurada à frente com braços estendidos",
    ],
    execution: [
      "Puxa a barra em direção ao umbigo",
      "Lidera o movimento com os cotovelos",
      "Aperta as omoplatas no topo do movimento",
      "Desce a barra controladamente",
      "Mantém o tronco estável durante todo o exercício",
    ],
    commonMistakes: [
      "Usar o impulso do corpo para levantar o peso",
      "Arredondar as costas",
      "Puxar a barra para o peito em vez do umbigo",
      "Estender demasiado o tronco",
    ],
    tips: [
      "Imagina que estás a puxar com os cotovelos, não com as mãos",
      "Começa com peso leve para sentir os músculos das costas",
    ],
    breathing: "Inspira ao descer, expira ao puxar",
  },
  "desenvolvimento com halteres": {
    name: "Desenvolvimento com Halteres",
    muscleGroup: "Ombros",
    illustration: {
      emoji: "🏋️‍♀️ (sentado)",
      positions: ["Halteres ao nível dos ombros", "Empurrar", "Descer"],
    },
    startPosition: [
      "Sentado num banco com encosto ou em pé",
      "Halteres ao nível dos ombros, palmas viradas para a frente",
      "Cotovelos a 90°",
      "Core contraído, costas retas",
    ],
    execution: [
      "Expira e empurra os halteres para cima",
      "Estende os braços sem bloquear os cotovelos",
      "Os halteres podem aproximar-se ligeiramente no topo",
      "Inspira e desce controladamente até a posição inicial",
    ],
    commonMistakes: [
      "Arquear as costas",
      "Usar peso excessivo e comprometer a forma",
      "Bloquear os cotovelos no topo",
      "Deixar os halteres descer demasiado",
    ],
    tips: [
      "Mantém os pulsos retos durante todo o movimento",
      "Não deixes os cotovelos descerem abaixo da linha dos ombros",
    ],
    breathing: "Expira ao empurrar, inspira ao descer",
  },
};

interface ExerciseGuideProps {
  exerciseName: string;
}

const ExerciseGuide = ({ exerciseName }: ExerciseGuideProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const normalizedName = exerciseName.toLowerCase();
  const exercise = exerciseDatabase[normalizedName];
  
  if (!exercise) {
    return null;
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground gap-2"
        >
          <Target className="w-3 h-3" />
          {isOpen ? "Ocultar guia de execução" : "Ver como executar correctamente"}
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="mt-4 space-y-4 animate-fade-in">
        {/* Ilustração Visual */}
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-4 text-center">
          <div className="text-4xl mb-2">{exercise.illustration.emoji}</div>
          <div className="flex justify-center gap-2 text-xs text-muted-foreground">
            {exercise.illustration.positions.map((pos, i) => (
              <span key={i} className="px-2 py-1 bg-background rounded-full">
                {i + 1}. {pos}
              </span>
            ))}
          </div>
        </div>

        {/* Posição Inicial */}
        <Card className="p-4 border-green-500/30 bg-green-500/5">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <span className="text-green-500 text-xs">1</span>
            </span>
            Posição Inicial
          </h4>
          <ul className="space-y-2">
            {exercise.startPosition.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Execução */}
        <Card className="p-4 border-blue-500/30 bg-blue-500/5">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-blue-500 text-xs">2</span>
            </span>
            Execução do Movimento
          </h4>
          <ol className="space-y-2">
            {exercise.execution.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <p className="text-xs text-blue-500 font-medium flex items-center gap-2">
              🌬️ Respiração: {exercise.breathing}
            </p>
          </div>
        </Card>

        {/* Erros Comuns */}
        <Card className="p-4 border-red-500/30 bg-red-500/5">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Erros a Evitar
          </h4>
          <ul className="space-y-2">
            {exercise.commonMistakes.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <XCircle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Dicas */}
        <Card className="p-4 border-amber-500/30 bg-amber-500/5">
          <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            💡 Dicas do Treinador
          </h4>
          <ul className="space-y-2">
            {exercise.tips.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                <span className="text-amber-500">•</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ExerciseGuide;
