import { storageService } from "../services/storageService";
import type { GymInstructor, GymMember } from "../types/gym";

const USERS_KEY = "gofit_usuarios";
const INSTRUCTORS_KEY = "gofit_instructores";

export const gymRepository = {
  getUsers(): GymMember[] {
    return storageService.get<GymMember[]>(USERS_KEY) ?? [];
  },

  saveUsers(users: GymMember[]): void {
    storageService.set(USERS_KEY, users);
    window.dispatchEvent(new Event("gofit-usuarios-actualizados"));
  },

  getInstructors(): GymInstructor[] {
    return storageService.get<GymInstructor[]>(INSTRUCTORS_KEY) ?? [];
  },

  saveInstructors(instructors: GymInstructor[]): void {
    storageService.set(INSTRUCTORS_KEY, instructors);
    window.dispatchEvent(new Event("gofit-instructores-actualizados"));
  },
};