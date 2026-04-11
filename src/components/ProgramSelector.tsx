import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Clock, Zap, Target, CheckCircle } from 'lucide-react';
import workoutPrograms from '@/data/workoutPrograms.json';

interface ProgramSelectorProps {
  onSelectProgram: (programId: string) => void;
}

const ProgramSelector: React.FC<ProgramSelectorProps> = ({ onSelectProgram }) => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const currentProgram = workoutPrograms.find(p => p.id === selectedProgram);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Intermédio':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'Avançado':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm">Programas de Treino</h3>
          {selectedProgram && (
            <Badge variant="secondary" className="text-xs">
              Selecionado
            </Badge>
          )}
        </div>

        {workoutPrograms.map((program) => (
          <Card
            key={program.id}
            className={`p-4 cursor-pointer transition-all border-2 ${
              selectedProgram === program.id
                ? 'border-primary bg-primary/5'
                : 'border-border/50 hover:border-primary/50'
            }`}
            onClick={() => setSelectedProgram(program.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-sm">{program.title_ptAO}</h4>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold border ${getDifficultyColor(
                      program.difficulty
                    )}`}
                  >
                    {program.difficulty}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {program.description_ptAO}
                </p>
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {program.duration}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    {program.category === 'home' ? 'Casa' : 'Ginásio'}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Target className="w-3 h-3" />
                    {program.days.length} dias
                  </div>
                </div>
              </div>
              {selectedProgram === program.id && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {selectedProgram && (
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setShowDetails(true)}
          >
            Ver Detalhes
          </Button>
          <Button
            className="flex-1"
            onClick={() => onSelectProgram(selectedProgram)}
          >
            Começar
          </Button>
        </div>
      )}

      {/* Program Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentProgram?.title_ptAO}</DialogTitle>
            <DialogDescription>
              {currentProgram?.description_ptAO}
            </DialogDescription>
          </DialogHeader>

          {currentProgram && (
            <div className="space-y-4">
              {/* Program Info */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Duração</p>
                  <p className="font-bold text-sm">{currentProgram.duration}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Dificuldade</p>
                  <p className="font-bold text-sm">{currentProgram.difficulty}</p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Local</p>
                  <p className="font-bold text-sm">
                    {currentProgram.category === 'home' ? 'Casa' : 'Ginásio'}
                  </p>
                </div>
              </div>

              {/* Days Overview */}
              <div>
                <h4 className="font-bold text-sm mb-2">Plano Semanal:</h4>
                <div className="space-y-2">
                  {currentProgram.days.map((day, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-2 bg-muted/30 rounded-lg">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">{day.day}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">{day.title_ptAO}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {day.exercises.length > 0
                            ? `${day.exercises.length} exercícios`
                            : 'Descanso'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProgramSelector;
