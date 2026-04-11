import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Lightbulb, Volume2, VolumeX, Zap } from 'lucide-react';

interface CoachTip {
  id: string;
  title_ptAO: string;
  description_ptAO: string;
  category: 'form' | 'breathing' | 'motivation' | 'safety';
  severity: 'info' | 'warning' | 'success';
}

interface PersonalTrainerModeProps {
  exerciseName: string;
  isActive: boolean;
  onTipReceived?: (tip: CoachTip) => void;
}

const coachTips: CoachTip[] = [
  {
    id: 'form-1',
    title_ptAO: 'Postura Correta',
    description_ptAO: 'Mantém as costas direitas e o core contraído durante todo o movimento.',
    category: 'form',
    severity: 'warning',
  },
  {
    id: 'breathing-1',
    title_ptAO: 'Técnica de Respiração',
    description_ptAO: 'Inspira na fase de descida e expira na fase de subida. Nunca prenda a respiração.',
    category: 'breathing',
    severity: 'info',
  },
  {
    id: 'motivation-1',
    title_ptAO: 'Força, Estás a Fazer Bem!',
    description_ptAO: 'Já completaste 50% do treino. Continua com essa energia!',
    category: 'motivation',
    severity: 'success',
  },
  {
    id: 'safety-1',
    title_ptAO: 'Segurança em Primeiro',
    description_ptAO: 'Não aceleres o movimento. Controla a velocidade para evitar lesões.',
    category: 'safety',
    severity: 'warning',
  },
  {
    id: 'form-2',
    title_ptAO: 'Amplitude de Movimento',
    description_ptAO: 'Vai até ao fim do movimento. Não faças movimentos incompletos.',
    category: 'form',
    severity: 'info',
  },
];

const PersonalTrainerMode: React.FC<PersonalTrainerModeProps> = ({
  exerciseName,
  isActive,
  onTipReceived,
}) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [displayedTips, setDisplayedTips] = useState<CoachTip[]>([]);

  useEffect(() => {
    if (!isActive) return;

    // Rotate tips every 10 seconds
    const interval = setInterval(() => {
      const randomTip = coachTips[Math.floor(Math.random() * coachTips.length)];
      setDisplayedTips((prev) => {
        const updated = [randomTip, ...prev.slice(0, 2)];
        return updated;
      });
      onTipReceived?.(randomTip);
    }, 10000);

    return () => clearInterval(interval);
  }, [isActive, onTipReceived]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'form':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'breathing':
        return 'bg-cyan-500/20 text-cyan-700 border-cyan-500/30';
      case 'motivation':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'safety':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'success':
        return <Zap className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  if (!isActive || displayedTips.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-20 px-4 pointer-events-none z-40">
      <div className="max-w-2xl mx-auto space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {displayedTips.map((tip, idx) => (
          <Card
            key={`${tip.id}-${idx}`}
            className={`p-3 border-l-4 bg-background/95 backdrop-blur-sm pointer-events-auto transition-all ${
              idx === 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-60'
            } ${getCategoryColor(tip.category)}`}
            style={{
              borderLeftColor: tip.severity === 'warning' ? '#ef4444' : '#3b82f6',
            }}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getSeverityIcon(tip.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{tip.title_ptAO}</p>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {tip.category}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {tip.description_ptAO}
                </p>
              </div>
              {voiceEnabled && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="flex-shrink-0"
                  onClick={() => setVoiceEnabled(false)}
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Voice Toggle */}
      <div className="fixed bottom-24 right-4 pointer-events-auto">
        <Button
          size="icon"
          variant={voiceEnabled ? 'default' : 'outline'}
          className="rounded-full shadow-lg"
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          title={voiceEnabled ? 'Desativar áudio' : 'Ativar áudio do treinador'}
        >
          {voiceEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default PersonalTrainerMode;
