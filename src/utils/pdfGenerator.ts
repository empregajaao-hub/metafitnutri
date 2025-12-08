import jsPDF from "jspdf";

interface StudentData {
  full_name: string;
  phone: string | null;
  email: string | null;
  age: number | null;
  weight: number | null;
  height: number | null;
  goal: string;
  activity_level: string | null;
}

interface WorkoutExercise {
  day?: string;
  name: string;
  sets: string;
  reps: string;
  notes?: string;
}

interface WorkoutPlan {
  weeklySchedule?: string;
  exercises: WorkoutExercise[];
  tips: string[];
  monthlyGoals?: string[];
}

interface Meal {
  name: string;
  time: string;
  foods: string[];
  calories?: number;
}

interface MealPlan {
  meals: Meal[];
  hydration?: string;
  notes?: string;
  dailyCalories?: number;
  weeklyVariations?: Array<{ day: string; focus: string }>;
}

const getGoalLabel = (goal: string): string => {
  const goals: Record<string, string> = {
    lose_weight: "Perder Peso",
    gain_weight: "Ganhar Massa Muscular",
    maintain: "Manter Peso e Saúde",
  };
  return goals[goal] || goal;
};

const getActivityLabel = (level: string | null): string => {
  if (!level) return "Não especificado";
  const levels: Record<string, string> = {
    sedentary: "Sedentário",
    light: "Leve (1-2x/semana)",
    moderate: "Moderado (3-4x/semana)",
    active: "Ativo (5-6x/semana)",
    very_active: "Muito Ativo (Diário)",
  };
  return levels[level] || level;
};

export const generateWorkoutPDF = (
  student: StudentData,
  trainerName: string,
  plan: WorkoutPlan
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header background
  doc.setFillColor(76, 175, 80);
  doc.rect(0, 0, pageWidth, 50, "F");

  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("METAFIT", margin, 25);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Plano de Treino Mensal Personalizado", margin, 35);

  // Date
  doc.setFontSize(9);
  const currentDate = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(currentDate, pageWidth - margin - 50, 25, { align: "left" });

  yPos = 65;

  // Student Info Card
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, yPos - 5, pageWidth - margin * 2, 50, 3, 3, "F");

  doc.setTextColor(33, 33, 33);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO ALUNO", margin + 10, yPos + 8);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(117, 117, 117);

  const col1X = margin + 10;
  const col2X = pageWidth / 2;

  doc.text(`Nome: ${student.full_name}`, col1X, yPos + 20);
  doc.text(`Objetivo: ${getGoalLabel(student.goal)}`, col2X, yPos + 20);

  if (student.age) doc.text(`Idade: ${student.age} anos`, col1X, yPos + 28);
  doc.text(`Nível: ${getActivityLabel(student.activity_level)}`, col2X, yPos + 28);

  if (student.weight) doc.text(`Peso: ${student.weight} kg`, col1X, yPos + 36);
  if (student.height) doc.text(`Altura: ${student.height} cm`, col2X, yPos + 36);

  yPos += 60;

  // Trainer Info
  doc.setFillColor(56, 142, 60);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 15, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Personal Trainer: ${trainerName}`, margin + 10, yPos + 10);

  yPos += 25;

  // Weekly Schedule
  if (plan.weeklySchedule) {
    doc.setTextColor(56, 142, 60);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("DIVISÃO SEMANAL", margin, yPos);
    yPos += 8;

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const scheduleLines = doc.splitTextToSize(plan.weeklySchedule, pageWidth - margin * 2);
    doc.text(scheduleLines, margin, yPos);
    yPos += scheduleLines.length * 5 + 10;
  }

  // Exercises Section
  doc.setTextColor(56, 142, 60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("EXERCÍCIOS DO PLANO", margin, yPos);
  yPos += 10;

  // Group exercises by day if available
  const exercisesByDay: Record<string, WorkoutExercise[]> = {};
  plan.exercises.forEach((ex) => {
    const day = ex.day || "Geral";
    if (!exercisesByDay[day]) exercisesByDay[day] = [];
    exercisesByDay[day].push(ex);
  });

  Object.entries(exercisesByDay).forEach(([day, exercises]) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }

    // Day header
    doc.setFillColor(33, 150, 243);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(day.toUpperCase(), margin + 5, yPos + 5.5);
    yPos += 12;

    exercises.forEach((ex, i) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      const bgColor = i % 2 === 0 ? 255 : 248;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(margin, yPos - 3, pageWidth - margin * 2, 12, "F");

      doc.setTextColor(33, 33, 33);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${ex.name}`, margin + 5, yPos + 3);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(117, 117, 117);
      doc.text(`${ex.sets} séries × ${ex.reps}`, pageWidth - margin - 40, yPos + 3);

      if (ex.notes) {
        yPos += 8;
        doc.setFontSize(8);
        doc.setTextColor(255, 152, 0);
        doc.text(`💡 ${ex.notes}`, margin + 10, yPos + 2);
      }

      yPos += 12;
    });

    yPos += 5;
  });

  // Tips Section
  if (plan.tips && plan.tips.length > 0) {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(255, 152, 0);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("DICAS IMPORTANTES", margin + 5, yPos + 5.5);
    yPos += 15;

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    plan.tips.forEach((tip) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${tip}`, margin + 5, yPos);
      yPos += 6;
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(56, 142, 60);
  doc.rect(0, footerY - 5, pageWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(
    "© 2024 METAFIT NUTRI • Desenvolvido por Lubatec",
    pageWidth / 2,
    footerY + 3,
    { align: "center" }
  );

  // Download
  const fileName = `Treino_${student.full_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

export const generateMealPDF = (
  student: StudentData,
  trainerName: string,
  plan: MealPlan
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Header background with gradient effect
  doc.setFillColor(76, 175, 80);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setFillColor(56, 142, 60);
  doc.rect(0, 40, pageWidth, 10, "F");

  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("METAFIT", margin, 25);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Plano Alimentar Mensal Personalizado", margin, 35);

  // Date
  doc.setFontSize(9);
  const currentDate = new Date().toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(currentDate, pageWidth - margin - 50, 25, { align: "left" });

  yPos = 65;

  // Student Info Card
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, yPos - 5, pageWidth - margin * 2, 50, 3, 3, "F");

  doc.setTextColor(33, 33, 33);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("DADOS DO ALUNO", margin + 10, yPos + 8);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(117, 117, 117);

  const col1X = margin + 10;
  const col2X = pageWidth / 2;

  doc.text(`Nome: ${student.full_name}`, col1X, yPos + 20);
  doc.text(`Objetivo: ${getGoalLabel(student.goal)}`, col2X, yPos + 20);

  if (student.age) doc.text(`Idade: ${student.age} anos`, col1X, yPos + 28);
  doc.text(`Nível: ${getActivityLabel(student.activity_level)}`, col2X, yPos + 28);

  if (student.weight) doc.text(`Peso: ${student.weight} kg`, col1X, yPos + 36);
  if (student.height) doc.text(`Altura: ${student.height} cm`, col2X, yPos + 36);

  yPos += 60;

  // Trainer Info + Daily Calories
  doc.setFillColor(56, 142, 60);
  doc.roundedRect(margin, yPos, (pageWidth - margin * 2) * 0.6, 15, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Personal Trainer: ${trainerName}`, margin + 10, yPos + 10);

  if (plan.dailyCalories) {
    doc.setFillColor(255, 152, 0);
    doc.roundedRect(margin + (pageWidth - margin * 2) * 0.62, yPos, (pageWidth - margin * 2) * 0.38, 15, 3, 3, "F");
    doc.text(`Meta Diária: ${plan.dailyCalories} kcal`, margin + (pageWidth - margin * 2) * 0.65, yPos + 10);
  }

  yPos += 25;

  // Meals Section
  doc.setTextColor(56, 142, 60);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("PLANO ALIMENTAR DIÁRIO", margin, yPos);
  yPos += 10;

  plan.meals.forEach((meal) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // Meal header
    doc.setFillColor(33, 150, 243);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${meal.name}`, margin + 5, yPos + 7);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${meal.time}`, pageWidth - margin - 30, yPos + 7);
    if (meal.calories) {
      doc.text(`${meal.calories} kcal`, pageWidth - margin - 60, yPos + 7);
    }
    yPos += 14;

    // Foods
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");

    meal.foods.forEach((food) => {
      if (yPos > 275) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(`• ${food}`, margin + 10, yPos);
      yPos += 5;
    });

    yPos += 5;
  });

  // Hydration
  if (plan.hydration) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(220, 240, 255);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 20, 3, 3, "F");
    doc.setTextColor(33, 150, 243);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("💧 HIDRATAÇÃO", margin + 5, yPos + 8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(33, 33, 33);
    doc.setFontSize(9);
    doc.text(plan.hydration, margin + 5, yPos + 16);
    yPos += 30;
  }

  // Notes
  if (plan.notes) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFillColor(255, 152, 0);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("📝 OBSERVAÇÕES", margin + 5, yPos + 5.5);
    yPos += 12;

    doc.setTextColor(33, 33, 33);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const noteLines = doc.splitTextToSize(plan.notes, pageWidth - margin * 2 - 10);
    doc.text(noteLines, margin + 5, yPos);
    yPos += noteLines.length * 5 + 10;
  }

  // Weekly variations if available
  if (plan.weeklyVariations && plan.weeklyVariations.length > 0) {
    if (yPos > 230) {
      doc.addPage();
      yPos = 20;
    }

    doc.setTextColor(56, 142, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("VARIAÇÕES SEMANAIS", margin, yPos);
    yPos += 8;

    plan.weeklyVariations.forEach((variation) => {
      doc.setTextColor(33, 33, 33);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${variation.day}:`, margin + 5, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(variation.focus, margin + 40, yPos);
      yPos += 6;
    });
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFillColor(56, 142, 60);
  doc.rect(0, footerY - 5, pageWidth, 20, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(
    "© 2024 METAFIT NUTRI • Desenvolvido por Lubatec",
    pageWidth / 2,
    footerY + 3,
    { align: "center" }
  );

  // Download
  const fileName = `Alimentacao_${student.full_name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};
