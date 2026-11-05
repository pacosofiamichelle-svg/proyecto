import type { GymMember } from "../types/gym";

export const MEMBERSHIP_PLANS = {
  "Membresía mensual": { meses: 1, clases: 20 },
  "Membresía trimestral": { meses: 3, clases: 60 },
  "Membresía semestral": { meses: 6, clases: 120 },
};

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDay));
  return result;
}

export function createMembershipUpdate(
  planName: string
): Partial<GymMember> {
  const plan = MEMBERSHIP_PLANS[planName as keyof typeof MEMBERSHIP_PLANS];

  if (!plan) {
    return {
      tipoMembresia: "Sin asignar",
      fechaInscripcion: "",
      fechaFin: "",
      totalClases: 0,
      clasesAsistidas: 0,
    };
  }

  const start = new Date();
  const end = addMonths(start, plan.meses);

  return {
    tipoMembresia: planName,
    fechaInscripcion: formatDate(start),
    fechaFin: formatDate(end),
    totalClases: plan.clases,
    clasesAsistidas: 0,
  };
}

export function createAttendanceUpdate(
  user: GymMember
): Partial<GymMember> | null {
  const attended = user.clasesAsistidas ?? 0;
  const total = user.totalClases ?? 0;

  if (attended >= total) return null;

  const now = new Date();
  const attendance = {
    fecha: formatDate(now),
    hora: now.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    actividad: "Entrenamiento",
    estado: "Presente",
  };

  return {
    clasesAsistidas: attended + 1,
    asistencias: [attendance, ...(user.asistencias ?? [])],
  };
}