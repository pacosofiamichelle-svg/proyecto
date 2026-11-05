export interface Attendance {
  fecha: string;
  hora: string;
  actividad: string;
  estado: string;
}

export interface GymMember {
  nit: string;
  password?: string;
  nombre: string;
  fechaInscripcion?: string;
  fechaFin?: string;
  tipoMembresia?: string;
  totalClases?: number;
  clasesAsistidas?: number;
  pagoEstado?: string;
  instructor?: string;
  progresos?: ProgressEntry[];
  asistencias?: Attendance[];
}

export interface GymInstructor {
  nombre: string;
  nit: string;
  password: string;
  turno: string;
}
export interface ProgressEntry {
  id: string;
  fecha: string;
  nota: string;
  instructor: string;
}