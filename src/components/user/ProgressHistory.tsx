import { useEffect, useState } from "react";
import { gymRepository } from "../../repositories/gymRepository";
import type { ProgressEntry } from "../../types/gym";

interface Props {
  userNit: string;
}

export default function ProgressHistory({ userNit }: Props) {
  const [entries, setEntries] = useState<ProgressEntry[]>([]);

  useEffect(() => {
    function refresh() {
      const user = gymRepository
        .getUsers()
        .find((item) => item.nit === userNit);

      setEntries(user?.progresos ?? []);
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === "gofit_usuarios") refresh();
    }

    refresh();
    window.addEventListener("gofit-usuarios-actualizados", refresh);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("gofit-usuarios-actualizados", refresh);
      window.removeEventListener("storage", handleStorage);
    };
  }, [userNit]);

  return (
    <section>
      <h2>Mi progreso</h2>

      {entries.length === 0 ? (
        <p>Aún no hay notas de progreso.</p>
      ) : (
        entries.map((entry) => (
          <article key={entry.id}>
            <p>{entry.fecha} · Instructor: {entry.instructor}</p>
            <p>{entry.nota}</p>
          </article>
        ))
      )}
    </section>
  );
}