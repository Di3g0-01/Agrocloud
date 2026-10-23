import { useEffect, useState } from "react";
import { currentUserApi } from "./api/authApi";
import type { AuthResponse, User } from "./types";
import type { Role } from "./types/shared";
import { Landing } from "./features/auth/Landing";
import { Login } from "./features/auth/Login";
import { AdminPanel } from "./features/admin/AdminPanel";
import { ClientPanel } from "./features/client/ClientPanel";
import { SupportPanel } from "./features/support/SupportPanel";

export default function App() {
  const [role, setRole] = useState<Role>("landing");
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(Boolean(localStorage.getItem("agrocloud_token")));
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  useEffect(() => {
    if (!localStorage.getItem("agrocloud_token")) return;
    let active = true;
    currentUserApi()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setRole(currentUser.rol === "ADMIN" ? "admin" : currentUser.rol === "SOPORTE" ? "soporte" : "cliente");
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem("agrocloud_token");
        localStorage.removeItem("agrocloud_user");
        setRole("landing");
      })
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);
  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setRole("login");
  };
  const handleAuthenticated = ({ token, user: authenticatedUser }: AuthResponse) => {
    localStorage.setItem("agrocloud_token", token);
    localStorage.setItem("agrocloud_user", JSON.stringify(authenticatedUser));
    window.dispatchEvent(new Event("agrocloud:auth-change"));
    setUser(authenticatedUser);
    setRole(authenticatedUser.rol === "ADMIN" ? "admin" : authenticatedUser.rol === "SOPORTE" ? "soporte" : "cliente");
  };
  const handleLogout = () => {
    localStorage.removeItem("agrocloud_token");
    localStorage.removeItem("agrocloud_user");
    window.dispatchEvent(new Event("agrocloud:auth-change"));
    setUser(null);
    setRole("landing");
  };

  const handleCancelAuth = () => {
    setRole("landing");
  };

  if (restoring) return <div className="min-h-screen grid place-items-center text-sm text-gray-500">Cargando tu cuenta...</div>;
  if (role === "landing") return <Landing onLogin={() => openAuth("login")} onRegister={() => openAuth("register")} />;
  if (role === "login") return <Login initialMode={authMode} onAuthenticated={handleAuthenticated} onCancel={handleCancelAuth} />;
  if (role === "admin" && user) return <AdminPanel user={user} onLogout={handleLogout} />;
  if (role === "cliente" && user) return <ClientPanel user={user} onLogout={handleLogout} />;
  if (role === "soporte" && user) return <SupportPanel user={user} onLogout={handleLogout} />;
  return <Landing onLogin={() => openAuth("login")} onRegister={() => openAuth("register")} />;
}
