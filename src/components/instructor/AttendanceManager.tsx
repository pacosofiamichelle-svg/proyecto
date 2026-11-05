import { useEffect, useState, type FormEvent } from "react";
import { gymRepository } from "../../repositories/gymRepository";
import { createAttendanceUpdate } from "../../services/gymService";
import type { GymMember } from "../../types/gym";

interface Props {
  instructorName: string;
}

export default function AttendanceManager({ instructorName }: Props) {
  const [users, setUsers] = useState<GymMember[]>(() =>
    gymRepository.getUsers()
  );
  const [selectedNit, setSelectedNit] = useState(
    () => gymRepository.getUsers()[0]?.nit ?? ""
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    function refreshUsers() {
      const latestUsers = gymRepository.getUsers();
      setUsers(latestUsers);

      setSelectedNit((currentNit) =>
        latestUsers.some((user) => user.nit === currentNit)
          ? currentNit
          : latestUsers[0]?.nit ?? ""
      );
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === "gofit_usuarios") refreshUsers();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("gofit-usuarios-actualizados", refreshUsers);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("gofit-usuarios-actualizados", refreshUsers);
    };
  }, []);

  const selectedUser = users.find((user) => user.nit === selectedNit);
  const remainingClasses = selectedUser
    ? (selectedUser.totalClases ?? 0) - (selectedUser.clasesAsistidas ?? 0)
    : 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedUser) return;

    const changes = createAttendanceUpdate(selectedUser);

    if (!changes) {
      setMessage("Este usuario no tiene clases disponibles.");
      return;
    }

    const updatedUsers = users.map((user) =>
      user.nit === selectedUser.nit ? { ...user, ...changes } : user
    );

    setUsers(updatedUsers);
    gymRepository.saveUsers(updatedUsers);
    setMessage(`Asistencia registrada para ${selectedUser.nombre}.`);
  }

  return (
    <section className="instructor-tool-card instructor-attendance">
      <span className="training-eyebrow">CONTROL DE ASISTENCIA</span>
      <h2>Registrar asistencia</h2>
      <p>Instructor: {instructorName}</p>

      {users.length === 0 ? (
        <p>No hay usuarios registrados.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>
            Seleccionar usuario
            <select
              value={selectedNit}
              onChange={(event) => {
                setSelectedNit(event.target.value);
                setMessage("");
              }}
              required
            >
              {users.map((user) => (
                <option key={user.nit} value={user.nit}>
                  {user.nombre} · NIT {user.nit}
                </option>
              ))}
            </select>
          </label>

          {selectedUser && (
            <p className="attendance-remaining">
              Clases disponibles: {Math.max(remainingClasses, 0)}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedUser || remainingClasses <= 0}
          >
            Registrar asistencia
          </button>

          {message && <p role="status">{message}</p>}
        </form>
      )}
    </section>
  );
}