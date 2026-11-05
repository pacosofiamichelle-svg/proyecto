import { useState } from "react";
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

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function MemberManager({
  users,
  instructors,
  onUpdateUser,
}: Props) {
  const [search, setSearch] = useState("");

  const filteredUsers = users.filter((user) =>
    normalize(`${user.nombre} ${user.nit}`).includes(normalize(search.trim()))
  );

  function assignPlan(nit: string, planName: string) {
    onUpdateUser(nit, createMembershipUpdate(planName));
  }

  function markAttendance(user: GymMember) {
    const changes = createAttendanceUpdate(user);
    if (changes) onUpdateUser(user.nit, changes);
  }

  return (
    <section className="member-management">
      <div className="member-toolbar">
        <div>
          <h2>Usuarios registrados</h2>
          <p>Mostrando {filteredUsers.length} de {users.length}</p>
        </div>

        <input
          className="member-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o NIT..."
          aria-label="Buscar usuario por nombre o NIT"
        />
      </div>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : filteredUsers.length === 0 ? (
        <p>No se encontraron usuarios con esa búsqueda.</p>
      ) : (
        <div className="member-grid">
          {filteredUsers.map((user) => (
            <article className="member-card" key={user.nit}>
              <h3>{user.nombre}</h3>
              <p className="member-nit">NIT {user.nit}</p>

              <label>
                Membresía
                <select
                  value={user.tipoMembresia ?? "Sin asignar"}
                  onChange={(event) =>
                    assignPlan(user.nit, event.target.value)
                  }
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
                    onUpdateUser(user.nit, {
                      pagoEstado: event.target.value,
                    })
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
                    onUpdateUser(user.nit, {
                      instructor: event.target.value,
                    })
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

              <div className="member-footer">
                <span>
                  Clases {user.clasesAsistidas ?? 0}/{user.totalClases ?? 0}
                </span>
                {user.fechaFin && <span>Vence {user.fechaFin}</span>}
              </div>

              <button
                className="member-attendance-button"
                type="button"
                disabled={
                  (user.clasesAsistidas ?? 0) >= (user.totalClases ?? 0)
                }
                onClick={() => markAttendance(user)}
              >
                Marcar asistencia
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}