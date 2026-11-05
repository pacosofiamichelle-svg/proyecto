import { useState, type FormEvent } from "react";
import { gymRepository } from "../../repositories/gymRepository";
import type { GymMember, ProgressEntry } from "../../types/gym";

interface Props {
  instructorName: string;
}

export default function ProgressManager({ instructorName }: Props) {
  const [users, setUsers] = useState<GymMember[]>(() =>
    gymRepository.getUsers()
  );
  const [selectedNit, setSelectedNit] = useState(
    () => gymRepository.getUsers()[0]?.nit ?? ""
  );
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = users.find((item) => item.nit === selectedNit);
    if (!user || !note.trim()) return;

    const progress: ProgressEntry = {
      id: String(Date.now()),
      fecha: new Date().toLocaleDateString("es-BO"),
      nota: note.trim(),
      instructor: instructorName,
    };

    const updatedUsers = users.map((item) =>
      item.nit === selectedNit
        ? { ...item, progresos: [progress, ...(item.progresos ?? [])] }
        : item
    );

    setUsers(updatedUsers);
    gymRepository.saveUsers(updatedUsers);
    setNote("");
    setMessage(`Progreso guardado para ${user.nombre}.`);
  }

  return (
    <section>
      <h2>Registrar progreso</h2>

      {users.length === 0 ? (
        <p>Aún no hay usuarios registrados.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Usuario
            <select
              value={selectedNit}
              onChange={(event) => setSelectedNit(event.target.value)}
              required
            >
              {users.map((user) => (
                <option key={user.nit} value={user.nit}>
                  {user.nombre} · NIT {user.nit}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nota de progreso
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Describe avances, observaciones o próximos objetivos"
              rows={4}
              required
            />
          </label>

          <button type="submit">Guardar progreso</button>
          {message && <p role="status">{message}</p>}
        </form>
      )}
    </section>
  );
}