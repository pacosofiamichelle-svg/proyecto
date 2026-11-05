export type UserRole = "ADMIN" | "INSTRUCTOR" | "USUARIO";

export interface User {
  id: string;
  name: string;
  carnet: string;
  role: UserRole;
  turno?: string;
}

export interface UserRecord extends User {
  password: string;
  nit?: string;
}

export interface LoginCredentials {
  carnet: string;
  password: string;
}

export interface LoginCredentials {
  carnet: string;
  password: string;
}
