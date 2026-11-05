import { Navigate, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ProgressManager from "../components/instructor/ProgressManager";
import WeeklyPlanEditor from "../components/training/WeeklyPlanEditor";
import { authRepository } from "../repositories/authRepository";
import AttendanceManager from "../components/instructor/AttendanceManager";

export default function InstructorPage() {
  const navigate = useNavigate();
  const user = authRepository.getCurrentUser();

  if (!user || user.role !== "INSTRUCTOR") {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    authRepository.logout();
    navigate("/login", { replace: true });
  }

  return (
    <DashboardLayout
      title={`Hola, ${user.name}`}
      subtitle={`Panel de instructor · Turno ${user.turno ?? "sin especificar"}`}
      onLogout={handleLogout}
    >
      <WeeklyPlanEditor instructorName={user.name} />
      <div className="instructor-tools-grid">
  <ProgressManager instructorName={user.name} />
  <AttendanceManager instructorName={user.name} />
      </div>
    </DashboardLayout>
  );
}