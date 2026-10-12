import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { loginApi, registerApi } from "../../api/authApi";
import { getPlanes } from "../../api/planesApi";
import { contratarPlan } from "../../api/suscripcionesApi";
import { LogoIcon } from "../../components/ui";
import type { AuthResponse, Plan } from "../../types";

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

const DEFAULT_PLANES: Plan[] = [
  { id: "plan-finca", nombre: "Finca", almacenamientoGb: 10, precioMensual: 25, descripcion: "Ideal para pequeños productores y fincas que inician la digitalización.", instanciasPermitidas: 1, popular: false, activo: true },
  { id: "plan-productor", nombre: "Productor", almacenamientoGb: 50, precioMensual: 60, descripcion: "Diseñado para productores agrícolas con volumen creciente de datos.", instanciasPermitidas: 1, popular: true, activo: true },
  { id: "plan-agro-pro", nombre: "Agro Pro", almacenamientoGb: 100, precioMensual: 120, descripcion: "Para mediano y gran productor con alta disponibilidad.", instanciasPermitidas: 2, popular: false, activo: true },
  { id: "plan-enterprise", nombre: "Agro Enterprise", almacenamientoGb: 250, precioMensual: 250, descripcion: "Solución integral para cooperativas y empresas agroindustriales.", instanciasPermitidas: 5, popular: false, activo: true },
];

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
  const [regStep, setRegStep] = useState<"cuenta" | "plan" | "pago">("cuenta");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registration, setRegistration] = useState(emptyRegistration);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [planes, setPlanes] = useState<Plan[]>(DEFAULT_PLANES);
  const [selectedPlanId, setSelectedPlanId] = useState<string>("plan-productor");
  const [cardData, setCardData] = useState({
    numero: "4532 •••• •••• 8821",
    titular: "",
    exp: "12/28",
    cvv: "882",
  });

  useEffect(() => {
    getPlanes()
      .then((data) => {
        if (data && data.length > 0) {
          const actives = data.filter((p) => p.activo !== false);
          setPlanes(actives);
          if (!actives.some((p) => p.id === selectedPlanId)) {
            setSelectedPlanId(actives[0].id);
          }
        }
      })
      .catch(() => {
        // Usa planes por defecto
      });
  }, []);

  const switchMode = (nextMode: "login" | "register") => {
    setError("");
    setMode(nextMode);
    setRegStep("cuenta");
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

  const handleAccountStepNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!registration.organizationName.trim()) {
      setError("El nombre de la finca u organización es obligatorio.");
      return;
    }
    if (!registration.email.trim()) {
      setError("El correo electrónico es obligatorio.");
      return;
    }
    if (new TextEncoder().encode(registration.password).length > 72) {
      setError("La contraseña no puede superar 72 bytes.");
      return;
    }
    if (registration.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    setCardData((prev) => ({
      ...prev,
      titular: prev.titular || registration.contactName || registration.organizationName,
    }));
    setRegStep("plan");
  };

  const handleSelectPlanNext = () => {
    setError("");
    setRegStep("pago");
  };

  const selectedPlan = planes.find((p) => p.id === selectedPlanId) || planes[0] || DEFAULT_PLANES[0];

  const handleSimulatePaymentAndFinish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      // 1. Registrar usuario
      const authResp = await registerApi({
        organizationName: registration.organizationName.trim(),
        contactName: registration.contactName.trim(),
        email: registration.email.trim(),
        phone: registration.phone.trim(),
        password: registration.password,
      });

      // 2. Establecer sesión provisional para realizar la contratación y pago
      localStorage.setItem("agrocloud_token", authResp.token);
      localStorage.setItem("agrocloud_user", JSON.stringify(authResp.user));

      // 3. Simular pago y contratar plan seleccionado en backend
      try {
        await contratarPlan(selectedPlan.id, selectedPlan.nombre, selectedPlan.precioMensual);
      } catch (subErr) {
        console.warn("Error contratando plan inicial:", subErr);
      }

      // 4. Ingresar a la plataforma
      onAuthenticated(authResp);
    } catch (caught) {
      setError(errorMessage(caught));
      setRegStep("cuenta"); // Regresar al paso de datos si hubo conflicto de correo
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200";

  const cardWidthClass =
    mode === "register" && regStep === "plan" ? "max-w-2xl" : "max-w-md";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8 font-[Inter,sans-serif]">
      <div className="mb-6 flex items-center gap-2">
        <LogoIcon size={8} />
        <span className="text-xl font-bold text-gray-900">AgroCloud</span>
      </div>

      <div className={`w-full ${cardWidthClass} rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300`}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "login"
              ? "Iniciar sesión"
              : regStep === "cuenta"
              ? "Crear cuenta de cliente"
              : regStep === "plan"
              ? "¿Qué plan deseas contratar?"
              : "Simulación de Pago"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === "login"
              ? "Accede con las credenciales de tu cuenta."
              : regStep === "cuenta"
              ? "Paso 1 de 3: Información de tu finca u organización."
              : regStep === "plan"
              ? "Paso 2 de 3: Selecciona el plan adecuado para tus bases de datos."
              : "Paso 3 de 3: Simula el pago de tu primer mes para activar la cuenta."}
          </p>

          {/* Stepper indicator in register mode */}
          {mode === "register" && (
            <div className="mt-4 flex items-center gap-2">
              {[
                { key: "cuenta", label: "1. Datos" },
                { key: "plan", label: "2. Plan" },
                { key: "pago", label: "3. Pago" },
              ].map((s) => {
                const isActive = regStep === s.key;
                const isPassed =
                  (s.key === "cuenta" && (regStep === "plan" || regStep === "pago")) ||
                  (s.key === "plan" && regStep === "pago");
                return (
                  <div key={s.key} className="flex-1 flex items-center gap-2">
                    <div
                      className={`h-1.5 flex-1 rounded-full ${
                        isActive
                          ? "bg-lime-500"
                          : isPassed
                          ? "bg-lime-300"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* MODO LOGIN */}
        {mode === "login" && (
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
              className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60 transition-colors">
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        )}

        {/* MODO REGISTRO - PASO 1: CUENTA */}
        {mode === "register" && regStep === "cuenta" && (
          <form onSubmit={handleAccountStepNext} className="space-y-4">
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
            <button type="submit"
              className="w-full rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 transition-colors flex items-center justify-center gap-1.5">
              Continuar a elegir plan →
            </button>
          </form>
        )}

        {/* MODO REGISTRO - PASO 2: ELEGIR PLAN */}
        {mode === "register" && regStep === "plan" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {planes.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`relative rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? "border-lime-500 bg-lime-50/50 shadow-sm ring-2 ring-lime-400/40"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-2.5 right-3 bg-lime-400 text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-base">{p.nombre}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.descripcion}</p>
                      </div>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => setSelectedPlanId(p.id)}
                        className="mt-1 h-4 w-4 text-lime-600 focus:ring-lime-400"
                      />
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-baseline justify-between">
                      <div className="text-lg font-bold text-gray-900">
                        Q {p.precioMensual.toFixed(2)}
                        <span className="text-xs font-normal text-gray-500"> /mes</span>
                      </div>
                      <div className="text-right text-xs text-gray-600">
                        <span className="font-semibold">{p.instanciasPermitidas}</span> DB ·{" "}
                        <span className="font-semibold">{p.almacenamientoGb} GB</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRegStep("cuenta")}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Volver a datos
              </button>
              <button
                type="button"
                onClick={handleSelectPlanNext}
                className="flex-1 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 transition-colors flex items-center justify-center gap-1.5"
              >
                Continuar al pago simulado →
              </button>
            </div>
          </div>
        )}

        {/* MODO REGISTRO - PASO 3: SIMULACIÓN DE PAGO */}
        {mode === "register" && regStep === "pago" && (
          <form onSubmit={handleSimulatePaymentAndFinish} className="space-y-4">
            {/* Resumen del plan */}
            <div className="rounded-xl bg-slate-900 text-white p-4 space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Plan seleccionado</span>
                <span className="text-lime-400 font-semibold">{selectedPlan.nombre}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">
                  {selectedPlan.instanciasPermitidas} base(s) de datos · {selectedPlan.almacenamientoGb} GB
                </span>
                <span className="text-lg font-bold text-white">Q {selectedPlan.precioMensual.toFixed(2)} / mes</span>
              </div>
            </div>

            {/* Tarjeta simulada */}
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Tarjeta de Crédito / Débito (Simulador)</span>
                <span className="text-[10px] font-bold text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">Pruebas</span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Número de tarjeta</label>
                <input
                  type="text"
                  required
                  value={cardData.numero}
                  onChange={(e) => setCardData({ ...cardData, numero: e.target.value })}
                  className={inputClass}
                  placeholder="4532 8912 3456 7890"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Nombre en la tarjeta</label>
                <input
                  type="text"
                  required
                  value={cardData.titular}
                  onChange={(e) => setCardData({ ...cardData, titular: e.target.value })}
                  className={inputClass}
                  placeholder="Nombre del titular"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Vencimiento (MM/AA)</label>
                  <input
                    type="text"
                    required
                    value={cardData.exp}
                    onChange={(e) => setCardData({ ...cardData, exp: e.target.value })}
                    className={inputClass}
                    placeholder="12/28"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">CVV</label>
                  <input
                    type="text"
                    required
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    className={inputClass}
                    placeholder="882"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-[11px] text-blue-800 flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                Esta simulación activará tu cuenta de cliente, registrará tu suscripción y generará tu factura electrónica en AgroCloud sin cobro real.
              </span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setRegStep("plan")}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Cambiar plan
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-lime-400 px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5"
              >
                {submitting ? "Simulando pago..." : "Simular Pago y Entrar"}
              </button>
            </div>
          </form>
        )}

        {/* Footer switch mode */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "login" ? "¿Aún no tienes cuenta? " : "¿Ya tienes cuenta? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-semibold text-lime-700 hover:underline"
          >
            {mode === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
