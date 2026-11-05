import type { ReactNode } from "react";
import "../../styles/dashboard.css";

interface Props {
  title: string;
  subtitle?: string;
  onLogout: () => void;
  children: ReactNode;
}

export default function DashboardLayout({
  title,
  subtitle,
  onLogout,
  children,
}: Props) {
  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-brand">GOFIT<span>GYM</span></span>
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>

        <button type="button" className="dashboard-logout" onClick={onLogout}>
          Cerrar sesión
        </button>
      </header>

      <main className="dashboard-content">{children}</main>
    </div>
  );
}