import { useState } from "react";
import { ProgressBar, StatusBadge } from "../../components/ui";
import { C_PLAN } from "../../data/cliente";

interface PlanAvailable {
  nombre: string;
  precio: string;
  precioNum: number;
  storage: string;
  storageGB: number;
  instancias: string;
  maxInstancias: number;
  popular?: boolean;
  caracteristicas: string[];
}

const PLANES_DISPONIBLES: PlanAvailable[] = [
  {
    nombre: "Finca",
    precio: "Q 25.00",
    precioNum: 25,
    storage: "10 GB",
    storageGB: 10,
    instancias: "1",
    maxInstancias: 1,
    caracteristicas: ["1 Instancia PostgreSQL", "10 GB almacenamiento", "Soporte estándar por tickets", "Backups automáticos"],
  },
  {
    nombre: "Productor",
    precio: "Q 60.00",
    precioNum: 60,
    storage: "50 GB",
    storageGB: 50,
    instancias: "2",
    maxInstancias: 2,
    popular: true,
    caracteristicas: ["Hasta 2 Instancias PostgreSQL", "50 GB almacenamiento total", "Plantillas DB especializadas", "Soporte prioritario 24/7"],
  },
  {
    nombre: "Agro Pro",
    precio: "Q 120.00",
    precioNum: 120,
    storage: "100 GB",
    storageGB: 100,
    instancias: "3",
    maxInstancias: 3,
    caracteristicas: ["Hasta 3 Instancias PostgreSQL", "100 GB almacenamiento total", "Acceso a todas las plantillas", "Monitoreo avanzado de CPU y RAM"],
  },
  {
    nombre: "Agro Enterprise",
    precio: "Q 250.00",
    precioNum: 250,
    storage: "250 GB",
    storageGB: 250,
    instancias: "5",
    maxInstancias: 5,
    caracteristicas: ["Hasta 5 Instancias PostgreSQL", "250 GB almacenamiento total", "Infraestructura dedicada", "Gerente de cuenta asignado"],
  },
];

export function ClientePlan() {
  const [currentPlan, setCurrentPlan] = useState<PlanAvailable>(PLANES_DISPONIBLES[1]); // Productor default
  const [modalChangeOpen, setModalChangeOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanAvailable | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const storageUsed = 32;
  const instUsed = 2;

  const handleConfirmPlanChange = (plan: PlanAvailable) => {
    setCurrentPlan(plan);
    C_PLAN.nombre = plan.nombre;
    C_PLAN.maxInstancias = plan.maxInstancias;
    C_PLAN.totalGB = plan.storageGB;
    setSelectedPlanForUpgrade(null);
    setModalChangeOpen(false);
    setNotificationMsg(`¡Plan actualizado con éxito al ${plan.nombre}! Tu límite ahora es de ${plan.maxInstancias} instancia(s) y ${plan.storage}.`);
    setTimeout(() => setNotificationMsg(null), 5000);
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8">
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Plan y suscripción</h1>
          <p className="text-sm text-gray-500 mt-1">Administra tu plan activo, cambia tu suscripción y consulta tus recursos contratados.</p>
        </div>
        <button
          onClick={() => setModalChangeOpen(true)}
          className="bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shrink-0 flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Cambiar de plan
        </button>
      </div>

      {notificationMsg && (
        <div className="mb-6 bg-lime-100 border border-lime-300 text-lime-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-lime-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium">{notificationMsg}</p>
          </div>
          <button onClick={() => setNotificationMsg(null)} className="text-lime-700 hover:text-lime-900 text-lg leading-none">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Active plan card */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900 text-xl">Plan {currentPlan.nombre}</h2>
                  <span className="bg-lime-100 text-lime-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Activo</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Finca Los Pinos · Suscripción AgroCloud</p>
              </div>
            </div>
            <StatusBadge s="Activa" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Precio mensual", value: currentPlan.precio },
              { label: "Ciclo de facturación", value: "Mensual" },
              { label: "Inicio del plan", value: "01 ago 2026" },
              { label: "Próximo cobro", value: "01 oct 2026" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-1">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Resource usage */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">Recursos incluidos y uso actual</p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Almacenamiento</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{storageUsed} <span className="text-gray-400 font-normal">/ {currentPlan.storage}</span></span>
                </div>
                <ProgressBar value={(storageUsed / currentPlan.storageGB) * 100} color="bg-blue-400" />
                <p className="text-[10px] text-gray-400 mt-1.5">{Math.max(0, currentPlan.storageGB - storageUsed)} GB disponibles</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Instancias</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{instUsed} <span className="text-gray-400 font-normal">/ {currentPlan.maxInstancias} permitidas</span></span>
                </div>
                <ProgressBar value={(instUsed / currentPlan.maxInstancias) * 100} color={instUsed >= currentPlan.maxInstancias ? "bg-amber-400" : "bg-lime-400"} />
                {instUsed >= currentPlan.maxInstancias ? (
                  <p className="text-[10px] text-amber-600 mt-1.5">Has alcanzado el límite de instancias de tu plan actual.</p>
                ) : (
                  <p className="text-[10px] text-lime-600 mt-1.5">Puedes crear {currentPlan.maxInstancias - instUsed} instancia(s) más.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Change plan banner action */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-base mb-1">¿Necesitas más recursos?</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Cambia de plan en cualquier momento para obtener más instancias y almacenamiento sin interrumpir tus servicios.
            </p>
            <button
              onClick={() => setModalChangeOpen(true)}
              className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-xs transition-colors shadow-sm"
            >
              Ver planes disponibles
            </button>
          </div>

          {/* Payment method */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <h3 className="font-semibold text-gray-900 text-sm">Método de pago</h3>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-3">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-7 rounded bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-blue-700 leading-none">VISA</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">•••• •••• •••• 4242</p>
                  <p className="text-[10px] text-gray-400">Tarjeta de crédito</p>
                </div>
              </div>
              <div className="space-y-2">
                {[["Titular", "Finca Los Pinos"], ["Vencimiento", "08/28"]].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</span>
                    <span className="text-xs text-gray-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-gray-400 leading-relaxed">El método de pago solo puede modificarse contactando al soporte de AgroCloud.</p>
          </div>

          {/* Auto-renewal notice */}
          <div className="bg-lime-50 border border-lime-200 rounded-2xl p-4 flex gap-3">
            <svg className="w-4 h-4 text-lime-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <p className="text-xs font-semibold text-lime-800 mb-0.5">Renovación automática activa</p>
              <p className="text-[10px] text-lime-700 leading-relaxed">Tu suscripción se renueva automáticamente cada mes con el precio de tu plan activo ({currentPlan.precio}).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Section for Plan Selector */}
      {modalChangeOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) setModalChangeOpen(false); }}>
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setModalChangeOpen(false)} className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>

            <div className="mb-6 text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-gray-900">Selecciona tu nuevo plan</h2>
              <p className="text-xs text-gray-500 mt-1">Elige el plan que mejor se adapte al crecimiento de tus operaciones agrícolas.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {PLANES_DISPONIBLES.map((plan) => {
                const isCurrent = currentPlan.nombre === plan.nombre;
                return (
                  <div
                    key={plan.nombre}
                    className={`border rounded-2xl p-5 flex flex-col justify-between relative transition-all ${
                      isCurrent
                        ? "border-lime-400 ring-2 ring-lime-200 bg-lime-50/20"
                        : plan.popular
                        ? "border-gray-900 shadow-md"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    {plan.popular && !isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Popular
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-gray-900 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        Plan Actual
                      </span>
                    )}

                    <div>
                      <h3 className="font-bold text-gray-900 text-base mb-1">{plan.nombre}</h3>
                      <div className="mb-3">
                        <span className="text-2xl font-black text-gray-900">{plan.precio}</span>
                        <span className="text-[10px] text-gray-400"> / mes</span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1 text-xs">
                        <div className="flex justify-between text-gray-600">
                          <span>Instancias:</span>
                          <span className="font-bold text-gray-900">{plan.instancias}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Almacenamiento:</span>
                          <span className="font-bold text-gray-900">{plan.storage}</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-6">
                        {plan.caracteristicas.map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600">
                            <svg className="w-3.5 h-3.5 text-lime-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isCurrent ? (
                      <button disabled className="w-full py-2 bg-gray-100 text-gray-400 font-semibold rounded-xl text-xs cursor-default">
                        Plan actual
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedPlanForUpgrade(plan)}
                        className={`w-full py-2.5 font-semibold rounded-xl text-xs transition-colors shadow-sm ${
                          plan.precioNum > currentPlan.precioNum
                            ? "bg-lime-400 hover:bg-lime-300 text-gray-900"
                            : "bg-gray-900 hover:bg-gray-800 text-white"
                        }`}
                      >
                        {plan.precioNum > currentPlan.precioNum ? "Actualizar plan" : "Cambiar a este plan"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button onClick={() => setModalChangeOpen(false)} className="px-5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambio de plan */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedPlanForUpgrade(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-lime-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Confirmar cambio de plan</h3>
            <p className="text-xs text-gray-500 mb-4">
              Estás a punto de cambiar tu suscripción del <span className="font-semibold text-gray-800">Plan {currentPlan.nombre}</span> al <span className="font-semibold text-gray-900">Plan {selectedPlanForUpgrade.nombre}</span>.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Nuevo costo mensual:</span>
                <span className="font-bold text-gray-900">{selectedPlanForUpgrade.precio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nuevas instancias permitidas:</span>
                <span className="font-bold text-gray-900">{selectedPlanForUpgrade.maxInstancias}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nuevo almacenamiento total:</span>
                <span className="font-bold text-gray-900">{selectedPlanForUpgrade.storage}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedPlanForUpgrade(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleConfirmPlanChange(selectedPlanForUpgrade)} className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-xs transition-colors shadow-sm">
                Confirmar cambio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
