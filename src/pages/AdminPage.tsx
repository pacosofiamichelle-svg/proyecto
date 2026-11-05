import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import InstructorManager from "../components/admin/InstructorManager";
import MemberManager from "../components/admin/MemberManager";
import { authRepository } from "../repositories/authRepository";
import { gymRepository } from "../repositories/gymRepository";
import type { GymInstructor, GymMember } from "../types/gym";

export default function AdminPage() {
  const navigate = useNavigate();
  const admin = authRepository.getCurrentUser();

  const [users, setUsers] = useState(() => gymRepository.getUsers());
  const [instructors, setInstructors] = useState(() =>
    gymRepository.getInstructors()
  );

  if (!admin || admin.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    authRepository.logout();
    navigate("/login", { replace: true });
  }

  function addInstructor(instructor: GymInstructor): string | null {
    const duplicate =
      instructors.some((item) => item.nit === instructor.nit) ||
      users.some((item) => item.nit === instructor.nit);

    if (duplicate) return "Ese NIT ya está registrado.";

    const updated = [...instructors, instructor];
    setInstructors(updated);
    gymRepository.saveInstructors(updated);
    return null;
  }

  function removeInstructor(nit: string) {
    if (!window.confirm("¿Quieres quitar a este instructor?")) return;

    const updatedInstructors = instructors.filter((item) => item.nit !== nit);
    const updatedUsers = users.map((user) =>
      user.instructor === nit ? { ...user, instructor: "" } : user
    );

    setInstructors(updatedInstructors);
    setUsers(updatedUsers);
    gymRepository.saveInstructors(updatedInstructors);
    gymRepository.saveUsers(updatedUsers);
  }

  function updateUser(nit: string, changes: Partial<GymMember>) {
    const updated = users.map((user) =>
      user.nit === nit ? { ...user, ...changes } : user
    );

    setUsers(updated);
    gymRepository.saveUsers(updated);
  }

  return (
    <DashboardLayout
      title="Administración"
      subtitle="Control de usuarios e instructores"
      onLogout={handleLogout}
    >
      <InstructorManager
        instructors={instructors}
        onCreate={addInstructor}
        onRemove={removeInstructor}
      />

      <MemberManager
        users={users}
        instructors={instructors}
        onUpdateUser={updateUser}
      />
    </DashboardLayout>
  );
}