import type { FormEvent } from "react";

export interface RegisterData {
  nombre: string;
  nit: string;
  password: string;
  confirmPassword: string;
}

interface Props {
  error: string;
  onSubmit: (data: RegisterData) => boolean;
}

export default function RegisterForm({ error, onSubmit }: Props) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    const saved = onSubmit({
      nombre: String(data.get("nombre")),
      nit: String(data.get("nit")),
      password: String(data.get("password")),
      confirmPassword: String(data.get("confirmPassword")),
    });

    if (saved) form.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Crear cuenta GOFIT</h1>

      {error && <p role="alert">{error}</p>}

      <label>
        Nombre completo
        <input name="nombre" autoComplete="name" required minLength={3} />
      </label>

      <label>
        NIT
        <input
          name="nit"
          inputMode="numeric"
          autoComplete="username"
          pattern="[0-9]+"
          required
        />
      </label>

      <label>
        Contraseña
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={4}
          required
        />
      </label>

      <label>
        Confirmar contraseña
        <input
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={4}
          required
        />
      </label>

      <button type="submit">Crear cuenta</button>
    </form>
  );
}