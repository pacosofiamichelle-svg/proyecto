import { useState } from "react";
import { useNavigate } from "react-router-dom";

import RegisterForm from "../../components/auth/RegisterForm";
import type { RegisterData } from "../../components/auth/RegisterForm";
import { authRepository } from "../../repositories/authRepository";
import AuthLayout from "../../components/layout/AuthLayout";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleRegister(data: RegisterData): boolean {
    setError("");
    setSuccess(false);

    if (data.password !== data.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return false;
    }

    const result = authRepository.register({
      nombre: data.nombre,
      nit: data.nit,
      password: data.password,
    });

    if (result) {
      setError(result);
      return false;
    }

    setSuccess(true);
    return true;
  }

  return (
  <AuthLayout subtitle="Nueva inscripción">
    <RegisterForm error={error} onSubmit={handleRegister} />

    {success && (
      <p role="status">
        Cuenta creada. El administrador asignará tu membresía.
      </p>
    )}

    <button
      type="button"
      className="auth-secondary"
      onClick={() => navigate("/login")}
    >
      Volver al inicio de sesión
    </button>
  </AuthLayout>
);
}