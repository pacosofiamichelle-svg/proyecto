import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AdminPage from "../pages/AdminPage";
import InstructorPage from "../pages/InstructorPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import UserPage from "../pages/UserPage";
import { authRepository } from "../repositories/authRepository";

function HomeRedirect() {
  const user = authRepository.getCurrentUser();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "INSTRUCTOR") return <Navigate to="/instructor" replace />;

  return <Navigate to="/usuario" replace />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/instructor" element={<InstructorPage />} />
        <Route path="/usuario" element={<UserPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}