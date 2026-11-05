import type { GymInstructor, GymMember } from "../../types/gym";
import {
  createAttendanceUpdate,
  createMembershipUpdate,
  MEMBERSHIP_PLANS,
} from "../../services/gymService";

interface Props {
  users: GymMember[];
  instructors: GymInstructor[];
  onUpdateUser: (nit: string, changes: Partial<GymMember>) => void;
}

export default function MemberManager({
  users,
  instructors,
  onUpdateUser,
}: Props) {
  function assignPlan(nit: string, planName: string) {
    onUpdateUser(nit, createMembershipUpdate(planName));
  }

  function markAttendance(user: GymMember) {
    const changes = createAttendanceUpdate(user);
    if (changes) onUpdateUser(user.nit, changes);
  }

  return (
    <section>
      <h2>Usuarios registrados</h2>

      {users.length === 0 && <p>No hay usuarios registrados.</p>}

      {users.map((user) => (
        <article key={user.nit}>
          <h3>{user.nombre} · NIT {user.nit}</h3>

          <label>
            Membresía
            <select
              value={user.tipoMembresia ?? "Sin asignar"}
              onChange={(event) => assignPlan(user.nit, event.target.value)}
            >
              <option>Sin asignar</option>
              {Object.keys(MEMBERSHIP_PLANS).map((plan) => (
                <option key={plan}>{plan}</option>
              ))}
            </select>
          </label>

          <label>
            Pago
            <select
              value={user.pagoEstado ?? "Pendiente"}
              onChange={(event) =>
                onUpdateUser(user.nit, { pagoEstado: event.target.value })
              }
            >
              <option>Pagada</option>
              <option>Pendiente</option>
            </select>
          </label>

          <label>
            Instructor
            <select
              value={
                instructors.some(
                  (instructor) => instructor.nit === user.instructor
                )
                  ? user.instructor
                  : ""
              }
              onChange={(event) =>
                onUpdateUser(user.nit, { instructor: event.target.value })
              }
            >
              <option value="">Sin asignar</option>
              {instructors.map((instructor) => (
                <option key={instructor.nit} value={instructor.nit}>
                  {instructor.nombre} ({instructor.turno})
                </option>
              ))}
            </select>
          </label>

          <p>
            Asistencias: {user.clasesAsistidas ?? 0} / {user.totalClases ?? 0}
            {user.fechaFin ? ` · Vence: ${user.fechaFin}` : ""}
          </p>

          <button
            type="button"
            disabled={(user.clasesAsistidas ?? 0) >= (user.totalClases ?? 0)}
            onClick={() => markAttendance(user)}
          >
            Marcar asistencia
          </button>
        </article>
      ))}
    </section>
  );
}