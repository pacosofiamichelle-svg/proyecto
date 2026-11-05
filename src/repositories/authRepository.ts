import initialUsers from "../data/users.json";
import { storageService } from "../services/storageService";
import type { LoginCredentials, User } from "../types/auth";

const SESSION_KEY = "gofit_sesion";
const USERS_KEY = "gofit_usuarios";
const INSTRUCTORS_KEY = "gofit_instructores";

type StoredRecord = {
  id?: string;
  nit?: string;
  carnet?: string;
  nombre?: string;
  name?: string;
  password?: string;
  turno?: string;

  tipoMembresia?: string;
  totalClases?: number;
  clasesAsistidas?: number;
  pagoEstado?: string;
  instructor?: string;
  asistencias?: {
    fecha: string;
    hora: string;
    actividad: string;
    estado: string;
  }[];
};
const demoUsers = initialUsers as StoredRecord[];

function normalizeNit(value: string | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

function toUser(record: StoredRecord, role: User["role"]): User {
  const nit = normalizeNit(record.nit ?? record.carnet);

  return {
    id: record.id ?? nit,
    name: record.nombre ?? record.name ?? "Usuario",
    carnet: nit,
    role,
    turno: record.turno,
  };
}

function readOldSession(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  let saved: unknown = raw;

  try {
    saved = JSON.parse(raw);
  } catch {
    // Las sesiones antiguas guardaban el NIT como texto sin JSON.
  }

  if (saved && typeof saved === "object") {
    return saved as User;
  }

  if (typeof saved !== "string") return null;

  if (saved === "ADMIN") {
    return {
      id: "admin",
      name: "Administrador",
      carnet: "",
      role: "ADMIN",
    };
  }

  if (saved.startsWith("INSTRUCTOR:")) {
    const nitSesion = normalizeNit(saved.replace("INSTRUCTOR:", ""));
    const instructores =
      storageService.get<StoredRecord[]>(INSTRUCTORS_KEY) ?? [];
    const instructor = instructores.find(
      (item) => normalizeNit(item.nit) === nitSesion
    );

    return instructor ? toUser(instructor, "INSTRUCTOR") : null;
  }

  const usuarios =
  storageService.get<StoredRecord[]>(USERS_KEY) ?? [];
  const usuario = usuarios.find(
    (item) => normalizeNit(item.nit ?? item.carnet) === normalizeNit(saved as string)
  );

  return usuario ? toUser(usuario, "USUARIO") : null;
}

export const authRepository = {
  register(data: { nombre: string; nit: string; password: string }): string | null {
    const nit = normalizeNit(data.nit);
    const nombre = data.nombre.trim();

    const users = storageService.get<StoredRecord[]>(USERS_KEY) ?? [];
    const instructors =
      storageService.get<StoredRecord[]>(INSTRUCTORS_KEY) ?? [];

    if (!nombre || !nit || !data.password) {
      return "Completa todos los campos.";
    }

    const alreadyExists = [...users, ...instructors].some(
      (item) => normalizeNit(item.nit ?? item.carnet) === nit
    );

    if (alreadyExists) {
      return "Ese NIT ya está registrado.";
    }

    users.push({
      nit,
      nombre,
      password: data.password,
      tipoMembresia: "Sin asignar",
      totalClases: 0,
      clasesAsistidas: 0,
      pagoEstado: "Pendiente",
      instructor: "",
      asistencias: [],
    });

    storageService.set(USERS_KEY, users);
    return null;
  },
  login(credentials: LoginCredentials): User | null {
    const nit = normalizeNit(credentials.carnet);

    const instructores =
      storageService.get<StoredRecord[]>(INSTRUCTORS_KEY) ?? [];
    const instructor = instructores.find(
      (item) => normalizeNit(item.nit) === nit
    );

    if (instructor) {
      if (instructor.password !== credentials.password) return null;

      const user = toUser(instructor, "INSTRUCTOR");
      storageService.set(SESSION_KEY, `INSTRUCTOR:${nit}`);
      return user;
    }

    const usuarios =
      storageService.get<StoredRecord[]>(USERS_KEY) ?? demoUsers;
    const usuario = usuarios.find(
      (item) => normalizeNit(item.nit ?? item.carnet) === nit
    );

    if (!usuario || usuario.password !== credentials.password) return null;

    const user = toUser(usuario, "USUARIO");
    storageService.set(SESSION_KEY, user);
    return user;
  },

  loginAsAdmin(): User {
    const admin: User = {
      id: "admin",
      name: "Administrador",
      carnet: "",
      role: "ADMIN",
    };

    storageService.set(SESSION_KEY, admin);
    return admin;
  },

  logout(): void {
    storageService.remove(SESSION_KEY);
  },

  getCurrentUser(): User | null {
    return readOldSession();
  },

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  },
};