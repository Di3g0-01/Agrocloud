import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { loginApi, registerApi } from "../../api/authApi";
import { LogoIcon } from "../../components/ui";
import type { AuthResponse } from "../../types";

interface LoginProps {
  initialMode: "login" | "register";
  onAuthenticated: (response: AuthResponse) => void;
}

const emptyRegistration = {
  organizationName: "",
  contactName: "",
  email: "",
  phone: "",
  password: "",
};

function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 409) return "Ya existe una cuenta con este correo.";
    if (error.response?.status === 401) return "Correo o contraseña incorrectos.";
    if (error.response?.status === 403) return "La cuenta no está activa.";
    return error.response?.data?.message || "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

export function Login({ initialMode, onAuthenticated }: LoginProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registration, setRegistration] = useState(emptyRegistration);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const switchMode = (nextMode: "login" | "register") => {
    setError("");
    setMode(nextMode);
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response = await loginApi(email.trim(), password);
      onAuthenticated(response);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (new TextEncoder().encode(registration.password).length > 72) {
      setError("La contraseña no puede superar 72 bytes.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await registerApi({
        organizationName: registration.organizationName.trim(),
        contactName: registration.contactName.trim(),
        email: registration.email.trim(),
        phone: registration.phone.trim(),
        password: registration.password,
      });
      onAuthenticated(response);
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-10 font-[Inter,sans-serif]">
      <div className="mb-6 flex items-center gap-2">
        <LogoIcon size={8} />
        <span className="text-xl font-bold text-gray-900">AgroCloud</span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold text-gray-900">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta de cliente"}
        </h1>
        <p className="mb-6 text-sm text-gray-500">
          {mode === "login"
            ? "Accede con las credenciales de tu cuenta."
            : "El registro público crea únicamente cuentas de cliente."}
        </p>

        {error && (
          <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-semibold text-gray-700">Correo electrónico</label>
              <input id="login-email" type="email" autoComplete="email" required value={email}
                onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="tu@finca.com" />
            </div>
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-semibold text-gray-700">Contraseña</label>
              <div className="relative">
                <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password"
                  required value={password} onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-20`} placeholder="Tu contraseña" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-xs font-medium text-gray-500 hover:text-gray-800">
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="register-organization" className="mb-1.5 block text-xs font-semibold text-gray-700">Finca u organización *</label>
              <input id="register-organization" type="text" required maxLength={150} value={registration.organizationName}
                onChange={(event) => setRegistration({ ...registration, organizationName: event.target.value })}
                className={inputClass} placeholder="Finca Los Pinos" />
            </div>
            <div>
              <label htmlFor="register-contact" className="mb-1.5 block text-xs font-semibold text-gray-700">Nombre del contacto</label>
              <input id="register-contact" type="text" maxLength={150} value={registration.contactName}
                onChange={(event) => setRegistration({ ...registration, contactName: event.target.value })}
                className={inputClass} placeholder="Nombre y apellido" />
            </div>
            <div>
              <label htmlFor="register-email" className="mb-1.5 block text-xs font-semibold text-gray-700">Correo electrónico *</label>
              <input id="register-email" type="email" autoComplete="email" required maxLength={254} value={registration.email}
                onChange={(event) => setRegistration({ ...registration, email: event.target.value })}
                className={inputClass} placeholder="tu@finca.com" />
            </div>
            <div>
              <label htmlFor="register-phone" className="mb-1.5 block text-xs font-semibold text-gray-700">Teléfono</label>
              <input id="register-phone" type="tel" maxLength={30} value={registration.phone}
                onChange={(event) => setRegistration({ ...registration, phone: event.target.value })}
                className={inputClass} placeholder="+502 5555-0000" />
            </div>
            <div>
              <label htmlFor="register-password" className="mb-1.5 block text-xs font-semibold text-gray-700">Contraseña *</label>
              <input id="register-password" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                value={registration.password} onChange={(event) => setRegistration({ ...registration, password: event.target.value })}
                className={inputClass} placeholder="Al menos 8 caracteres" />
            </div>
            <button type="submit" disabled={submitting}
              className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60">
              {submitting ? "Creando cuenta..." : "Crear cuenta de cliente"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-lime-700 hover:underline">
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
