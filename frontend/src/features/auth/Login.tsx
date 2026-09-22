import { useState } from "react";
import type { Role } from "../../types/shared";
import { LogoIcon } from "../../components/ui";

export function Login({ onLogin }: { onLogin: (role: Role) => void }) {
  const DARK = "#0d1a0b";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [step, setStep] = useState<1 | 2>(1);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Register Step 1 state
  const [regData, setRegData] = useState({
    nombreEmpresa: "",
    contactoNombre: "",
    email: "",
    telefono: "",
    password: "",
  });

  // Register Step 2 state (Plan selection)
  const [selectedPlan, setSelectedPlan] = useState<string>("Productor");

  const plans = [
    { name: "Finca", storage: "10 GB", instances: "1 instancia de base de datos", price: "Q25", featured: false },
    { name: "Productor", storage: "50 GB", instances: "1 instancia de base de datos", price: "Q60", featured: true },
    { name: "Agro Pro", storage: "100 GB", instances: "1 instancia de base de datos", price: "Q120", featured: false },
    { name: "Agro Ent.", storage: "200 GB", instances: "1 instancia de base de datos", price: "Q250", featured: false },
  ];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.nombreEmpresa || !regData.email || !regData.password) return;
    setStep(2);
  };

  const handleRegisterComplete = () => {
    // Complete registration and log in as cliente
    onLogin("cliente");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-[Inter,sans-serif]">
      {/* Brand Header */}
      <div className="flex items-center gap-2 mb-6">
        <LogoIcon size={8} />
        <span className="text-xl font-bold text-gray-900">AgroCloud</span>
      </div>

      {mode === "login" ? (
        /* ─── INICIAR SESIÓN ─── */
        <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-sm shadow-sm animate-in fade-in duration-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido de nuevo</h1>
          <p className="text-sm text-gray-500 mb-6">Accede a tu infraestructura de bases de datos.</p>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-gray-700">Contraseña</label>
                <button className="text-xs text-gray-500 hover:text-gray-700">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        showPass
                          ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          : "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      }
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <button onClick={() => onLogin("cliente")} className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-sm transition-colors shadow-sm">
              Iniciar sesión
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <p className="text-left text-xs text-gray-400 mb-3">Acceso de demostración</p>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ["admin", "Administrador"],
                  ["cliente", "Cliente"],
                  ["soporte", "Soporte"],
                ] as const
              ).map(([r, label]) => (
                <button
                  key={r}
                  onClick={() => onLogin(r)}
                  className="py-2 border border-gray-200 hover:border-lime-400 hover:bg-lime-50 rounded-xl text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-left text-xs text-gray-400 mt-5">
            ¿No tienes una cuenta?{" "}
            <button onClick={() => { setMode("register"); setStep(1); }} className="text-lime-700 font-semibold hover:underline">
              Regístrate
            </button>
          </p>
        </div>
      ) : (
        /* ─── REGISTRO EN PASOS ─── */
        <div className="w-full max-w-4xl transition-all duration-300">
          {/* Progress Indicator */}
          <div className="max-w-md mx-auto mb-8 flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-lime-500 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === 1 ? "50%" : "100%" }}
            />

            <div className="relative z-10 flex flex-col items-center gap-1 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 1 ? "bg-lime-400 text-gray-900 shadow-md scale-110" : "bg-lime-500 text-white"}`}>
                01
              </div>
              <span className={`text-xs font-semibold ${step === 1 ? "text-gray-900" : "text-gray-500"}`}>Información del cliente</span>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step === 2 ? "bg-lime-400 text-gray-900 shadow-md scale-110" : "bg-gray-200 text-gray-500"}`}>
                02
              </div>
              <span className={`text-xs font-semibold ${step === 2 ? "text-gray-900" : "text-gray-400"}`}>Selección de plan</span>
            </div>
          </div>

          {step === 1 ? (
            /* ── Paso 1: Información del cliente ── */
            <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm animate-in fade-in zoom-in-95 duration-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Crea tu cuenta de AgroCloud</h1>
              <p className="text-sm text-gray-500 mb-6">Paso 1: Ingresa los datos de tu finca u organización.</p>

              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre de la Finca o Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Finca Los Pinos / Coop. Occidente"
                    value={regData.nombreEmpresa}
                    onChange={(e) => setRegData({ ...regData, nombreEmpresa: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del Encargado / Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={regData.contactoNombre}
                    onChange={(e) => setRegData({ ...regData, contactoNombre: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Correo electrónico *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@finca.com"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      placeholder="+502 5555-0000"
                      value={regData.telefono}
                      onChange={(e) => setRegData({ ...regData, telefono: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña de acceso *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="px-4 py-2.5 text-xs text-gray-500 hover:text-gray-900 font-medium"
                  >
                    ← Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-sm transition-colors shadow-sm flex items-center gap-1.5"
                  >
                    Siguiente: Selección de Plan →
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ── Paso 2: Selección de Plan (Cuadros estilo Landing Page con animaciones) ── */
            <div className="animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-1">Paso 2: Elige el plan que se adapta a ti</h1>
                <p className="text-sm text-gray-500">Soluciones flexibles para la escala de tu negocio agrícola.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.name;
                  return (
                    <div
                      key={plan.name}
                      onClick={() => setSelectedPlan(plan.name)}
                      className={`rounded-2xl p-6 flex flex-col items-center text-center gap-4 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                        isSelected
                          ? "ring-4 ring-lime-400 shadow-xl scale-[1.02]"
                          : "hover:shadow-lg opacity-90 hover:opacity-100"
                      }`}
                      style={{ background: DARK }}
                    >
                      {/* Check badge if selected */}
                      {isSelected && (
                        <span className="bg-lime-400 text-gray-900 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wider animate-pulse">
                          Seleccionado
                        </span>
                      )}

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 ${isSelected ? "bg-lime-400 text-gray-900 scale-110" : "bg-lime-400/20 text-lime-400"}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                      </div>

                      <div className="flex flex-col items-center">
                        <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                        <div className="flex items-center justify-center gap-1.5 mt-2 text-white/60 text-xs">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                          </svg>
                          <span>{plan.storage} Almacenamiento</span>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-1 text-white/60 text-xs">
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{plan.instances}</span>
                        </div>
                      </div>

                      <div className="mt-auto w-full pt-2 border-t border-white/10">
                        <div className="mb-3">
                          <span className="text-2xl font-extrabold text-white">{plan.price}</span>
                          <span className="text-xs text-white/50">/mes</span>
                        </div>

                        <div className={`w-full py-2 rounded-lg text-xs font-bold transition-colors ${isSelected ? "bg-lime-400 text-gray-900" : "border border-white/20 text-white"}`}>
                          {isSelected ? "Plan Elegido ✓" : "Seleccionar"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Step 2 Actions */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-gray-600 hover:text-gray-900 font-semibold px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  ← Volver a información
                </button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">Plan seleccionado: <strong className="text-gray-900">{selectedPlan}</strong></span>
                  <button
                    onClick={handleRegisterComplete}
                    className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-extrabold rounded-xl text-sm transition-all shadow-md hover:shadow-lime-400/30 flex items-center gap-2"
                  >
                    Completar Registro y Entrar
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-6">Acceso seguro a tu cuenta de AgroCloud.</p>
    </div>
  );
}
