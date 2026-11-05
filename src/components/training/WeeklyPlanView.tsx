import { useEffect, useState } from "react";
import { trainingPlanRepository } from "../../repositories/trainingPlanRepository";
import "../../styles/training.css";
import type { WeeklyPlan } from "../../types/trainingPlan";
import "../../styles/training.css";

export default function WeeklyPlanView() {
  const [plan, setPlan] = useState<WeeklyPlan>(() =>
    trainingPlanRepository.get()
  );

  useEffect(() => {
    function refreshPlan() {
      setPlan(trainingPlanRepository.get());
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === "gofit_plan_semanal") refreshPlan();
    }

    window.addEventListener("gofit-plan-actualizado", refreshPlan);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("gofit-plan-actualizado", refreshPlan);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updatedAt = plan.updatedAt
    ? new Date(plan.updatedAt).toLocaleString("es-BO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Plan inicial";

  return (
    <section className="training-section">
      <div className="training-heading">
        <div>
          <span className="training-eyebrow">TU RUTINA</span>
          <h2>Plan semanal</h2>
          <p>Consulta los ejercicios y el equipo recomendado para cada día.</p>
        </div>

        <div className="training-updated">
          <span>Última actualización</span>
          <strong>{updatedAt}</strong>
          <small>{plan.updatedBy || "Equipo GOFIT"}</small>
        </div>
      </div>

      <div className="training-grid">
        {plan.days.map((day, index) => (
          <article className="training-card" key={day.id}>
            <div className="training-card-header">
              <span className="training-day-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="training-day-name">{day.day}</span>
            </div>

            <h3>{day.muscle || "Grupo muscular por definir"}</h3>

            <div className="training-detail">
              <strong>Ejercicios</strong>
              <p>{day.exercises || "Aún no especificados."}</p>
            </div>

            <div className="training-detail">
              <strong>Máquinas y herramientas</strong>
              <p>{day.equipment || "Aún no especificadas."}</p>
            </div>

            {day.suggestions && (
              <div className="training-suggestion">
                <strong>Sugerencia</strong>
                <p>{day.suggestions}</p>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}