import { useState } from "react";
import type { Role } from "./types/shared";
import { Landing } from "./features/auth/Landing";
import { Login } from "./features/auth/Login";
import { AdminPanel } from "./features/admin/AdminPanel";
import { ClientePanel } from "./features/cliente/ClientePanel";
import { SoportePanel } from "./features/soporte/SoportePanel";

export default function App() {
  const [role, setRole] = useState<Role>("landing");
  if (role === "landing") return <Landing onLogin={() => setRole("login")} />;
  if (role === "login") return <Login onLogin={setRole} />;
  if (role === "admin") return <AdminPanel onLogout={() => setRole("landing")} />;
  if (role === "cliente") return <ClientePanel onLogout={() => setRole("landing")} />;
  return <SoportePanel onLogout={() => setRole("landing")} />;
}
