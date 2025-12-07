// Conteúdo que rota automaticamente baseado no dia da semana
// Domingo = 0, Segunda = 1, Terça = 2, etc.

export const getDayOfWeek = () => new Date().getDay();
export const getDayName = () => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[getDayOfWeek()];
};

// Depoimentos de clientes - um diferente para cada dia da semana
export const testimonials = [
  // Domingo (0)
  [
    {
      text: "Finalmente consegui perder 10kg em 3 meses! O METAFIT mudou completamente a minha relação com a comida.",
      name: "Beatriz Fernandes",
      location: "Luanda",
      initials: "BF",
      gradient: "from-pink-500/20 to-rose-500/20"
    },
    {
      text: "As receitas angolanas são incríveis! Nunca pensei que poderia comer saudável com a nossa comida tradicional.",
      name: "Carlos Manuel",
      location: "Benguela",
      initials: "CM",
      gradient: "from-blue-500/20 to-cyan-500/20"
    },
    {
      text: "Recomendo a todos! O suporte é excelente e o app funciona perfeitamente via Multicaixa.",
      name: "Luísa Domingos",
      location: "Lubango",
      initials: "LD",
      gradient: "from-green-500/20 to-emerald-500/20"
    }
  ],
  // Segunda (1)
  [
    {
      text: "O METAFIT ajudou-me a perder 8kg em 2 meses! A análise das refeições é super rápida e as receitas angolanas são perfeitas.",
      name: "Maria Costa",
      location: "Luanda",
      initials: "MC",
      gradient: "from-primary/20 to-secondary/20"
    },
    {
      text: "Finalmente uma app de nutrição que entende a nossa comida! O pagamento via Multicaixa é muito conveniente.",
      name: "João Santos",
      location: "Benguela",
      initials: "JS",
      gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
      text: "Excelente para quem treina! Os planos de refeições são adaptados aos produtos que temos aqui em Angola.",
      name: "Ana Ferreira",
      location: "Huambo",
      initials: "AF",
      gradient: "from-orange-500/20 to-red-500/20"
    }
  ],
  // Terça (2)
  [
    {
      text: "Perdi 12kg em 4 meses! As sugestões de receitas com funge e calulu são deliciosas e saudáveis.",
      name: "Paulo Mendes",
      location: "Cabinda",
      initials: "PM",
      gradient: "from-teal-500/20 to-cyan-500/20"
    },
    {
      text: "A funcionalidade de tirar foto e receber análise é fantástica! Uso todos os dias no almoço.",
      name: "Teresa Gomes",
      location: "Luanda",
      initials: "TG",
      gradient: "from-amber-500/20 to-yellow-500/20"
    },
    {
      text: "Consegui ganhar massa muscular com as dicas de nutrição. As porções são bem calculadas para o meu objetivo.",
      name: "Ricardo Silva",
      location: "Namibe",
      initials: "RS",
      gradient: "from-indigo-500/20 to-blue-500/20"
    }
  ],
  // Quarta (3)
  [
    {
      text: "Adoro as receitas alternativas! Sempre consigo fazer algo saudável com os ingredientes que tenho em casa.",
      name: "Helena Nunes",
      location: "Malanje",
      initials: "HN",
      gradient: "from-rose-500/20 to-pink-500/20"
    },
    {
      text: "O melhor investimento que fiz para a minha saúde. Perdi peso sem passar fome com receitas angolanas.",
      name: "António Pedro",
      location: "Luanda",
      initials: "AP",
      gradient: "from-sky-500/20 to-blue-500/20"
    },
    {
      text: "Minha esposa e eu usamos juntos. Já perdemos 15kg combinados! A comida continua deliciosa.",
      name: "Fernando Alves",
      location: "Benguela",
      initials: "FA",
      gradient: "from-emerald-500/20 to-green-500/20"
    }
  ],
  // Quinta (4)
  [
    {
      text: "As dicas de treino combinadas com as receitas são perfeitas! Ganhei 5kg de músculo em 3 meses.",
      name: "Miguel Dias",
      location: "Luanda",
      initials: "MD",
      gradient: "from-violet-500/20 to-purple-500/20"
    },
    {
      text: "Nunca pensei que fosse tão fácil controlar o peso. A análise por foto é muito prática no dia a dia.",
      name: "Sandra Lopes",
      location: "Huíla",
      initials: "SL",
      gradient: "from-fuchsia-500/20 to-pink-500/20"
    },
    {
      text: "O suporte pelo WhatsApp é excelente! Sempre me ajudam quando tenho dúvidas sobre as receitas.",
      name: "José Ribeiro",
      location: "Cunene",
      initials: "JR",
      gradient: "from-lime-500/20 to-green-500/20"
    }
  ],
  // Sexta (5)
  [
    {
      text: "Finalmente uma app que entende que moamba não é crime! Aprendi a comer saudável sem abandonar as tradições.",
      name: "Cristina Martins",
      location: "Luanda",
      initials: "CM",
      gradient: "from-red-500/20 to-orange-500/20"
    },
    {
      text: "Perdi 6kg no primeiro mês! As sugestões são realistas e fáceis de seguir com produtos locais.",
      name: "Manuel Costa",
      location: "Uíge",
      initials: "MC",
      gradient: "from-cyan-500/20 to-teal-500/20"
    },
    {
      text: "A melhor parte é que as receitas usam ingredientes que encontro no mercado. Nada de coisas importadas caras!",
      name: "Patrícia Silva",
      location: "Benguela",
      initials: "PS",
      gradient: "from-yellow-500/20 to-amber-500/20"
    }
  ],
  // Sábado (6)
  [
    {
      text: "Uso o METAFIT há 6 meses e já perdi 18kg! É a única app que realmente funciona para nós angolanos.",
      name: "Daniel Sousa",
      location: "Luanda",
      initials: "DS",
      gradient: "from-blue-500/20 to-indigo-500/20"
    },
    {
      text: "As receitas de fim de semana são especiais! Consigo fazer refeições saudáveis mesmo em dias de festa.",
      name: "Mariana Pereira",
      location: "Lobito",
      initials: "MP",
      gradient: "from-pink-500/20 to-purple-500/20"
    },
    {
      text: "Recomendo para toda a família! Até as crianças gostam das receitas saudáveis que o app sugere.",
      name: "Eduardo Nascimento",
      location: "Huambo",
      initials: "EN",
      gradient: "from-green-500/20 to-teal-500/20"
    }
  ]
];

// Exercícios rotativos para casa - diferentes para cada dia
export const homeExercises = [
  // Domingo (0) - Descanso ativo
  [
    { name: "Alongamento Dinâmico", sets: "2 séries", reps: "10 repetições", rest: "30s descanso", description: "Prepara o corpo para atividade", muscleGroup: "Corpo Todo" },
    { name: "Caminhada no Lugar", sets: "3 séries", reps: "2 minutos", rest: "45s descanso", description: "Cardio leve para recuperação", muscleGroup: "Cardio" },
    { name: "Yoga Básico", sets: "1 série", reps: "15 minutos", rest: "Respire", description: "Relaxamento e flexibilidade", muscleGroup: "Flexibilidade" },
    { name: "Respiração Profunda", sets: "3 séries", reps: "10 respirações", rest: "30s descanso", description: "Recuperação mental", muscleGroup: "Relaxamento" }
  ],
  // Segunda (1) - Pernas e Glúteos
  [
    { name: "Agachamentos", sets: "3 séries", reps: "15 repetições", rest: "60s descanso", description: "Exercício para pernas e glúteos", muscleGroup: "Pernas & Glúteos" },
    { name: "Lunges Alternados", sets: "3 séries", reps: "12 cada perna", rest: "60s descanso", description: "Trabalha pernas e equilíbrio", muscleGroup: "Pernas & Equilíbrio" },
    { name: "Elevação de Quadril", sets: "3 séries", reps: "15 repetições", rest: "45s descanso", description: "Fortalece glúteos", muscleGroup: "Glúteos" },
    { name: "Agachamento Sumô", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Foco na parte interna das coxas", muscleGroup: "Pernas" }
  ],
  // Terça (2) - Peito e Tríceps
  [
    { name: "Flexões", sets: "3 séries", reps: "10-15 repetições", rest: "60s descanso", description: "Trabalha peito, ombros e tríceps", muscleGroup: "Peito & Braços" },
    { name: "Flexões Diamante", sets: "3 séries", reps: "8-10 repetições", rest: "60s descanso", description: "Foco no tríceps", muscleGroup: "Tríceps" },
    { name: "Dips na Cadeira", sets: "3 séries", reps: "12 repetições", rest: "45s descanso", description: "Tríceps e ombros", muscleGroup: "Braços" },
    { name: "Flexões Inclinadas", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Peito superior", muscleGroup: "Peito" }
  ],
  // Quarta (3) - Core e Abdómen
  [
    { name: "Prancha", sets: "3 séries", reps: "30-60 segundos", rest: "45s descanso", description: "Fortalece o core", muscleGroup: "Core & Abdómen" },
    { name: "Bicicleta Abdominal", sets: "3 séries", reps: "20 repetições", rest: "45s descanso", description: "Abdominais oblíquos", muscleGroup: "Abdómen" },
    { name: "Prancha Lateral", sets: "3 séries", reps: "30s cada lado", rest: "45s descanso", description: "Oblíquos e estabilidade", muscleGroup: "Core" },
    { name: "Dead Bug", sets: "3 séries", reps: "12 repetições", rest: "45s descanso", description: "Core profundo", muscleGroup: "Core" }
  ],
  // Quinta (4) - Costas e Bíceps
  [
    { name: "Superman", sets: "3 séries", reps: "12 repetições", rest: "45s descanso", description: "Fortalece lombares e costas", muscleGroup: "Costas" },
    { name: "Remada com Garrafa", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Costas e bíceps", muscleGroup: "Costas & Bíceps" },
    { name: "Rosca Bíceps", sets: "3 séries", reps: "15 repetições", rest: "45s descanso", description: "Com garrafas de água", muscleGroup: "Bíceps" },
    { name: "Prancha com Rotação", sets: "3 séries", reps: "10 cada lado", rest: "45s descanso", description: "Core e costas", muscleGroup: "Core & Costas" }
  ],
  // Sexta (5) - HIIT
  [
    { name: "Jumping Jacks", sets: "4 séries", reps: "30 segundos", rest: "15s descanso", description: "Cardio intenso", muscleGroup: "Cardio" },
    { name: "Burpees", sets: "3 séries", reps: "10 repetições", rest: "45s descanso", description: "Corpo inteiro", muscleGroup: "Corpo Todo" },
    { name: "Mountain Climbers", sets: "4 séries", reps: "30 segundos", rest: "20s descanso", description: "Core e cardio", muscleGroup: "Core & Cardio" },
    { name: "Squat Jumps", sets: "3 séries", reps: "12 repetições", rest: "45s descanso", description: "Explosão de pernas", muscleGroup: "Pernas" }
  ],
  // Sábado (6) - Corpo Completo
  [
    { name: "Agachamentos", sets: "3 séries", reps: "15 repetições", rest: "60s descanso", description: "Pernas e glúteos", muscleGroup: "Pernas" },
    { name: "Flexões", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Peito e braços", muscleGroup: "Peito" },
    { name: "Prancha", sets: "3 séries", reps: "45 segundos", rest: "45s descanso", description: "Core", muscleGroup: "Core" },
    { name: "Lunges", sets: "3 séries", reps: "10 cada perna", rest: "60s descanso", description: "Pernas e equilíbrio", muscleGroup: "Pernas" }
  ]
];

// Exercícios rotativos para ginásio - diferentes para cada dia
export const gymExercises = [
  // Domingo (0) - Descanso/Cardio Leve
  [
    { name: "Esteira - Caminhada", sets: "1 série", reps: "20 minutos", rest: "Ritmo leve", description: "Recuperação ativa", muscleGroup: "Cardio" },
    { name: "Elíptico", sets: "1 série", reps: "15 minutos", rest: "Intensidade baixa", description: "Cardio de baixo impacto", muscleGroup: "Cardio" },
    { name: "Alongamento Guiado", sets: "1 série", reps: "15 minutos", rest: "Respire", description: "Flexibilidade", muscleGroup: "Flexibilidade" },
    { name: "Rolo de Espuma", sets: "1 série", reps: "10 minutos", rest: "Foque nas áreas tensas", description: "Recuperação muscular", muscleGroup: "Recuperação" }
  ],
  // Segunda (1) - Peito e Tríceps
  [
    { name: "Supino Reto", sets: "4 séries", reps: "8-12 repetições", rest: "90s descanso", description: "Principal exercício para peito", muscleGroup: "Peito" },
    { name: "Supino Inclinado", sets: "3 séries", reps: "10-12 repetições", rest: "75s descanso", description: "Peito superior", muscleGroup: "Peito" },
    { name: "Crucifixo", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Isolamento do peito", muscleGroup: "Peito" },
    { name: "Tríceps Pulley", sets: "3 séries", reps: "12-15 repetições", rest: "60s descanso", description: "Definição do tríceps", muscleGroup: "Tríceps" }
  ],
  // Terça (2) - Costas e Bíceps
  [
    { name: "Puxada Frontal", sets: "4 séries", reps: "10-12 repetições", rest: "90s descanso", description: "Desenvolve as costas", muscleGroup: "Costas" },
    { name: "Remada Curvada", sets: "4 séries", reps: "10-12 repetições", rest: "90s descanso", description: "Espessura das costas", muscleGroup: "Costas" },
    { name: "Remada Unilateral", sets: "3 séries", reps: "10 cada lado", rest: "60s descanso", description: "Foco e simetria", muscleGroup: "Costas" },
    { name: "Rosca Direta", sets: "3 séries", reps: "10-12 repetições", rest: "60s descanso", description: "Bíceps volumoso", muscleGroup: "Bíceps" }
  ],
  // Quarta (3) - Pernas
  [
    { name: "Agachamento com Barra", sets: "4 séries", reps: "8-10 repetições", rest: "120s descanso", description: "Rei dos exercícios", muscleGroup: "Pernas & Glúteos" },
    { name: "Leg Press", sets: "4 séries", reps: "12 repetições", rest: "90s descanso", description: "Força de pernas", muscleGroup: "Pernas" },
    { name: "Cadeira Extensora", sets: "3 séries", reps: "12-15 repetições", rest: "60s descanso", description: "Quadríceps", muscleGroup: "Quadríceps" },
    { name: "Cadeira Flexora", sets: "3 séries", reps: "12-15 repetições", rest: "60s descanso", description: "Posteriores da coxa", muscleGroup: "Posteriores" }
  ],
  // Quinta (4) - Ombros e Abdómen
  [
    { name: "Desenvolvimento com Halteres", sets: "4 séries", reps: "10-12 repetições", rest: "75s descanso", description: "Ombros fortes", muscleGroup: "Ombros" },
    { name: "Elevação Lateral", sets: "3 séries", reps: "12-15 repetições", rest: "60s descanso", description: "Deltóides laterais", muscleGroup: "Ombros" },
    { name: "Elevação Frontal", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Deltóides frontais", muscleGroup: "Ombros" },
    { name: "Abdominal na Máquina", sets: "4 séries", reps: "15-20 repetições", rest: "45s descanso", description: "Core definido", muscleGroup: "Abdómen" }
  ],
  // Sexta (5) - Braços Completo
  [
    { name: "Rosca Scott", sets: "3 séries", reps: "10-12 repetições", rest: "60s descanso", description: "Pico do bíceps", muscleGroup: "Bíceps" },
    { name: "Rosca Martelo", sets: "3 séries", reps: "12 repetições", rest: "60s descanso", description: "Bíceps braquial", muscleGroup: "Bíceps" },
    { name: "Tríceps Francês", sets: "3 séries", reps: "10-12 repetições", rest: "60s descanso", description: "Cabeça longa do tríceps", muscleGroup: "Tríceps" },
    { name: "Tríceps Testa", sets: "3 séries", reps: "10-12 repetições", rest: "60s descanso", description: "Tríceps completo", muscleGroup: "Tríceps" }
  ],
  // Sábado (6) - Full Body
  [
    { name: "Agachamento Livre", sets: "4 séries", reps: "10 repetições", rest: "90s descanso", description: "Pernas e core", muscleGroup: "Pernas" },
    { name: "Supino Reto", sets: "3 séries", reps: "10 repetições", rest: "75s descanso", description: "Peito e tríceps", muscleGroup: "Peito" },
    { name: "Remada Baixa", sets: "3 séries", reps: "12 repetições", rest: "75s descanso", description: "Costas e bíceps", muscleGroup: "Costas" },
    { name: "Desenvolvimento Militar", sets: "3 séries", reps: "10 repetições", rest: "75s descanso", description: "Ombros completos", muscleGroup: "Ombros" }
  ]
];

// Dicas de treino que variam por dia
export const workoutTips = [
  // Domingo
  [
    "Domingo é dia de descanso ativo - caminha ou faz alongamentos leves",
    "Prepara as refeições da semana hoje",
    "Dorme bem para recuperar os músculos",
    "Hidrata-te bem para a semana que vem",
    "Revê os teus objetivos e ajusta se necessário"
  ],
  // Segunda
  [
    "Começa a semana com energia! Treino de pernas é fundamental",
    "Aquece sempre 5-10 minutos antes do treino",
    "Foca na forma correta, não na quantidade",
    "Bebe água antes, durante e após o treino",
    "Não saltes o dia de pernas!"
  ],
  // Terça
  [
    "Hoje é dia de peito e tríceps - força máxima!",
    "Respira corretamente: expira no esforço",
    "Mantém a tensão muscular durante todo o movimento",
    "Descansa o tempo certo entre séries",
    "Come proteína após o treino"
  ],
  // Quarta
  [
    "Core forte = corpo forte! Foco no abdómen hoje",
    "Contrai o abdómen durante todos os exercícios",
    "A prancha é o melhor exercício para core",
    "Não faça abdominais com dores nas costas",
    "Mantém a respiração controlada"
  ],
  // Quinta
  [
    "Dia de costas - postura perfeita!",
    "Puxa com os cotovelos, não com as mãos",
    "Mantém as escápulas retraídas",
    "Costas largas dão aparência atlética",
    "Alonga bem após o treino"
  ],
  // Sexta
  [
    "HIIT hoje - queima calorias mesmo após o treino!",
    "Dá tudo o que tens em cada intervalo",
    "Recupera completamente entre rondas",
    "HIIT é mais eficaz que cardio longo",
    "Termina a semana forte!"
  ],
  // Sábado
  [
    "Treino completo hoje - trabalha todo o corpo",
    "Usa pesos moderados com boa forma",
    "Foca nos exercícios compostos",
    "Amanhã é dia de descanso - dá o teu melhor!",
    "Celebra a consistência desta semana"
  ]
];

export const getTodayTestimonials = () => testimonials[getDayOfWeek()];
export const getTodayHomeExercises = () => homeExercises[getDayOfWeek()];
export const getTodayGymExercises = () => gymExercises[getDayOfWeek()];
export const getTodayTips = () => workoutTips[getDayOfWeek()];
