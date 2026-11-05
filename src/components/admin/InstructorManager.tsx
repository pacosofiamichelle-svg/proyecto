import { useState, type FormEvent } from "react";
import type { GymInstructor } from "../../types/gym";

interface Props {
  instructors: GymInstructor[];
  onCreate: (instructor: GymInstructor) => string | null;
  onRemove: (nit: string) => void;
}

export default function InstructorManager({
  instructors,
  onCreate,
  onRemove,
}: Props) {
  const [error, setError] = useState("");

  const morningCount = instructors.filter(
    (item) => item.turno.toLowerCase().includes("mañana")
  ).length;

  const afternoonCount = instructors.filter(
    (item) => item.turno.toLowerCase().includes("tarde")
  ).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);

    const instructor: GymInstructor = {
      nombre: String(data.get("nombre")).trim(),
      nit: String(data.get("nit")).replace(/\D/g, ""),
      password: String(data.get("password")),
      turno: String(data.get("turno")),
    };

    const result = onCreate(instructor);

    if (result) {
      setError(result);
      return;
    }

    form.reset();
  }

  return (
    <section className="instructor-management">
      <h2>Gestión de instructores</h2>

      <div className="instructor-manager-grid">
        <div className="instructor-form-panel">
          <h3>Registrar instructor</h3>

          <form onSubmit={handleSubmit}>
            <label>
              Nombre
              <input name="nombre" autoComplete="name" required />
            </label>

            <label>
              NIT
              <input name="nit" inputMode="numeric" required />
            </label>

            <label>
              Contraseña
              <input
                name="password"
                type="password"
                minLength={4}
                required
              />
            </label>

            <label>
              Turno
              <select name="turno">
                <option>Mañana</option>
                <option>Tarde</option>
              </select>
            </label>

            {error && <p className="instructor-form-error" role="alert">{error}</p>}

            <button type="submit">Registrar instructor</button>
          </form>
        </div>

        <aside className="instructor-summary">
          <span className="training-eyebrow">COBERTURA DE TURNOS</span>
          <h3>Equipo actual</h3>

          <div className="instructor-shift-stats">
            <div>
              <span>Mañana</span>
              <strong>{morningCount}</strong>
              <small>{morningCount === 1 ? "instructor" : "instructores"}</small>
            </div>

            <div>
              <span>Tarde</span>
              <strong>{afternoonCount}</strong>
              <small>{afternoonCount === 1 ? "instructor" : "instructores"}</small>
            </div>
          </div>

          <p>Total registrado: <strong>{instructors.length}</strong></p>
        </aside>
      </div>

      <div className="instructor-list">
        <h3>Instructores registrados</h3>

        {instructors.length === 0 ? (
          <p>Aún no hay instructores registrados.</p>
        ) : (
          <div className="instructor-card-grid">
            {instructors.map((instructor) => (
              <article className="instructor-card" key={instructor.nit}>
                <div>
                  <h4>{instructor.nombre}</h4>
                  <p>NIT {instructor.nit}</p>
                  <p>Turno: {instructor.turno}</p>
                  <p>Contraseña: {instructor.password}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(instructor.nit)}
                >
                  Quitar
                </button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}