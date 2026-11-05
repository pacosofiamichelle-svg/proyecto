import type { ReactNode } from "react";
import "../../styles/auth.css";

interface Props {
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ subtitle, children }: Props) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand">
          <h1>GOFIT<span>GYM</span></h1>
          <p>{subtitle}</p>
        </div>

        {children}
      </section>
    </main>
  );
}