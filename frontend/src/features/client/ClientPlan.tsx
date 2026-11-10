import { useState, useEffect } from "react";
import { ProgressBar, StatusBadge } from "../../components/ui/index";
import { CLIENT_PLAN } from "../../data/client";
import { getMyActiveSubscription, cancelSubscription, continueSubscription, preparePlanChange, confirmPlanChangePayment } from "../../api/subscriptionsApi";
import { getPlans, cotizarPlan, type ComplementoEnum, type CotizacionPlan } from "../../api/plansApi";
import type { ClientInstance } from "../../types/client";
import type { Subscription } from "../../types/index";

interface PlanAvailable {
  id: string;
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

export function ClientPlan({
  organizationName,
  instancesList = [],
  onPlanChanged,
}: {
  organizationName: string;
  instancesList?: ClientInstance[];
  onPlanChanged?: () => void;
}) {
  const [currentPlan, setCurrentPlan] = useState<PlanAvailable>({ id: "", nombre: "Sin plan", precio: "Q 0.00", precioNum: 0, storage: "10 GB", storageGB: 10, instancias: "1", maxInstancias: 1, caracteristicas: [] });
  const [availablePlans, setAvailablePlans] = useState<PlanAvailable[]>([]);
  const [modalChangeOpen, setModalChangeOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanAvailable | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [cancellingSub, setCancellingSub] = useState(false);
  const [continuingSub, setContinuingSub] = useState(false);
  const [cardData, setCardData] = useState({ numero: "4532 •••• •••• 8821", titular: organizationName, exp: "12/28", cvv: "882" });

  // Estado para el Cotizador Dinámico (Patrón Decorator GoF en vivo)
  const [cotizadorOpen, setCotizadorOpen] = useState(false);
  const [cotizadorPlan, setCotizadorPlan] = useState<PlanAvailable | null>(null);
  const [selectedComplementos, setSelectedComplementos] = useState<ComplementoEnum[]>([]);
  const [cotizacionResult, setCotizacionResult] = useState<CotizacionPlan | null>(null);
  const [loadingCotizacion, setLoadingCotizacion] = useState(false);

  const [floatingToast, setFloatingToast] = useState<{ type: "error" | "warning"; message: string } | null>(null);

  const showFloatingToast = (message: string, type: "error" | "warning" = "error") => {
    setFloatingToast({ type, message });
  };

  useEffect(() => {
    Promise.all([getMyActiveSubscription(), getPlans()]).then(([sub, catalog]) => {
      setSubscription(sub);
      const plans = catalog.map(p => ({
        id: p.id, nombre: p.nombre, precio: `Q ${p.precioMensual.toFixed(2)}`, precioNum: p.precioMensual,
        storage: `${p.almacenamientoGb} GB`, storageGB: p.almacenamientoGb,
        instancias: String(p.instanciasPermitidas), maxInstancias: p.instanciasPermitidas,
        popular: p.popular, caracteristicas: [`Hasta ${p.instanciasPermitidas} instancias PostgreSQL`, `${p.almacenamientoGb} GB de almacenamiento`, p.descripcion],
      }));
      const activePlanIds = new Set(catalog.filter(p => p.activo !== false).map(p => p.id));
      setAvailablePlans(plans.filter(plan => activePlanIds.has(plan.id)));
      if (sub && sub.planId) {
        const found = plans.find((p) => p.id === sub.planId);
        if (found) {
          setCurrentPlan(found);
          CLIENT_PLAN.nombre = found.nombre;
          CLIENT_PLAN.maxInstancias = found.maxInstancias;
          CLIENT_PLAN.totalGB = found.storageGB;
          CLIENT_PLAN.precio = found.precioNum;
          CLIENT_PLAN.estado = "Activa";
        }
      }
    }).catch(() => showFloatingToast("No se pudieron cargar los planes o la suscripción.", "error"));
  }, []);

  const formatGb = (val: number) => {
    const rounded = Number((val || 0).toFixed(4));
    return rounded.toString();
  };

  const storageUsed = instancesList.reduce((acc, inst) => acc + (inst.usadoGB || 0), 0);
  const instUsed = instancesList.length;
  const remainingDays = subscription?.fechaProximoPago
    ? Math.max(0, Math.ceil((new Date(`${subscription.fechaProximoPago}T00:00:00`).getTime() - new Date().getTime()) / 86400000))
    : 0;
  const nextCycleDate = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "long", year: "numeric" }).format(date);
  })();

  const formatDate = (date?: string | null) => date
    ? new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`))
    : "—";

  const handleOpenCotizador = (plan: PlanAvailable) => {
    setCotizadorPlan(plan);
    setSelectedComplementos([]);
    setCotizacionResult(null);
    setCotizadorOpen(true);
    // Cotizar base
    setLoadingCotizacion(true);
    cotizarPlan(plan.id, [])
      .then(res => setCotizacionResult(res))
      .catch(() => showFloatingToast("No se pudo obtener la cotización base.", "warning"))
      .finally(() => setLoadingCotizacion(false));
  };

  const handleToggleComplemento = async (comp: ComplementoEnum) => {
    if (!cotizadorPlan) return;
    const next = selectedComplementos.includes(comp)
      ? selectedComplementos.filter(c => c !== comp)
      : [...selectedComplementos, comp];
    setSelectedComplementos(next);
    setLoadingCotizacion(true);
    try {
      const res = await cotizarPlan(cotizadorPlan.id, next);
      setCotizacionResult(res);
    } catch {
      showFloatingToast("Error al recalcular el plan decorado en el backend.", "warning");
    } finally {
      setLoadingCotizacion(false);
    }
  };

  const handleConfirmCancelSubscription = async () => {
    if (!subscription?.id) return;
    setCancellingSub(true);
    try {
      const res = await cancelSubscription(subscription.id);
      setSubscription(res);
      CLIENT_PLAN.estado = "Activa";
      onPlanChanged?.();
      setModalCancelOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "No se pudo cancelar la suscripción.";
      showFloatingToast(msg, "error");
    } finally {
      setCancellingSub(false);
    }
  };

  const handleContinueSubscription = async () => {
    if (!subscription?.id) return;
    setContinuingSub(true);
    try {
      const res = await continueSubscription(subscription.id);
      setSubscription(res);
      onPlanChanged?.();
    } catch (err: any) {
      showFloatingToast(err?.response?.data?.message || "No se pudo retirar la cancelación programada.", "error");
    } finally {
      setContinuingSub(false);
    }
  };

  const handleConfirmPlanChange = async (plan: PlanAvailable) => {
    if (!cardData.numero.trim() || !cardData.titular.trim() || !cardData.exp.trim() || !cardData.cvv.trim()) {
      showFloatingToast("Completa todos los datos de la tarjeta simulada para continuar.", "warning");
      return;
    }
    // Validación previa del lado del cliente (KISS / DRY)
    if (instancesList.length > plan.maxInstancias) {
      showFloatingToast(
        `Para cambiar al ${plan.nombre} debes tener como máximo ${plan.maxInstancias} instancia(s). Actualmente tienes ${instancesList.length} activas. Elimina las instancias sobrantes antes de continuar.`,
        "warning"
      );
      return;
    }
    if (storageUsed > plan.storageGB) {
      showFloatingToast(
        `Para cambiar al ${plan.nombre} debes liberar ${(storageUsed - plan.storageGB).toFixed(2)} GB. Actualmente utilizas ${storageUsed.toFixed(2)} GB y el plan permite ${plan.storageGB} GB.`,
        "warning"
      );
      return;
    }

    setLoadingSub(true);
    try {
      const pending = await preparePlanChange(plan.id);
      const saved = await confirmPlanChangePayment(pending.id);
      setSubscription(saved);
      setCurrentPlan(plan);
      CLIENT_PLAN.nombre = plan.nombre;
      CLIENT_PLAN.maxInstancias = plan.maxInstancias;
      CLIENT_PLAN.totalGB = plan.storageGB;
      CLIENT_PLAN.precio = plan.precioNum;
      CLIENT_PLAN.estado = "Activa";
      onPlanChanged?.();
      setSelectedPlanForUpgrade(null);
      setModalChangeOpen(false);
    } catch (err: any) {
      console.error(err);
      const apiMsg = err?.response?.data?.message || err?.message;
      showFloatingToast(apiMsg || "No se pudo cambiar el plan. Revisa la conexión.", "error");
    } finally {
      setLoadingSub(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4 lg:p-8 relative">
      {/* Notificación Flotante / Toast (visible incluso encima de cualquier modal z-[9999]) */}
      {floatingToast && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`rounded-2xl p-4 shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              floatingToast.type === "error"
                ? "bg-red-500/95 text-white border-red-400 shadow-red-500/20"
                : "bg-amber-500/95 text-white border-amber-400 shadow-amber-500/20"
            }`}
            role="alert"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                {floatingToast.type === "error" ? "Error al cambiar plan" : "Instancias excedidas"}
              </p>
              <p className="text-xs font-medium mt-0.5 leading-relaxed">{floatingToast.message}</p>
            </div>
            <button
              onClick={() => setFloatingToast(null)}
              aria-label="Cerrar notificación"
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-sm shrink-0 hover:bg-white/20 text-white/80 hover:text-white"
            ><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>
      )}

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

      {subscription?.cancelacionProgramada && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Cancelación programada</p>
              <p className="text-xs text-amber-800 mt-0.5">Tu plan seguirá activo hasta el {formatDate(subscription.fechaCancelacion)} y no volverá a renovarse.</p>
            </div>
          </div>
          <button
            type="button"
            disabled={continuingSub}
            onClick={handleContinueSubscription}
            className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-60 shrink-0"
          >
            {continuingSub ? "Procesando..." : "Continuar suscripción"}
          </button>
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
                  <span className="bg-lime-100 text-lime-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{subscription ? "Activo" : "Sin suscripción"}</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{organizationName} · Suscripción AgroCloud</p>
              </div>
            </div>
            <StatusBadge s={subscription ? "Activa" : "Inactiva"} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Precio mensual", value: currentPlan.precio },
              { label: "Ciclo de facturación", value: "Mensual" },
              { label: "Inicio del plan", value: subscription?.fechaInicio || "—" },
              { label: "Próximo cobro", value: subscription?.fechaProximoPago || "—" },
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
                  <span className="text-sm font-semibold text-gray-900">{formatGb(storageUsed)} <span className="text-gray-400 font-normal">/ {currentPlan.storage}</span></span>
                </div>
                <ProgressBar value={(storageUsed / currentPlan.storageGB) * 100} color="bg-blue-400" />
                <p className="text-[10px] text-gray-400 mt-1.5">{formatGb(Math.max(0, currentPlan.storageGB - storageUsed))} GB disponibles</p>
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
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setModalChangeOpen(true)}
                className="w-full py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Ver planes disponibles
              </button>
              {currentPlan.id && (
                <button
                  onClick={() => handleOpenCotizador(currentPlan)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-lime-300 border border-lime-400/40 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  title="Demuestra la aplicación de decoradores dinámicos GoF"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Cotizador con Complementos (Decorator)</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xs text-gray-500">
            No hay un método de pago registrado en el sistema.
          </div>

          {subscription && !subscription.cancelacionProgramada && (
            <button
              type="button"
              onClick={() => setModalCancelOpen(true)}
              className="w-full py-2.5 border border-red-200 bg-white hover:bg-red-50 text-red-600 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancelar suscripción
            </button>
          )}
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
              {availablePlans.map((plan) => {
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
                      <div className="flex flex-col gap-2">
                        <button disabled className="w-full py-2 bg-gray-100 text-gray-400 font-semibold rounded-xl text-xs cursor-default">
                          Plan actual
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalChangeOpen(false);
                            handleOpenCotizador(plan);
                          }}
                          className="w-full py-2 bg-lime-50 text-lime-800 border border-lime-300 hover:bg-lime-100 font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Personalizar (Add-ons)</span>
                          <span className="text-[10px] bg-lime-200 px-1.5 py-0.2 rounded font-mono">GoF</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            if (instancesList.length > plan.maxInstancias || storageUsed > plan.storageGB) {
                              showFloatingToast(
                                instancesList.length > plan.maxInstancias
                                  ? `No puedes cambiar al ${plan.nombre}: debes eliminar ${instancesList.length - plan.maxInstancias} instancia(s) antes de continuar.`
                                  : `No puedes cambiar al ${plan.nombre}: debes liberar ${(storageUsed - plan.storageGB).toFixed(2)} GB antes de continuar.`,
                                "warning"
                              );
                              return;
                            }
                            setSelectedPlanForUpgrade(plan);
                          }}
                          className={`w-full py-2.5 font-semibold rounded-xl text-xs transition-colors shadow-sm ${
                            instancesList.length > plan.maxInstancias || storageUsed > plan.storageGB
                              ? "bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200"
                              : plan.precioNum > currentPlan.precioNum
                              ? "bg-lime-400 hover:bg-lime-300 text-gray-900"
                              : "bg-gray-900 hover:bg-gray-800 text-white"
                          }`}
                        >
                          {instancesList.length > plan.maxInstancias
                            ? `Excede instancias (${instancesList.length}/${plan.maxInstancias})`
                            : storageUsed > plan.storageGB
                            ? `Excede almacenamiento (${formatGb(storageUsed)}/${plan.storageGB} GB)`
                            : plan.precioNum > currentPlan.precioNum
                            ? "Actualizar plan"
                            : "Cambiar a este plan"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setModalChangeOpen(false);
                            handleOpenCotizador(plan);
                          }}
                          className="w-full py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Simular con Decorator</span>
                          <span>→</span>
                        </button>
                      </div>
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

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-900 leading-relaxed">
              Tu plan actual tiene <strong>{remainingDays} día(s) restantes</strong> y está cubierto hasta el <strong>{formatDate(subscription?.fechaProximoPago)}</strong>. Al pagar, el nuevo plan se activará de inmediato, estos días se perderán y tu próxima renovación será el <strong>{nextCycleDate}</strong>.
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Tarjeta de crédito / débito</span>
                <span className="text-[10px] font-bold text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">Simulación</span>
              </div>
              <input
                aria-label="Número de tarjeta"
                value={cardData.numero}
                onChange={e => setCardData({ ...cardData, numero: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
                placeholder="Número de tarjeta"
              />
              <input
                aria-label="Nombre del titular"
                value={cardData.titular}
                onChange={e => setCardData({ ...cardData, titular: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
                placeholder="Nombre del titular"
              />
              <div className="grid grid-cols-2 gap-2">
                <input aria-label="Vencimiento" value={cardData.exp} onChange={e => setCardData({ ...cardData, exp: e.target.value })} className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200" placeholder="MM/AA" />
                <input aria-label="CVV" value={cardData.cvv} onChange={e => setCardData({ ...cardData, cvv: e.target.value })} className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200" placeholder="CVV" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setSelectedPlanForUpgrade(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                disabled={loadingSub}
                onClick={() => handleConfirmPlanChange(selectedPlanForUpgrade)}
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                {loadingSub ? "Procesando pago..." : `Pagar ${selectedPlanForUpgrade.precio} y cambiar`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Cotizador Interactivo de Decorator (GoF) */}
      {cotizadorOpen && cotizadorPlan && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setCotizadorOpen(false); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto border border-gray-100">
            <button
              onClick={() => setCotizadorOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-lime-900 bg-lime-300 px-2.5 py-0.5 rounded-full">
                Patrón GoF Decorator
              </span>
              <span className="text-xs text-gray-400">Spring Boot Backend API: /planes/{cotizadorPlan.id}/cotizar</span>
            </div>

            <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Personalizador de Plan: <span className="text-emerald-700">{cotizadorPlan.nombre}</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              Demostración visual del patrón de diseño <strong>Decorator</strong>. Cada complemento añade responsabilidades y costos de forma dinámica en el backend sin modificar la clase base del plan.
            </p>

            {/* Comparativa Visual: Base vs Decorado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Plan Base */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Plan Base (Wrappee)</span>
                <h4 className="font-bold text-gray-800 text-base mt-0.5">{cotizadorPlan.nombre}</h4>
                <div className="mt-2 text-2xl font-black text-gray-900">{cotizadorPlan.precio} <span className="text-xs font-normal text-gray-400">/ mes</span></div>
                <div className="mt-3 text-xs text-gray-600 space-y-1">
                  <div>💾 Almacenamiento base: <strong>{cotizadorPlan.storage}</strong></div>
                  <div>🗄️ Instancias permitidas: <strong>{cotizadorPlan.instancias}</strong></div>
                </div>
              </div>

              {/* Plan Decorado Resultante */}
              <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white rounded-2xl p-4 relative overflow-hidden shadow-lg border border-lime-400/40">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-lime-400 uppercase tracking-wider">Plan Decorado (Calculado)</span>
                  {loadingCotizacion && (
                    <span className="text-[10px] bg-lime-400/20 text-lime-300 px-2 py-0.5 rounded-full animate-pulse">
                      Recalculando...
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white text-base mt-0.5">
                  {cotizacionResult ? cotizacionResult.descripcion : cotizadorPlan.nombre}
                </h4>
                <div className="mt-2 text-2xl font-black text-lime-400">
                  Q {cotizacionResult ? cotizacionResult.precioMensual.toFixed(2) : cotizadorPlan.precioNum.toFixed(2)}
                  <span className="text-xs font-normal text-white/50"> / mes</span>
                </div>
                <div className="mt-3 text-xs text-gray-300 space-y-1">
                  <div>💾 Almacenamiento total: <strong className="text-white">{cotizacionResult ? cotizacionResult.almacenamientoGb : cotizadorPlan.storageGB} GB</strong></div>
                  <div>🗄️ Instancias totales: <strong className="text-white">{cotizacionResult ? cotizacionResult.instanciasPermitidas : cotizadorPlan.maxInstancias}</strong></div>
                  {cotizacionResult && cotizacionResult.complementos.length > 0 && (
                    <div className="pt-1 text-[11px] text-lime-300">
                      Capas activas: {cotizacionResult.complementos.join(" + ")}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Selector de Decoradores Concretos */}
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3 flex items-center justify-between">
              <span>Selecciona los decoradores a aplicar:</span>
              <span className="text-gray-400 font-normal">{selectedComplementos.length} seleccionados</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {[
                {
                  code: "ALMACENAMIENTO_EXTRA" as ComplementoEnum,
                  name: "AlmacenamientoExtra (+50 GB)",
                  price: "+Q 40.00/mes",
                  desc: "Añade 50 GB de cuota al esquema sin downtime.",
                  icon: "💾",
                },
                {
                  code: "INSTANCIA_EXTRA" as ComplementoEnum,
                  name: "InstanciaExtra (+1 BD)",
                  price: "+Q 60.00/mes",
                  desc: "Incrementa el cupo para una base de datos PostgreSQL extra.",
                  icon: "🗄️",
                },
                {
                  code: "RESPALDO_DIARIO" as ComplementoEnum,
                  name: "RespaldoDiario (Automático)",
                  price: "+Q 25.00/mes",
                  desc: "Ejecuta snapshots programados cada noche.",
                  icon: "🛡️",
                },
                {
                  code: "SOPORTE_PRIORITARIO" as ComplementoEnum,
                  name: "SoportePrioritario (24/7 SLA)",
                  price: "+Q 35.00/mes",
                  desc: "Atención prioritaria y monitoreo preventivo continuo.",
                  icon: "⚡",
                },
              ].map((item) => {
                const isSelected = selectedComplementos.includes(item.code);
                return (
                  <div
                    key={item.code}
                    onClick={() => handleToggleComplemento(item.code)}
                    className={`border rounded-2xl p-3.5 flex items-start gap-3 cursor-pointer transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-200"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="mt-1 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-900">{item.icon} {item.name}</span>
                        <span className="text-xs font-bold text-emerald-700">{item.price}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-lime-50 border border-lime-200 rounded-xl p-3 text-xs text-emerald-950 mb-6 flex items-start gap-2">
              <span className="text-base">💡</span>
              <p>
                <strong>Explicación para la terna:</strong> Al pulsar cada casilla, React llama a <code className="bg-lime-100 px-1 py-0.5 rounded font-mono text-[11px]">POST /api/v1/planes/{cotizadorPlan.id}/cotizar</code>. En Spring Boot, la clase <code className="bg-lime-100 px-1 py-0.5 rounded font-mono text-[11px]">PlanCotizador</code> envuelve sucesivamente a <code className="bg-lime-100 px-1 py-0.5 rounded font-mono text-[11px]">PlanBase</code> con cada decorador solicitado.
              </p>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCotizadorOpen(false)}
                className="px-5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setCotizadorOpen(false);
                  if (cotizacionResult) {
                    setSelectedPlanForUpgrade({
                      ...cotizadorPlan,
                      precio: `Q ${cotizacionResult.precioMensual.toFixed(2)}`,
                      precioNum: cotizacionResult.precioMensual,
                      storage: `${cotizacionResult.almacenamientoGb} GB`,
                      storageGB: cotizacionResult.almacenamientoGb,
                      instancias: String(cotizacionResult.instanciasPermitidas),
                      maxInstancias: cotizacionResult.instanciasPermitidas,
                    });
                  } else {
                    setSelectedPlanForUpgrade(cotizadorPlan);
                  }
                }}
                className="px-6 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Continuar al pago con esta configuración
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar cancelación de suscripción */}
      {modalCancelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in" onClick={e => { if (e.target === e.currentTarget && !cancellingSub) setModalCancelOpen(false); }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cancelar suscripción</h2>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              ¿Estás seguro de que deseas cancelar tu suscripción al <span className="font-semibold text-gray-900">Plan {currentPlan.nombre}</span>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1 mb-6">
              <p className="font-semibold">Información importante:</p>
              <p>Tu cuenta mantendrá acceso a tus instancias hasta el final del período de facturación actual ({subscription?.fechaProximoPago || "próximo ciclo"}). Después de esa fecha, no se renovará automáticamente.</p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={cancellingSub}
                onClick={() => setModalCancelOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 cursor-pointer"
              >
                Mantener suscripción
              </button>
              <button
                type="button"
                disabled={cancellingSub}
                onClick={handleConfirmCancelSubscription}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {cancellingSub ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Cancelando...</span>
                  </>
                ) : (
                  "Confirmar cancelación"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
