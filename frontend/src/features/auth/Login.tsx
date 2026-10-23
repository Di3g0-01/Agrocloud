import { useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { loginApi, registerApi, verifyEmailApi, resendVerificationApi, forgotPasswordApi, resetPasswordApi } from "../../api/authApi";
import type { EmailLink } from "../../api/authApi";
import { LogoIcon } from "../../components/ui";
import type { AuthResponse } from "../../types";
import { EmailSentDialog } from "./EmailSentDialog";
import type { EmailNotice } from "./EmailSentDialog";

interface LoginProps {
  initialMode: "login" | "register";
  emailLink?: EmailLink | null;
  onAuthenticated: (response: AuthResponse) => void;
}
type Mode = "login" | "register" | "pending" | "forgot" | "resend" | "verify" | "reset";

function errorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "No se pudo conectar con el servidor. Inténtalo de nuevo.";
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

export function Login({ initialMode, emailLink, onAuthenticated }: LoginProps) {
  const [mode, setMode] = useState<Mode>(emailLink?.action || initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registration, setRegistration] = useState({ organizationName: "", contactName: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [emailNotice, setEmailNotice] = useState<EmailNotice | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setMessage("");
    setPassword("");
    setConfirmation("");
    setShowPassword(false);
    setShowConfirmation(false);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if ((mode === "register" || mode === "reset")
        && (password.length < 8 || new TextEncoder().encode(password).length > 72)) {
      setError(password.length < 8 ? "La contraseña debe tener al menos 8 caracteres."
        : "La contraseña es demasiado larga. Usa una más corta.");
      return;
    }
    if ((mode === "register" || mode === "reset") && password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if ((mode === "verify" || mode === "reset") && !/^[A-Za-z0-9_-]{43}$/.test(emailLink?.token || "")) {
      setError("El enlace está incompleto. Solicita uno nuevo.");
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "login") {
        onAuthenticated(await loginApi(email.trim(), password));
        return;
      }
      if (mode === "verify") {
        onAuthenticated(await verifyEmailApi(emailLink!.token));
        return;
      }
      const result = mode === "register"
        ? await registerApi({ ...registration, organizationName: registration.organizationName.trim(), email: email.trim(), password })
        : mode === "forgot" ? await forgotPasswordApi(email.trim())
        : mode === "resend" ? await resendVerificationApi(email.trim())
        : await resetPasswordApi(emailLink!.token, password);
      setMessage(result.message);
      setPassword("");
      setConfirmation("");
      if (mode === "register" || mode === "resend" || mode === "forgot") {
        setEmailNotice({ email: email.trim(), purpose: mode === "forgot" ? "recovery" : "verification", accountCreated: mode === "register" });
      }
      if (mode === "reset") {
        localStorage.removeItem("agrocloud_token");
        localStorage.removeItem("agrocloud_user");
        window.dispatchEvent(new Event("agrocloud:auth-change"));
      }
      if (mode === "register" || mode === "resend") setMode("pending");
      if (mode === "reset") setMode("login");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const titles: Record<Mode, string> = {
    login: "Bienvenido de nuevo", register: "Crea tu cuenta", forgot: "Recupera tu contraseña",
    pending: "Verifica tu correo electrónico",
    resend: "Confirma tu correo", verify: "Verifica tu correo", reset: "Elige una nueva contraseña",
  };
  const descriptions: Record<Mode, string> = {
    login: "Ingresa a tu cuenta de AgroCloud.",
    register: "Crea tu cuenta, confirma tu correo y selecciona un plan.",
    pending: "Antes de elegir tu plan, confirma tu correo con el enlace que recibirás en tu bandeja de entrada.",
    forgot: "Ingresa el correo asociado a tu cuenta y te enviaremos un enlace para cambiar tu contraseña.",
    resend: "Solicita otro enlace de verificación. Revisa también la carpeta de spam y espera un minuto entre envíos.",
    verify: "Confirma tu correo para continuar con la selección de tu plan.",
    reset: "Usa una contraseña de al menos 8 caracteres.",
  };
  const actions: Record<Mode, string> = {
    login: "Iniciar sesión", register: "Crear cuenta y verificar correo", forgot: "Enviar enlace de recuperación",
    pending: "Ver instrucciones", resend: "Reenviar verificación", verify: "Confirmar correo y elegir plan", reset: "Guardar nueva contraseña",
  };
  const needsEmail = mode !== "verify" && mode !== "reset";
  const needsPassword = mode === "login" || mode === "register" || mode === "reset";
  const inputClass = "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8 font-[Inter,sans-serif]">
      <a href="/" className="mb-7 flex items-center gap-2 text-xl font-bold text-gray-900" aria-label="Inicio de AgroCloud">
        <LogoIcon size={9} />AgroCloud
      </a>
      <main className="w-full max-w-md rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{titles[mode]}</h1>
        <p className="mt-2 mb-6 text-sm text-gray-500">{descriptions[mode]}</p>
        {error && <p role="alert" className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700">{error}</p>}
        {message && mode !== "pending" && <p role="status" className="mb-5 rounded-xl bg-lime-50 border border-lime-200 p-3 text-sm text-green-800">{message}</p>}
        {mode === "pending" ? <div className="space-y-4">
          <p className="break-all rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm font-semibold text-gray-900">{email}</p>
          <p className="text-sm leading-6 text-gray-500">Abre el mensaje y confirma tu correo. Luego podrás seleccionar tu plan. Revisa también la carpeta de spam.</p>
          <button type="button" onClick={() => setEmailNotice({ email: email.trim(), purpose: "verification" })}
            className="w-full rounded-xl bg-lime-400 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-lime-300">Ver instrucciones de verificación</button>
        </div> : <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={submitting} className="space-y-4 disabled:opacity-70">
            {mode === "register" && <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="organization">Finca u organización *</label>
                <input id="organization" autoComplete="organization" required maxLength={150} value={registration.organizationName}
                  onChange={e => setRegistration({ ...registration, organizationName: e.target.value })} placeholder="Finca Los Pinos" className={inputClass} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="contact">Nombre del contacto</label>
                <input id="contact" autoComplete="name" maxLength={150} value={registration.contactName}
                  onChange={e => setRegistration({ ...registration, contactName: e.target.value })} placeholder="Nombre y apellido" className={inputClass} />
              </div>
            </>}
            {needsEmail && <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="email">{mode === "forgot" ? "Correo electrónico asociado" : "Correo electrónico"}{mode === "register" ? " *" : ""}</label>
              <input id="email" type="email" autoComplete="email" required maxLength={254} value={email}
                onChange={e => setEmail(e.target.value)} placeholder="tu@finca.com" className={inputClass} />
            </div>}
            {mode === "register" && <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="phone">Teléfono</label>
              <input id="phone" type="tel" autoComplete="tel" maxLength={30} value={registration.phone}
                onChange={e => setRegistration({ ...registration, phone: e.target.value })} placeholder="+502 5555-0000" className={inputClass} />
            </div>}
            {needsPassword && <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="password">{mode === "reset" ? "Nueva contraseña *" : mode === "register" ? "Contraseña *" : "Contraseña"}</label>
              <div className="relative">
                <input id="password" type={showPassword ? "text" : "password"} required
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  minLength={mode === "login" ? undefined : 8} maxLength={72} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder={mode === "login" ? "Tu contraseña" : "Al menos 8 caracteres"}
                  aria-describedby={mode === "register" || mode === "reset" ? "password-help" : undefined}
                  className={`${inputClass} pr-20`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} aria-pressed={showPassword}
                  aria-controls="password"
                  className="absolute inset-y-0 right-3 text-xs font-medium text-gray-500 hover:text-gray-800">
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
              {(mode === "register" || mode === "reset") && <p id="password-help" className="mt-1.5 text-xs text-gray-500">
                Puedes usar letras, números y símbolos. Mínimo 8 caracteres.
              </p>}
            </div>}
            {(mode === "register" || mode === "reset") && <div>
              <label className="mb-1.5 block text-xs font-semibold text-gray-700" htmlFor="confirmation">Confirma tu contraseña *</label>
              <div className="relative">
                <input id="confirmation" type={showConfirmation ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={72}
                  value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Repite tu contraseña" className={`${inputClass} pr-20`} />
                <button type="button" onClick={() => setShowConfirmation(!showConfirmation)}
                  aria-label={showConfirmation ? "Ocultar confirmación de contraseña" : "Mostrar confirmación de contraseña"}
                  aria-pressed={showConfirmation} aria-controls="confirmation"
                  className="absolute inset-y-0 right-3 text-xs font-medium text-gray-500 hover:text-gray-800">
                  {showConfirmation ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>}
            <button type="submit" className="w-full rounded-xl bg-lime-400 hover:bg-lime-300 px-4 py-3 text-sm font-semibold text-gray-900 disabled:cursor-wait">
              {submitting ? "Procesando..." : actions[mode]}
            </button>
          </fieldset>
        </form>}
        <nav aria-label="Opciones de acceso" className="mt-5 flex flex-col items-center gap-3 text-sm">
          {mode === "login" && <button disabled={submitting} type="button" onClick={() => switchMode("forgot")} className="text-gray-600 hover:text-gray-900">Olvidé mi contraseña</button>}
          {mode === "verify" && error && <button disabled={submitting} type="button" onClick={() => switchMode("resend")} className="text-gray-600 hover:text-gray-900">Solicitar otro enlace de verificación</button>}
          {mode === "reset" && <button disabled={submitting} type="button" onClick={() => switchMode("forgot")} className="text-gray-600 hover:text-gray-900">Solicitar otro enlace</button>}
          <button disabled={submitting} type="button" onClick={() => switchMode(mode === "login" ? "register" : "login")} className="font-semibold text-green-800 hover:underline">
            {mode === "login" ? "¿Aún no tienes cuenta? Regístrate" : "Volver a iniciar sesión"}
          </button>
        </nav>
      </main>
      {emailNotice && <EmailSentDialog {...emailNotice} onClose={() => { setEmailNotice(null); switchMode(emailNotice.purpose === "verification" ? "pending" : "login"); }} />}
    </div>
  );
}
