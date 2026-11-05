import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import LoginForm from "../../components/auth/LoginForm";
import { authRepository } from "../../repositories/authRepository";
import AuthLayout from "../../components/layout/AuthLayout";
import type { LoginCredentials, UserRole } from "../../types/auth";

function rutaSegunRol(role: UserRole): string {
  if (role === "ADMIN") return "/admin";
  if (role === "INSTRUCTOR") return "/instructor";
  return "/usuario";
}

function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const currentUser = authRepository.getCurrentUser();

  if (currentUser) {
    return <Navigate to={rutaSegunRol(currentUser.role)} replace />;
  }

  const handleLogin = (credentials: LoginCredentials) => {
    setError("");

    const user = authRepository.login(credentials);

    if (!user) {
      setError("El NIT o la contraseña son incorrectos.");
      return;
    }

    navigate(rutaSegunRol(user.role), { replace: true });
  };

  const handleAdminLogin = () => {
    const admin = authRepository.loginAsAdmin();
    navigate(rutaSegunRol(admin.role), { replace: true });
  };

  return (
  <AuthLayout subtitle="Sistema de control">
    <LoginForm error={error} onSubmit={handleLogin} />

    <button
      type="button"
      className="auth-secondary"
      onClick={handleAdminLogin}
    >
      Entrar como administrador
    </button>

    <button
      type="button"
      className="auth-secondary"
      onClick={() => navigate("/registro")}
    >
      Crear cuenta
    </button>
  </AuthLayout>
);
}

export default LoginPage;