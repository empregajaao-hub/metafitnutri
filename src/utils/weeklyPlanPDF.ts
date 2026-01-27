import jsPDF from "jspdf";

interface DayMeals {
  meals: Array<{
    name: string;
    time: string;
    foods: string[];
    calories?: number;
  }>;
}

interface DayWorkout {
  focus: string;
  duration: string;
  exercises: Array<{
    name: string;
    sets: string;
    reps: string;
    notes?: string;
  }>;
}

interface WeeklyMealPlan {
  weeklyPlan: {
    monday?: DayMeals;
    tuesday?: DayMeals;
    wednesday?: DayMeals;
    thursday?: DayMeals;
    friday?: DayMeals;
    saturday?: DayMeals;
    sunday?: DayMeals;
  };
  dailyCalories?: number;
  hydration?: string;
  tips?: string[];
  notes?: string;
}

interface WeeklyWorkoutPlan {
  weeklyPlan: {
    monday?: DayWorkout;
    tuesday?: DayWorkout;
    wednesday?: DayWorkout;
    thursday?: DayWorkout;
    friday?: DayWorkout;
    saturday?: DayWorkout;
    sunday?: DayWorkout;
  };
  warmup?: string[];
  cooldown?: string[];
  tips?: string[];
  notes?: string;
}

interface UserProfile {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  activityLevel?: string;
}

const DAYS_PT: { [key: string]: string } = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

const GOAL_LABELS: { [key: string]: string } = {
  lose: "Perder Peso",
  lose_weight: "Perder Peso",
  perder_peso: "Perder Peso",
  gain: "Ganhar Massa",
  gain_weight: "Ganhar Massa",
  ganhar_peso: "Ganhar Massa",
  maintain: "Manter Peso",
  manter_peso: "Manter Peso",
};

const PRIMARY_COLOR = { r: 14, g: 165, b: 233 }; // hsl(205 100% 50%) -> #0EA5E9
const SECONDARY_COLOR = { r: 30, g: 64, b: 175 }; // hsl(215 80% 35%)
const ACCENT_COLOR = { r: 0, g: 180, b: 230 }; // Accent blue

export const generateWeeklyMealPDF = (plan: WeeklyMealPlan, profile: UserProfile): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 0;

  // Helper function to add page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = 15;
    }
  };

  // ========== HEADER ==========
  doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  // Gradient effect
  doc.setFillColor(SECONDARY_COLOR.r, SECONDARY_COLOR.g, SECONDARY_COLOR.b);
  doc.rect(0, 38, pageWidth, 7, "F");

  // Logo/Brand
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("METAFIT", margin, 22);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Plano Alimentar Semanal Personalizado", margin, 33);

  // Date
  doc.setFontSize(9);
  const currentDate = new Date().toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(currentDate, pageWidth - margin, 22, { align: "right" });

  yPos = 55;

  // ========== USER INFO CARD ==========
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 4, 4, "F");
  
  doc.setDrawColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 4, 4, "S");

  doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("🏋️ DADOS DO UTILIZADOR", margin + 8, yPos + 10);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const col1X = margin + 8;
  const col2X = pageWidth / 2 + 5;

  doc.text(`Nome: ${profile.name || "Utilizador"}`, col1X, yPos + 20);
  if (profile.age) doc.text(`Idade: ${profile.age} anos`, col1X, yPos + 28);
  if (profile.weight) doc.text(`Peso: ${profile.weight} kg`, col1X, yPos + 36);
  
  doc.text(`Objetivo: ${GOAL_LABELS[profile.goal || ""] || profile.goal || "Não definido"}`, col2X, yPos + 20);
  if (profile.height) doc.text(`Altura: ${profile.height} cm`, col2X, yPos + 28);
  doc.text(`Nível: ${profile.activityLevel || "Moderado"}`, col2X, yPos + 36);

  yPos += 50;

  // Daily Calories Badge
  if (plan.dailyCalories) {
    doc.setFillColor(ACCENT_COLOR.r, ACCENT_COLOR.g, ACCENT_COLOR.b);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 12, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`🔥 Meta Diária: ${plan.dailyCalories} kcal`, pageWidth / 2, yPos + 8, { align: "center" });
    yPos += 18;
  }

  // ========== WEEKLY PLAN ==========
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  days.forEach((day) => {
    const dayData = plan.weeklyPlan[day as keyof typeof plan.weeklyPlan];
    if (!dayData || !dayData.meals || dayData.meals.length === 0) return;

    checkNewPage(45);

    // Day Header
    doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(DAYS_PT[day].toUpperCase(), margin + 5, yPos + 7);

    // Calculate daily total
    const dayCalories = dayData.meals.reduce((sum, m) => sum + (m.calories || 0), 0);
    if (dayCalories > 0) {
      doc.text(`${dayCalories} kcal`, pageWidth - margin - 5, yPos + 7, { align: "right" });
    }

    yPos += 14;

    // Meals
    dayData.meals.forEach((meal, mealIdx) => {
      checkNewPage(20);

      const bgColor = mealIdx % 2 === 0 ? 255 : 250;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(margin, yPos - 2, pageWidth - margin * 2, 14, "F");

      // Meal icon based on name
      let emoji = "🍽️";
      if (meal.name.toLowerCase().includes("pequeno")) emoji = "☕";
      else if (meal.name.toLowerCase().includes("almoço")) emoji = "☀️";
      else if (meal.name.toLowerCase().includes("lanche")) emoji = "🍪";
      else if (meal.name.toLowerCase().includes("jantar")) emoji = "🌙";

      doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${emoji} ${meal.name}`, margin + 3, yPos + 4);

      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(meal.time, margin + 55, yPos + 4);

      if (meal.calories) {
        doc.setTextColor(ACCENT_COLOR.r, ACCENT_COLOR.g, ACCENT_COLOR.b);
        doc.setFont("helvetica", "bold");
        doc.text(`${meal.calories} kcal`, pageWidth - margin - 3, yPos + 4, { align: "right" });
      }

      // Foods
      doc.setTextColor(60, 60, 60);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const foodsText = meal.foods.join(", ");
      const foodLines = doc.splitTextToSize(foodsText, pageWidth - margin * 2 - 10);
      doc.text(foodLines, margin + 5, yPos + 10);
      
      yPos += 10 + (foodLines.length * 4);
    });

    yPos += 6;
  });

  // ========== TIPS ==========
  if (plan.tips && plan.tips.length > 0) {
    checkNewPage(30);
    
    doc.setFillColor(255, 243, 224);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8 + plan.tips.length * 6, 3, 3, "F");
    
    doc.setTextColor(230, 126, 34);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("💡 DICAS IMPORTANTES", margin + 5, yPos + 6);
    
    yPos += 10;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    plan.tips.forEach((tip) => {
      doc.text(`• ${tip}`, margin + 8, yPos);
      yPos += 5;
    });
    
    yPos += 5;
  }

  // ========== HYDRATION ==========
  if (plan.hydration) {
    checkNewPage(20);
    
    doc.setFillColor(224, 247, 250);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 14, 3, 3, "F");
    
    doc.setTextColor(0, 151, 167);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("💧 HIDRATAÇÃO", margin + 5, yPos + 6);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(plan.hydration, margin + 5, yPos + 11);
    yPos += 18;
  }

  // ========== FOOTER ==========
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
  doc.rect(0, footerY - 3, pageWidth, 15, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "© 2024 METAFIT NUTRI • Plano gerado automaticamente • Desenvolvido por Lubatec",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  return doc.output("blob");
};

export const generateWeeklyWorkoutPDF = (plan: WeeklyWorkoutPlan, profile: UserProfile): Blob => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = 0;

  const checkNewPage = (requiredSpace: number) => {
    if (yPos + requiredSpace > 280) {
      doc.addPage();
      yPos = 15;
    }
  };

  // ========== HEADER ==========
  doc.setFillColor(SECONDARY_COLOR.r, SECONDARY_COLOR.g, SECONDARY_COLOR.b);
  doc.rect(0, 0, pageWidth, 45, "F");
  
  doc.setFillColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
  doc.rect(0, 38, pageWidth, 7, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text("METAFIT", margin, 22);
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Plano de Treino Semanal Personalizado", margin, 33);

  doc.setFontSize(9);
  const currentDate = new Date().toLocaleDateString("pt-AO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.text(currentDate, pageWidth - margin, 22, { align: "right" });

  yPos = 55;

  // ========== USER INFO CARD ==========
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 4, 4, "F");
  
  doc.setDrawColor(SECONDARY_COLOR.r, SECONDARY_COLOR.g, SECONDARY_COLOR.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, pageWidth - margin * 2, 40, 4, 4, "S");

  doc.setTextColor(SECONDARY_COLOR.r, SECONDARY_COLOR.g, SECONDARY_COLOR.b);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("💪 DADOS DO UTILIZADOR", margin + 8, yPos + 10);

  doc.setTextColor(60, 60, 60);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  const col1X = margin + 8;
  const col2X = pageWidth / 2 + 5;

  doc.text(`Nome: ${profile.name || "Utilizador"}`, col1X, yPos + 20);
  if (profile.age) doc.text(`Idade: ${profile.age} anos`, col1X, yPos + 28);
  if (profile.weight) doc.text(`Peso: ${profile.weight} kg`, col1X, yPos + 36);
  
  doc.text(`Objetivo: ${GOAL_LABELS[profile.goal || ""] || profile.goal || "Não definido"}`, col2X, yPos + 20);
  if (profile.height) doc.text(`Altura: ${profile.height} cm`, col2X, yPos + 28);
  doc.text(`Nível: ${profile.activityLevel || "Moderado"}`, col2X, yPos + 36);

  yPos += 50;

  // ========== WARMUP ==========
  if (plan.warmup && plan.warmup.length > 0) {
    doc.setFillColor(255, 248, 225);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10 + plan.warmup.length * 5, 3, 3, "F");
    
    doc.setTextColor(245, 124, 0);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("🔥 AQUECIMENTO (5-10 min)", margin + 5, yPos + 7);
    
    yPos += 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    plan.warmup.forEach((exercise) => {
      doc.text(`• ${exercise}`, margin + 8, yPos);
      yPos += 5;
    });
    
    yPos += 5;
  }

  // ========== WEEKLY PLAN ==========
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  
  days.forEach((day) => {
    const dayData = plan.weeklyPlan[day as keyof typeof plan.weeklyPlan];
    if (!dayData) return;

    checkNewPage(35);

    // Day Header
    const isRestDay = dayData.focus.toLowerCase().includes("descanso");
    const headerColor = isRestDay 
      ? { r: 156, g: 163, b: 175 } 
      : { r: SECONDARY_COLOR.r, g: SECONDARY_COLOR.g, b: SECONDARY_COLOR.b };
    
    doc.setFillColor(headerColor.r, headerColor.g, headerColor.b);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 12, 2, 2, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(DAYS_PT[day].toUpperCase(), margin + 5, yPos + 8);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${dayData.focus} • ${dayData.duration}`, pageWidth - margin - 5, yPos + 8, { align: "right" });

    yPos += 16;

    if (isRestDay || !dayData.exercises || dayData.exercises.length === 0) {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10, 2, 2, "F");
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(8);
      doc.text("🧘 Dia de recuperação - Faz alongamentos leves", margin + 5, yPos + 6);
      yPos += 14;
      return;
    }

    // Exercises
    dayData.exercises.forEach((exercise, exIdx) => {
      checkNewPage(18);

      const bgColor = exIdx % 2 === 0 ? 255 : 250;
      doc.setFillColor(bgColor, bgColor, bgColor);
      doc.rect(margin, yPos - 2, pageWidth - margin * 2, 12, "F");

      doc.setTextColor(SECONDARY_COLOR.r, SECONDARY_COLOR.g, SECONDARY_COLOR.b);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`${exIdx + 1}. ${exercise.name}`, margin + 3, yPos + 3);

      doc.setTextColor(PRIMARY_COLOR.r, PRIMARY_COLOR.g, PRIMARY_COLOR.b);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`${exercise.sets} séries × ${exercise.reps}`, pageWidth - margin - 3, yPos + 3, { align: "right" });

      if (exercise.notes) {
        doc.setTextColor(120, 120, 120);
        doc.setFontSize(7);
        doc.text(`💡 ${exercise.notes}`, margin + 8, yPos + 9);
        yPos += 14;
      } else {
        yPos += 10;
      }
    });

    yPos += 4;
  });

  // ========== COOLDOWN ==========
  if (plan.cooldown && plan.cooldown.length > 0) {
    checkNewPage(25);
    
    doc.setFillColor(224, 247, 250);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 10 + plan.cooldown.length * 5, 3, 3, "F");
    
    doc.setTextColor(0, 151, 167);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("🧊 ALONGAMENTO (5-10 min)", margin + 5, yPos + 7);
    
    yPos += 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    plan.cooldown.forEach((exercise) => {
      doc.text(`• ${exercise}`, margin + 8, yPos);
      yPos += 5;
    });
    
    yPos += 5;
  }

  // ========== TIPS ==========
  if (plan.tips && plan.tips.length > 0) {
    checkNewPage(25);
    
    doc.setFillColor(255, 243, 224);
    doc.roundedRect(margin, yPos, pageWidth - margin * 2, 8 + plan.tips.length * 5, 3, 3, "F");
    
    doc.setTextColor(230, 126, 34);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("💡 DICAS DO TREINADOR", margin + 5, yPos + 6);
    
    yPos += 10;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    plan.tips.forEach((tip) => {
      doc.text(`• ${tip}`, margin + 8, yPos);
      yPos += 5;
    });
  }

  // ========== FOOTER ==========
  const footerY = doc.internal.pageSize.getHeight() - 12;
  doc.setFillColor(SECONDARY_COLOR.r, SECONDARY_COLOR.g, SECONDARY_COLOR.b);
  doc.rect(0, footerY - 3, pageWidth, 15, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "© 2024 METAFIT NUTRI • Plano gerado automaticamente • Desenvolvido por Lubatec",
    pageWidth / 2,
    footerY + 4,
    { align: "center" }
  );

  return doc.output("blob");
};

export const downloadPDF = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const shareViaWhatsApp = async (blob: Blob, filename: string, message: string) => {
  // Check if Web Share API is available with files support
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: "application/pdf" });
    
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: "Plano METAFIT",
          text: message,
          files: [file],
        });
        return true;
      } catch (error) {
        console.log("Share cancelled or failed:", error);
      }
    }
  }

  // Fallback: Download the file and open WhatsApp with message
  downloadPDF(blob, filename);
  
  // Open WhatsApp with pre-filled message
  const encodedMessage = encodeURIComponent(`${message}\n\n📥 Ficheiro PDF transferido: ${filename}`);
  window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  
  return false;
};
