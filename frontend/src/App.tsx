import { useEffect, useState } from "react";
import { currentUserApi, readEmailLink } from "./api/authApi";
import type { AuthResponse, User } from "./types";
import type { Role } from "./types/shared";
import { Landing } from "./features/auth/Landing";
import { Login } from "./features/auth/Login";
import { AdminPanel } from "./features/admin/AdminPanel";
import { ClientEntry } from "./features/auth/ClientEntry";
import { SupportPanel } from "./features/support/SupportPanel";

export default function App() {
  const [emailLink, setEmailLink] = useState(readEmailLink);
  const [role, setRole] = useState<Role>(emailLink ? "login" : "landing");
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(!emailLink && Boolean(localStorage.getItem("agrocloud_token")));
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  useEffect(() => {
    const openEmailLink = () => {
      const link = readEmailLink();
      if (!link) return;
      setEmailLink(link);
      setRestoring(false);
      setRole("login");
    };
    window.addEventListener("hashchange", openEmailLink);
    return () => window.removeEventListener("hashchange", openEmailLink);
  }, []);
  useEffect(() => {
    if (emailLink) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return;
    }
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
  }, [emailLink]);
  const openAuth = (mode: "login" | "register") => {
    setAuthMode(mode);
    setRole("login");
  };
  const handleAuthenticated = ({ token, user: authenticatedUser }: AuthResponse) => {
    setEmailLink(null);
    localStorage.setItem("agrocloud_token", token);
    localStorage.setItem("agrocloud_user", JSON.stringify(authenticatedUser));
    window.dispatchEvent(new Event("agrocloud:auth-change"));
    setUser(authenticatedUser);
    setRole(authenticatedUser.rol === "ADMIN" ? "admin" : authenticatedUser.rol === "SOPORTE" ? "soporte" : "cliente");
  };
  const handleLogout = () => {
    setEmailLink(null);
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
  if (role === "login") return <Login key={emailLink ? emailLink.action + emailLink.token : "access"} initialMode={authMode} emailLink={emailLink} onAuthenticated={handleAuthenticated} onCancel={handleCancelAuth} />;
  if (role === "admin" && user) return <AdminPanel user={user} onLogout={handleLogout} />;
  if (role === "cliente" && user) return <ClientEntry key={user.id} user={user} onLogout={handleLogout} />;
  if (role === "soporte" && user) return <SupportPanel user={user} onLogout={handleLogout} />;
  return <Landing onLogin={() => openAuth("login")} onRegister={() => openAuth("register")} />;
}
