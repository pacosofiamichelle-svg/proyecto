import { useEffect, useState } from "react";
import { trainingPlanRepository } from "../../repositories/trainingPlanRepository";
import type { WeeklyPlan } from "../../types/trainingPlan";

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
    ? new Date(plan.updatedAt).toLocaleString("es-BO")
    : "Plan inicial";

  return (
    <section>
      <h2>Mi calendario semanal</h2>
      <p>Última actualización: {updatedAt} · {plan.updatedBy}</p>

      <div>
        {plan.days.map((day) => (
          <article key={day.id}>
            <h3>{day.day}: {day.muscle}</h3>
            <p><strong>Ejercicios:</strong> {day.exercises}</p>
            <p><strong>Equipo:</strong> {day.equipment}</p>
            <p><strong>Sugerencia:</strong> {day.suggestions}</p>
          </article>
        ))}
      </div>
    </section>
  );
}