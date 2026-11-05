import { Navigate, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProgressHistory from "../components/user/ProgressHistory";
import WeeklyPlanView from "../components/training/WeeklyPlanView";
import { authRepository } from "../repositories/authRepository";

export default function UserPage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();

  if (!user || user.role !== "USUARIO") {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    authRepository.logout();
    navigate("/login", { replace: true });
  }

  return (
    <DashboardLayout
      title={`Hola, ${user.name}`}
      subtitle="Tu calendario y seguimiento"
      onLogout={handleLogout}
    >
      <WeeklyPlanView />
      <ProgressHistory userNit={user.carnet} />
    </DashboardLayout>
  );
}