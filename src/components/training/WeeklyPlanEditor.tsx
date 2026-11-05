import { useState, type FormEvent } from "react";
import { trainingPlanRepository } from "../../repositories/trainingPlanRepository";
import type { TrainingDay } from "../../types/trainingPlan";

interface Props {
  instructorName: string;
}

type EditableField = "muscle" | "exercises" | "equipment" | "suggestions";

const fields: { key: EditableField; label: string }[] = [
  { key: "muscle", label: "Grupo muscular" },
  { key: "exercises", label: "Ejercicios" },
  { key: "equipment", label: "Máquinas o herramientas" },
  { key: "suggestions", label: "Sugerencias" },
];

export default function WeeklyPlanEditor({ instructorName }: Props) {
  const [days, setDays] = useState<TrainingDay[]>(
    () => trainingPlanRepository.get().days
  );
  const [message, setMessage] = useState("");

  function updateDay(id: string, field: EditableField, value: string) {
    setDays((current) =>
      current.map((day) => (day.id === id ? { ...day, [field]: value } : day))
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trainingPlanRepository.save(days, instructorName);
    setMessage("Plan guardado. El calendario del usuario ya está actualizado.");
  }

  return (
    <section>
      <h2>Editar plan semanal</h2>

      <form onSubmit={handleSubmit}>
        {days.map((day) => (
          <fieldset key={day.id}>
            <legend>{day.day}</legend>

            {fields.map((field) => (
              <label key={field.key}>
                {field.label}
                <textarea
                  rows={field.key === "muscle" ? 1 : 2}
                  value={day[field.key]}
                  onChange={(event) =>
                    updateDay(day.id, field.key, event.target.value)
                  }
                />
              </label>
            ))}
          </fieldset>
        ))}

        <button type="submit">Guardar plan semanal</button>
        {message && <p role="status">{message}</p>}
      </form>
    </section>
  );
}