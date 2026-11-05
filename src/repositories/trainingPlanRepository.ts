import { storageService } from "../services/storageService";
import type { TrainingDay, WeeklyPlan } from "../types/trainingPlan";

const PLAN_KEY = "gofit_plan_semanal";

const planInicial: TrainingDay[] = [
  { id: "lunes", day: "Lunes", muscle: "Glúteos", exercises: "Hip thrust, sentadillas", equipment: "Barra, banco, mancuernas", suggestions: "Calentar antes de empezar." },
  { id: "martes", day: "Martes", muscle: "Brazos", exercises: "Curl de bíceps, extensión de tríceps", equipment: "Mancuernas, polea", suggestions: "Usar un peso que permita mantener buena técnica." },
  { id: "miercoles", day: "Miércoles", muscle: "Espalda", exercises: "Jalón al pecho, remo", equipment: "Polea alta, máquina de remo", suggestions: "Mantener la espalda recta." },
  { id: "jueves", day: "Jueves", muscle: "Piernas", exercises: "Prensa, extensión de piernas", equipment: "Prensa, máquina de piernas", suggestions: "Ajustar el peso al nivel de cada persona." },
  { id: "viernes", day: "Viernes", muscle: "Pecho y hombros", exercises: "Press de pecho, elevaciones laterales", equipment: "Banco, mancuernas", suggestions: "Controlar el movimiento." },
  { id: "sabado", day: "Sábado", muscle: "Cardio y abdomen", exercises: "Bicicleta, plancha", equipment: "Bicicleta, colchoneta", suggestions: "Hidratarse durante la sesión." },
  { id: "domingo", day: "Domingo", muscle: "Descanso", exercises: "Descanso o movilidad suave", equipment: "Colchoneta", suggestions: "Priorizar la recuperación." },
];

export const trainingPlanRepository = {
  get(): WeeklyPlan {
    const saved = storageService.get<WeeklyPlan>(PLAN_KEY);

    return saved ?? {
      days: planInicial,
      updatedAt: "",
      updatedBy: "Plan inicial",
    };
  },

  save(days: TrainingDay[], instructorName: string): WeeklyPlan {
    const plan: WeeklyPlan = {
      days,
      updatedAt: new Date().toISOString(),
      updatedBy: instructorName,
    };

    storageService.set(PLAN_KEY, plan);
    window.dispatchEvent(new Event("gofit-plan-actualizado"));

    return plan;
  },
};