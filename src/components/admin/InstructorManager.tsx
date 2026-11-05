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
    <section>
      <h2>Registrar instructor</h2>

      <form onSubmit={handleSubmit}>
        <label>
          Nombre
          <input name="nombre" required />
        </label>

        <label>
          NIT
          <input name="nit" inputMode="numeric" required />
        </label>

        <label>
          Contraseña
          <input name="password" type="password" required />
        </label>

        <label>
          Turno
          <select name="turno">
            <option>Mañana</option>
            <option>Tarde</option>
          </select>
        </label>

        <button type="submit">Registrar instructor</button>
        {error && <p role="alert">{error}</p>}
      </form>

      <h3>Instructores registrados</h3>

      {instructors.map((instructor) => (
        <article key={instructor.nit}>
          <p>
            {instructor.nombre} · NIT {instructor.nit} · Turno {instructor.turno}
          </p>
          <p>Contraseña: {instructor.password}</p>
          <button type="button" onClick={() => onRemove(instructor.nit)}>
            Quitar
          </button>
        </article>
      ))}
    </section>
  );
}