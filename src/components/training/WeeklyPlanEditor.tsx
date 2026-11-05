import { useState, type FormEvent } from "react";
import { trainingPlanRepository } from "../../repositories/trainingPlanRepository";
import type { TrainingDay } from "../../types/trainingPlan";
import "../../styles/training.css";

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
    setMessage("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trainingPlanRepository.save(days, instructorName);
    setMessage("Plan guardado y actualizado para los usuarios.");
  }

  return (
    <section className="training-section training-editor">
      <div className="training-heading">
        <div>
          <span className="training-eyebrow">PLAN DE ENTRENAMIENTO</span>
          <h2>Editar plan semanal</h2>
          <p>Actualiza los ejercicios, el equipo y las sugerencias de cada día.</p>
        </div>
      </div>

      <form className="plan-editor" onSubmit={handleSubmit}>
        <div className="training-editor-grid">
          {days.map((day, index) => (
            <fieldset className="training-editor-day" key={day.id}>
              <legend>
                <span className="training-day-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {day.day}
              </legend>

              {fields.map((field) => (
                <label className="training-editor-label" key={field.key}>
                  {field.label}
                  <textarea
                    rows={field.key === "muscle" ? 1 : 3}
                    value={day[field.key]}
                    onChange={(event) =>
                      updateDay(day.id, field.key, event.target.value)
                    }
                  />
                </label>
              ))}
            </fieldset>
          ))}
        </div>

        <div className="training-editor-actions">
          <button className="training-save-button" type="submit">
            Guardar cambios del plan
          </button>

          {message && <p role="status">{message}</p>}
        </div>
      </form>
    </section>
  );
}