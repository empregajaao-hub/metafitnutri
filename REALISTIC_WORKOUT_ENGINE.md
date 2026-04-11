# 🏋️ Realistic Workout Engine - MetaFit Nutri

## Visão Geral

O **Realistic Workout Engine** é um sistema completo de treino com IA que transforma o MetaFit Nutri num **personal trainer digital** com experiência realista e orientação em tempo real.

## 🎯 Características Principais

### 1. **RealisticWorkoutEngine Component**
- Reprodutor de vídeo profissional com controles avançados
- Suporte para múltiplos ângulos de visualização (Frente e Lateral)
- Controle de velocidade (0.5x até 2x)
- Coach Mode com dicas em tempo real
- Fallback automático para animações SVG se vídeo falhar

**Localização:** `src/components/RealisticWorkoutEngine.tsx`

### 2. **WorkoutPlayer Component**
- Interface completa de treino em fullscreen
- Timer integrado com contagem regressiva
- Transição automática entre exercícios
- Períodos de descanso com contador visual
- Informações técnicas de cada exercício
- Próximos exercícios em preview

**Localização:** `src/components/WorkoutPlayer.tsx`

### 3. **PersonalTrainerMode Component**
- Dicas de treino em tempo real (a cada 10 segundos)
- Categorias: Forma, Respiração, Motivação, Segurança
- Suporte para áudio (preparado para integração com TTS)
- Notificações não-intrusivas em pt-AO

**Localização:** `src/components/PersonalTrainerMode.tsx`

### 4. **WorkoutTracker Component**
- Rastreamento de treinos completados
- Sequência de dias (streak)
- Calorias queimadas
- Meta semanal com progresso visual
- Histórico de último treino

**Localização:** `src/components/WorkoutTracker.tsx`

### 5. **ProgramSelector Component**
- Seleção de programas de treino
- Programas disponíveis:
  - Iniciante (7 dias)
  - Perda de Peso (30 dias)
  - Ganho Muscular (Contínuo)
- Visualização de detalhes do programa
- Dificuldade e duração estimada

**Localização:** `src/components/ProgramSelector.tsx`

## 📚 Biblioteca de Exercícios

### Estrutura JSON
```json
{
  "id": "agachamento",
  "name_ptAO": "Agachamento",
  "category": "home" | "gym",
  "difficulty": "Iniciante",
  "targetMuscles": ["Quadríceps", "Glúteos", "Core"],
  "animationUrl": "/animations/squat.mp4",
  "instructions_ptAO": "Instruções em português de Angola",
  "tips_ptAO": "Dicas de segurança",
  "duration": 45,
  "coach_cues": ["Dica 1", "Dica 2", "Dica 3"]
}
```

**Localização:** `src/data/exercises.json`

### Exercícios Disponíveis

#### Casa (Sem Equipamento)
- ✅ Agachamento
- ✅ Flexões
- ✅ Prancha
- ✅ Saltos (Jumping Jack)
- ✅ Escalador (Mountain Climber)
- ✅ Ponte de Glúteo
- ✅ Burpee

#### Ginásio (Com Equipamento)
- ✅ Supino
- ✅ Peso Morto
- ✅ Leg Press
- ✅ Puxada na Barra
- ✅ Rosca Bíceps
- ✅ Tríceps na Polia
- ✅ Desenvolvimento de Ombro

## 🌍 Localização em Português de Angola (pt-AO)

Todos os textos são 100% localizados para Angola:

- **Nomes de Exercícios:** Agachamento, Flexões, Prancha, etc.
- **Instruções:** Linguagem natural e direta
- **Dicas do Treinador:** Tom motivacional e culturalmente relevante
- **Exemplos:**
  - "Mantém as costas direitas"
  - "Não deixes os joelhos avançarem demais"
  - "Controla a respiração"
  - "Força, estás a fazer bem!"

## 🎮 Como Usar

### Iniciar um Treino

```typescript
import WorkoutPlayer from '@/components/WorkoutPlayer';
import exercisesData from '@/data/exercises.json';

// No seu componente
const [showWorkout, setShowWorkout] = useState(false);

return (
  <>
    <Button onClick={() => setShowWorkout(true)}>
      Começar Treino
    </Button>

    {showWorkout && (
      <WorkoutPlayer
        exercises={exercisesData}
        onComplete={(stats) => {
          console.log(`Treino concluído em ${stats.totalTime}s`);
          setShowWorkout(false);
        }}
        onClose={() => setShowWorkout(false)}
      />
    )}
  </>
);
```

### Usar o Rastreador de Treinos

```typescript
import WorkoutTracker from '@/components/WorkoutTracker';

export default function Dashboard() {
  return (
    <div>
      <h2>Meu Progresso</h2>
      <WorkoutTracker />
    </div>
  );
}
```

## 🎬 Integração de Vídeos

### Formato Recomendado
- **Codec:** H.264 (MP4)
- **Duração:** 5-20 segundos (loop)
- **Resolução:** 1080p para melhor qualidade
- **Taxa de Quadros:** 30fps
- **Tamanho:** < 5MB para otimização mobile

### Estrutura de Pastas
```
public/
├── animations/
│   ├── squat.mp4
│   ├── pushups.mp4
│   ├── plank.mp4
│   ├── jumping_jacks.mp4
│   ├── bench_press.mp4
│   └── ...
```

### Adicionar Novo Exercício

1. Adicionar vídeo em `public/animations/`
2. Atualizar `src/data/exercises.json`:
```json
{
  "id": "novo-exercicio",
  "name_ptAO": "Nome do Exercício",
  "animationUrl": "/animations/novo-exercicio.mp4",
  ...
}
```

## 🚀 Otimizações para Angola

### Banda Larga Limitada
- ✅ Vídeos comprimidos (< 5MB)
- ✅ Lazy loading de assets
- ✅ Fallback para animações SVG
- ✅ Cache local de exercícios

### Mobile-First
- ✅ Interface responsiva
- ✅ Touch-friendly controls
- ✅ Modo fullscreen otimizado
- ✅ Suporte offline (com service workers)

## 📊 Performance Tracking

### Dados Rastreados
- Treinos completados
- Sequência (streak)
- Calorias queimadas
- Tempo total de treino
- Exercícios por semana

### Armazenamento
Dados salvos em Supabase:
- `workout_history` - Histórico de treinos
- `user_stats` - Estatísticas do utilizador

## 🔧 Configuração Avançada

### Customizar Coach Cues

Editar `src/components/PersonalTrainerMode.tsx`:

```typescript
const coachTips: CoachTip[] = [
  {
    id: 'custom-1',
    title_ptAO: 'Seu Título',
    description_ptAO: 'Sua descrição em pt-AO',
    category: 'form',
    severity: 'warning',
  },
  // ...
];
```

### Adicionar Novo Programa

Editar `src/data/workoutPrograms.json`:

```json
{
  "id": "novo-programa",
  "title_ptAO": "Novo Programa",
  "description_ptAO": "Descrição do programa",
  "duration": "30 dias",
  "difficulty": "Intermédio",
  "category": "home",
  "days": [
    {
      "day": 1,
      "title_ptAO": "Dia 1",
      "exercises": ["agachamento", "flexoes"]
    }
  ]
}
```

## 🎨 Customização de UI

### Cores e Temas
- Primária: Azul (energia)
- Secundária: Verde (progresso)
- Accent: Laranja (motivação)

### Dark Mode
- ✅ Suportado nativamente
- ✅ Otimizado para treino (menos cansaço visual)

## 🐛 Troubleshooting

### Vídeo não carrega
1. Verificar URL em `exercises.json`
2. Confirmar que arquivo existe em `public/animations/`
3. Verificar formato de vídeo (MP4 H.264)
4. Fallback automático para animação SVG

### Coach Mode não aparece
1. Confirmar que `coachModeActive` está `true`
2. Verificar que `PersonalTrainerMode` está importado
3. Verificar console para erros

### Treino não salva
1. Confirmar autenticação Supabase
2. Verificar permissões de banco de dados
3. Verificar conexão de internet

## 📱 Suporte Mobile

- ✅ iOS (via Capacitor)
- ✅ Android (via Capacitor)
- ✅ PWA (Progressive Web App)
- ✅ Offline mode (com service workers)

## 🔐 Segurança

- Dados de treino criptografados em Supabase
- Autenticação via Supabase Auth
- Sem armazenamento de dados sensíveis localmente
- HTTPS obrigatório em produção

## 📈 Próximas Melhorias

- [ ] Integração com câmara para pose detection
- [ ] Voice guidance com TTS (Text-to-Speech)
- [ ] Análise de performance com IA
- [ ] Programas personalizados baseados em IA
- [ ] Social features (desafios com amigos)
- [ ] Integração com wearables

## 📞 Suporte

Para questões ou bugs, contacte: support@metafitnutri.com

---

**Versão:** 1.0.0  
**Última Atualização:** Abril 2026  
**Linguagem:** Português de Angola (pt-AO)
