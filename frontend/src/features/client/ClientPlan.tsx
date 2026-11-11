import { useState, useEffect } from "react";
import { ProgressBar, StatusBadge } from "../../components/ui/index";
import { CLIENT_PLAN } from "../../data/client";
import {
  getMyActiveSubscription,
  cancelSubscription,
  continueSubscription,
  preparePlanChange,
  confirmPlanChangePayment,
  updateSubscriptionAddons,
} from "../../api/subscriptionsApi";
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

const getAddonDisplayInfo = (addon: string) => {
  switch (addon) {
    case "EXTRA_INSTANCE":
    case "INSTANCIA_EXTRA":
      return {
        nombre: "1 Instancia PostgreSQL adicional",
        descripcion: "Suma +1 base de datos independiente",
        precioNum: 60,
        precio: "Q 60.00 / mes",
        tag: "BD Extra",
      };
    case "EXTRA_STORAGE":
    case "ALMACENAMIENTO_EXTRA":
      return {
        nombre: "50 GB Almacenamiento extra",
        descripcion: "Espacio en disco SSD para tus esquemas",
        precioNum: 40,
        precio: "Q 40.00 / mes",
        tag: "Almacenamiento",
      };
    case "DAILY_BACKUP":
    case "RESPALDO_DIARIO":
      return {
        nombre: "Respaldo diario automatizado",
        descripcion: "Copias automáticas en la nube",
        precioNum: 35,
        precio: "Q 35.00 / mes",
        tag: "Seguridad",
      };
    case "PRIORITY_SUPPORT":
    case "SOPORTE_PRIORITARIO":
      return {
        nombre: "Soporte técnico prioritario 24/7",
        descripcion: "Atención técnica especializada con SLA",
        precioNum: 50,
        precio: "Q 50.00 / mes",
        tag: "Soporte",
      };
    default:
      return {
        nombre: addon,
        descripcion: "Complemento contratado",
        precioNum: 0,
        precio: "Incluido",
        tag: "Extra",
      };
  }
};

const countExtraInstances = (addons?: string[]): number => {
  if (!addons) return 0;
  return addons.filter((a) => a === "EXTRA_INSTANCE" || a === "INSTANCIA_EXTRA").length;
};

export function ClientPlan({
  organizationName,
  instancesList = [],
  onPlanChanged,
}: {
  organizationName: string;
  instancesList?: ClientInstance[];
  onPlanChanged?: () => void;
}) {
  const [currentPlan, setCurrentPlan] = useState<PlanAvailable>({
    id: "",
    nombre: "Sin plan",
    precio: "Q 0.00",
    precioNum: 0,
    storage: "10 GB",
    storageGB: 10,
    instancias: "1",
    maxInstancias: 1,
    caracteristicas: [],
  });
  const [availablePlans, setAvailablePlans] = useState<PlanAvailable[]>([]);
  const [modalChangeOpen, setModalChangeOpen] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<PlanAvailable | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [modalCancelOpen, setModalCancelOpen] = useState(false);
  const [cancellingSub, setCancellingSub] = useState(false);
  const [continuingSub, setContinuingSub] = useState(false);
  const [cardData, setCardData] = useState({
    numero: "4532 •••• •••• 8821",
    titular: organizationName,
    exp: "12/28",
    cvv: "882",
  });

  // Estado para el Cotizador Dinámico (Patrón Decorator GoF en vivo)
  const [cotizadorOpen, setCotizadorOpen] = useState(false);
  const [cotizadorPlan, setCotizadorPlan] = useState<PlanAvailable | null>(null);
  const [selectedComplementos, setSelectedComplementos] = useState<ComplementoEnum[]>([]);
  const [cotizacionResult, setCotizacionResult] = useState<CotizacionPlan | null>(null);
  const [loadingCotizacion, setLoadingCotizacion] = useState(false);

  // Estados de cambio de plan y addons
  const [selectedAddonsForUpgrade, setSelectedAddonsForUpgrade] = useState<ComplementoEnum[]>([]);
  const [differentialAmount, setDifferentialAmount] = useState<number>(0);
  const [isSamePlanAddonUpgrade, setIsSamePlanAddonUpgrade] = useState<boolean>(false);
  const [keepExistingAddonsInUpgrade, setKeepExistingAddonsInUpgrade] = useState<boolean>(false);

  // Modal para eliminar un complemento activo
  const [addonToRemove, setAddonToRemove] = useState<string | null>(null);
  const [modalRemoveAddonOpen, setModalRemoveAddonOpen] = useState<boolean>(false);
  const [removingAddon, setRemovingAddon] = useState<boolean>(false);

  const [floatingToast, setFloatingToast] = useState<{ type: "error" | "warning"; message: string } | null>(null);

  const showFloatingToast = (message: string, type: "error" | "warning" = "error") => {
    setFloatingToast({ type, message });
  };

  const loadSubscriptionAndPlans = () => {
    Promise.all([getMyActiveSubscription(), getPlans()])
      .then(([sub, catalog]) => {
        setSubscription(sub);
        const plans = catalog.map((p) => ({
          id: p.id,
          nombre: p.nombre,
          precio: `Q ${p.precioMensual.toFixed(2)}`,
          precioNum: p.precioMensual,
          storage: `${p.almacenamientoGb} GB`,
          storageGB: p.almacenamientoGb,
          instancias: String(p.instanciasPermitidas),
          maxInstancias: p.instanciasPermitidas,
          popular: p.popular,
          caracteristicas: [
            `Hasta ${p.instanciasPermitidas} instancias PostgreSQL`,
            `${p.almacenamientoGb} GB de almacenamiento`,
            p.descripcion,
          ],
        }));
        const activePlanIds = new Set(catalog.filter((p) => p.activo !== false).map((p) => p.id));
        setAvailablePlans(plans.filter((plan) => activePlanIds.has(plan.id)));
        if (sub && sub.planId) {
          const found = plans.find((p) => p.id === sub.planId);
          if (found) {
            const effectiveMaxInst = sub.maxInstancias ?? found.maxInstancias;
            const effectiveStorage = sub.almacenamientoGb ?? found.storageGB;
            const effectivePrice = Number(sub.monto || found.precioNum);

            const updatedPlan = {
              ...found,
              maxInstancias: effectiveMaxInst,
              storageGB: effectiveStorage,
              storage: `${effectiveStorage} GB`,
              precio: `Q ${effectivePrice.toFixed(2)}`,
              precioNum: effectivePrice,
            };
            setCurrentPlan(updatedPlan);
            CLIENT_PLAN.nombre = found.nombre;
            CLIENT_PLAN.maxInstancias = effectiveMaxInst;
            CLIENT_PLAN.totalGB = effectiveStorage;
            CLIENT_PLAN.precio = effectivePrice;
            CLIENT_PLAN.estado = "Activa";
            CLIENT_PLAN.complementos = sub.complementos || [];
          }
        }
      })
      .catch(() => showFloatingToast("No se pudieron cargar los planes o la suscripción.", "error"));
  };

  useEffect(() => {
    loadSubscriptionAndPlans();
    window.addEventListener("agrocloud:plan-updated", loadSubscriptionAndPlans);
    return () => {
      window.removeEventListener("agrocloud:plan-updated", loadSubscriptionAndPlans);
    };
  }, []);

  const formatGb = (val: number) => {
    const rounded = Number((val || 0).toFixed(4));
    return rounded.toString();
  };

  const storageUsed = instancesList.reduce((acc, inst) => acc + (inst.usadoGB || 0), 0);
  const instUsed = instancesList.length;
  const remainingDays = subscription?.fechaProximoPago
    ? Math.max(
        0,
        Math.ceil((new Date(`${subscription.fechaProximoPago}T00:00:00`).getTime() - new Date().getTime()) / 86400000)
      )
    : 0;
  const nextCycleDate = (() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "long", year: "numeric" }).format(date);
  })();

  const formatDate = (date?: string | null) =>
    date
      ? new Intl.DateTimeFormat("es-GT", { day: "numeric", month: "long", year: "numeric" }).format(
          new Date(`${date}T00:00:00`)
        )
      : "—";

  const handleOpenCotizador = (plan: PlanAvailable) => {
    setCotizadorPlan(plan);
    const initialAddons = (subscription?.complementos || []) as ComplementoEnum[];
    setSelectedComplementos(initialAddons);
    setCotizacionResult(null);
    setCotizadorOpen(true);

    setLoadingCotizacion(true);
    cotizarPlan(plan.id, initialAddons)
      .then((res) => setCotizacionResult(res))
      .catch(() => showFloatingToast("No se pudo obtener la cotización base.", "warning"))
      .finally(() => setLoadingCotizacion(false));
  };

  const handleToggleComplemento = async (comp: ComplementoEnum) => {
    if (!cotizadorPlan) return;
    const next = selectedComplementos.includes(comp)
      ? selectedComplementos.filter((c) => c !== comp)
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

  const handleSelectPlanForUpgrade = (plan: PlanAvailable) => {
    setModalChangeOpen(false);
    setIsSamePlanAddonUpgrade(false);
    setKeepExistingAddonsInUpgrade(false);
    setSelectedAddonsForUpgrade([]);
    setDifferentialAmount(0);
    setSelectedPlanForUpgrade(plan);
  };

  const handleToggleKeepAddons = async (keep: boolean) => {
    setKeepExistingAddonsInUpgrade(keep);
    if (!selectedPlanForUpgrade) return;
    if (keep) {
      const addonsToKeep = (subscription?.complementos || []) as ComplementoEnum[];
      setSelectedAddonsForUpgrade(addonsToKeep);
      setLoadingCotizacion(true);
      try {
        const cot = await cotizarPlan(selectedPlanForUpgrade.id, addonsToKeep);
        setSelectedPlanForUpgrade((prev) =>
          prev
            ? {
                ...prev,
                precio: `Q ${cot.precioMensual.toFixed(2)}`,
                precioNum: cot.precioMensual,
                storage: `${cot.almacenamientoGb} GB`,
                storageGB: cot.almacenamientoGb,
                instancias: String(cot.instanciasPermitidas),
                maxInstancias: cot.instanciasPermitidas,
              }
            : prev
        );
      } catch {
        showFloatingToast("No se pudo cotizar el nuevo plan con complementos.", "warning");
      } finally {
        setLoadingCotizacion(false);
      }
    } else {
      setSelectedAddonsForUpgrade([]);
      const basePlan = availablePlans.find((p) => p.id === selectedPlanForUpgrade.id);
      if (basePlan) {
        setSelectedPlanForUpgrade(basePlan);
      }
    }
  };

  const handleRequestRemoveAddon = (addon: string) => {
    setAddonToRemove(addon);
    setModalRemoveAddonOpen(true);
  };

  const handleConfirmRemoveAddon = async () => {
    if (!addonToRemove || !subscription) return;
    const currentAddons = subscription.complementos || [];
    const isInstanceAddon = addonToRemove === "EXTRA_INSTANCE" || addonToRemove === "INSTANCIA_EXTRA";
    const newMaxInst = isInstanceAddon
      ? Math.max(1, (currentPlan.maxInstancias || 1) - 1)
      : currentPlan.maxInstancias;

    if (isInstanceAddon && instancesList.length > newMaxInst) {
      showFloatingToast(
        `No puedes eliminar este complemento: tienes ${instancesList.length} instancias activas creadas y el nuevo límite será de ${newMaxInst}. Debes eliminar al menos 1 instancia en el módulo de Instancias primero.`,
        "warning"
      );
      return;
    }

    setRemovingAddon(true);
    try {
      const nextAddons = currentAddons.filter((a) => a !== addonToRemove);
      const updated = await updateSubscriptionAddons(nextAddons);
      setSubscription(updated);

      const found = availablePlans.find((p) => p.id === updated.planId) || currentPlan;
      const effectiveMaxInst = updated.maxInstancias ?? found.maxInstancias;
      const effectiveStorage = updated.almacenamientoGb ?? found.storageGB;
      const effectivePrice = Number(updated.monto || found.precioNum);

      const updatedPlan = {
        ...found,
        maxInstancias: effectiveMaxInst,
        storageGB: effectiveStorage,
        storage: `${effectiveStorage} GB`,
        precio: `Q ${effectivePrice.toFixed(2)}`,
        precioNum: effectivePrice,
      };
      setCurrentPlan(updatedPlan);
      CLIENT_PLAN.nombre = found.nombre;
      CLIENT_PLAN.maxInstancias = effectiveMaxInst;
      CLIENT_PLAN.totalGB = effectiveStorage;
      CLIENT_PLAN.precio = effectivePrice;
      CLIENT_PLAN.estado = "Activa";
      CLIENT_PLAN.complementos = updated.complementos || [];

      window.dispatchEvent(new CustomEvent("agrocloud:plan-updated"));
      window.dispatchEvent(new CustomEvent("agrocloud:instances-updated"));
      onPlanChanged?.();

      setModalRemoveAddonOpen(false);
      setAddonToRemove(null);
      showFloatingToast("Complemento eliminado exitosamente. Tu cuota mensual ha sido actualizada.", "warning");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "No se pudo eliminar el complemento.";
      showFloatingToast(msg, "error");
    } finally {
      setRemovingAddon(false);
    }
  };

  const handleConfirmPlanChange = async (plan: PlanAvailable) => {
    if (!cardData.numero.trim() || !cardData.titular.trim() || !cardData.exp.trim() || !cardData.cvv.trim()) {
      showFloatingToast("Completa todos los datos de la tarjeta simulada para continuar.", "warning");
      return;
    }

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
      const pending = await preparePlanChange(
        plan.id,
        selectedAddonsForUpgrade.length > 0 ? selectedAddonsForUpgrade : undefined
      );
      const saved = await confirmPlanChangePayment(pending.id);
      setSubscription(saved);

      const effectiveMaxInst = saved.maxInstancias ?? plan.maxInstancias;
      const effectiveStorage = saved.almacenamientoGb ?? plan.storageGB;
      const effectivePrice = Number(saved.monto || plan.precioNum);

      const updatedPlan = {
        ...plan,
        maxInstancias: effectiveMaxInst,
        storageGB: effectiveStorage,
        storage: `${effectiveStorage} GB`,
        precio: `Q ${effectivePrice.toFixed(2)}`,
        precioNum: effectivePrice,
      };
      setCurrentPlan(updatedPlan);
      CLIENT_PLAN.nombre = plan.nombre;
      CLIENT_PLAN.maxInstancias = effectiveMaxInst;
      CLIENT_PLAN.totalGB = effectiveStorage;
      CLIENT_PLAN.precio = effectivePrice;
      CLIENT_PLAN.estado = "Activa";
      CLIENT_PLAN.complementos = saved.complementos || [];

      window.dispatchEvent(new CustomEvent("agrocloud:plan-updated"));
      window.dispatchEvent(new CustomEvent("agrocloud:instances-updated"));
      onPlanChanged?.();

      setSelectedPlanForUpgrade(null);
      setSelectedAddonsForUpgrade([]);
      setIsSamePlanAddonUpgrade(false);
      setDifferentialAmount(0);
      setModalChangeOpen(false);
      showFloatingToast("Plan y complementos actualizados exitosamente.", "warning");
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
      {/* Notificación Flotante / Toast */}
      {floatingToast && (
        <div className="fixed top-6 right-6 z-[9999] max-w-md w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`rounded-2xl p-4 shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              floatingToast.type === "error"
                ? "bg-red-500/95 text-white border-red-400 shadow-red-500/20"
                : "bg-emerald-600/95 text-white border-emerald-400 shadow-emerald-600/20"
            }`}
            role="alert"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-white/20">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold uppercase tracking-wider opacity-90">
                {floatingToast.type === "error" ? "Aviso del sistema" : "Información"}
              </p>
              <p className="text-xs font-medium mt-0.5 leading-relaxed">{floatingToast.message}</p>
            </div>
            <button
              onClick={() => setFloatingToast(null)}
              aria-label="Cerrar notificación"
              className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-sm shrink-0 hover:bg-white/20 text-white/80 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Plan y suscripción</h1>
          <p className="text-xs text-gray-500 mt-1">
            Administra tu capacidad computacional, complementos contratados y límites de instancias.
          </p>
        </div>
        {subscription && !subscription.cancelacionProgramada && (
          <button
            type="button"
            onClick={() => setModalCancelOpen(true)}
            className="text-xs text-gray-400 hover:text-red-600 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 cursor-pointer"
          >
            Cancelar suscripción
          </button>
        )}
      </div>

      {/* Banner de cancelación programada */}
      {subscription && subscription.cancelacionProgramada && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">Cancelación programada</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Tu plan seguirá activo hasta el {formatDate(subscription.fechaCancelacion)} y no volverá a renovarse.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={continuingSub}
            onClick={handleContinueSubscription}
            className="px-4 py-2.5 rounded-xl bg-white border border-amber-300 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors disabled:opacity-60 shrink-0 cursor-pointer"
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-gray-900 text-xl">Plan {currentPlan.nombre}</h2>
                  <span className="bg-lime-100 text-lime-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {subscription ? "Activo" : "Sin suscripción"}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{organizationName} · Suscripción AgroCloud</p>
              </div>
            </div>
            <StatusBadge s={subscription ? "Activa" : "Inactiva"} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Cuota mensual", value: currentPlan.precio },
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
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Recursos incluidos y uso actual
            </p>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Almacenamiento total</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatGb(storageUsed)} <span className="text-gray-400 font-normal">/ {currentPlan.storage}</span>
                  </span>
                </div>
                <ProgressBar value={(storageUsed / currentPlan.storageGB) * 100} color="bg-blue-400" />
                <p className="text-[10px] text-gray-400 mt-1.5">
                  {formatGb(Math.max(0, currentPlan.storageGB - storageUsed))} GB disponibles
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-lime-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Instancias de bases de datos</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {instUsed} <span className="text-gray-400 font-normal">/ {currentPlan.maxInstancias} permitidas</span>
                  </span>
                </div>
                <ProgressBar
                  value={(instUsed / currentPlan.maxInstancias) * 100}
                  color={instUsed >= currentPlan.maxInstancias ? "bg-amber-400" : "bg-lime-400"}
                />
                {instUsed >= currentPlan.maxInstancias ? (
                  <p className="text-[10px] text-amber-600 mt-1.5">
                    Has alcanzado el límite de instancias permitidas por tu suscripción activa ({currentPlan.maxInstancias}).
                  </p>
                ) : (
                  <p className="text-[10px] text-lime-600 mt-1.5">
                    Puedes crear {currentPlan.maxInstancias - instUsed} instancia(s) más.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Complementos activos (Tus Extras Contratados) */}
          {subscription?.complementos && subscription.complementos.length > 0 && (
            <div className="border-t border-gray-100 pt-5 mt-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
                    Complementos activos (Extras contratados)
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Puedes gestionar o dar de baja estos extras en cualquier momento para dejar de pagarlos.
                  </p>
                </div>
                <span className="text-[10px] text-lime-800 bg-lime-100 font-bold px-2.5 py-0.5 rounded-full border border-lime-200">
                  {subscription.complementos.length} extra(s)
                </span>
              </div>
              <div className="space-y-2.5">
                {subscription.complementos.map((addon) => {
                  const info = getAddonDisplayInfo(addon);
                  return (
                    <div
                      key={addon}
                      className="flex items-center justify-between bg-lime-50/50 border border-lime-100 rounded-xl p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-lime-100 text-lime-800 flex items-center justify-center font-bold text-[10px] shrink-0 border border-lime-200">
                          {info.tag}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900">{info.nombre}</p>
                          <p className="text-[11px] text-gray-500">
                            {info.descripcion} · <span className="font-semibold text-lime-800">{info.precio}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRequestRemoveAddon(addon)}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        title="Dejar de pagar este complemento para el próximo mes"
                      >
                        Eliminar extra
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* Change plan banner action */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-md">
            <h3 className="font-semibold text-base mb-1">¿Necesitas más recursos?</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Cambia de plan o agrega complementos extras en cualquier momento para obtener más instancias y almacenamiento.
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
                  title="Configura complementos extras sobre tu plan actual"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                  <span>Personalizar Extras (Decorator)</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-lime-100 text-lime-800 flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-900">Facturación Transparente</p>
            </div>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Si compras instancias o almacenamiento adicional en tu plan actual, solo pagas la diferencia proporcional por el resto del ciclo. Al cambiar de plan, decides si deseas conservar tus extras o eliminarlos.
            </p>
          </div>
        </div>
      </div>

      {/* Modal / Section for Plan Selector */}
      {modalChangeOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalChangeOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalChangeOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
            >
              ×
            </button>

            <div className="mb-6 text-center max-w-lg mx-auto">
              <h2 className="text-xl font-bold text-gray-900">Selecciona tu nuevo plan</h2>
              <p className="text-xs text-gray-500 mt-1">
                Elige el plan que mejor se adapte al crecimiento de tus operaciones agrícolas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {availablePlans.map((plan) => {
                const isCurrent = currentPlan.id === plan.id;
                return (
                  <div
                    key={plan.id}
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
                            handleSelectPlanForUpgrade(plan);
                          }}
                          className={`w-full py-2.5 font-semibold rounded-xl text-xs transition-colors shadow-sm cursor-pointer ${
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
              <button
                onClick={() => setModalChangeOpen(false)}
                className="px-5 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 hover:bg-gray-50 font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cambio de plan o cobro diferencial */}
      {selectedPlanForUpgrade && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedPlanForUpgrade(null);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
            <div className="w-10 h-10 rounded-full bg-lime-100 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-lime-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {isSamePlanAddonUpgrade ? "Confirmar adquisición de complementos" : "Confirmar cambio de plan"}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {isSamePlanAddonUpgrade ? (
                <>
                  Estás agregando complementos a tu suscripción activa del{" "}
                  <span className="font-semibold text-gray-900">Plan {currentPlan.nombre}</span>.
                </>
              ) : (
                <>
                  Estás a punto de cambiar tu suscripción del{" "}
                  <span className="font-semibold text-gray-800">Plan {currentPlan.nombre}</span> al{" "}
                  <span className="font-semibold text-gray-900">Plan {selectedPlanForUpgrade.nombre}</span>.
                </>
              )}
            </p>

            {/* Banner y pregunta si el usuario ya tenía extras y está cambiando de plan */}
            {!isSamePlanAddonUpgrade && subscription?.complementos && subscription.complementos.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-xs text-blue-900 space-y-3">
                <div className="flex items-center gap-2 font-bold text-blue-800">
                  <svg className="w-4 h-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Complementos extras detectados en tu cuenta</span>
                </div>
                <p className="leading-relaxed">
                  Actualmente tienes contratado:{" "}
                  <strong>{subscription.complementos.map((a) => getAddonDisplayInfo(a).nombre).join(", ")}</strong>.
                  Al subir al <strong>Plan {selectedPlanForUpgrade.nombre}</strong>, este nuevo plan ya incluye{" "}
                  <strong>{availablePlans.find((p) => p.id === selectedPlanForUpgrade.id)?.maxInstancias || selectedPlanForUpgrade.maxInstancias} instancias base</strong>{" "}
                  (más capacidad de la que tenías inicialmente).
                </p>
                <div className="pt-2 border-t border-blue-200/70">
                  <p className="font-bold text-gray-900 mb-2">
                    ¿Deseas seguir pagando los extras o eliminarlos en tu nuevo plan?
                  </p>
                  <div className="space-y-2">
                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${!keepExistingAddonsInUpgrade ? "bg-white border-blue-400 shadow-xs" : "bg-blue-100/30 border-blue-200"}`}>
                      <input
                        type="radio"
                        name="keepAddons"
                        checked={!keepExistingAddonsInUpgrade}
                        onChange={() => handleToggleKeepAddons(false)}
                        className="mt-0.5 text-lime-600 focus:ring-lime-500"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900">Eliminar complementos extras (Recomendado)</p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                          Aprovecha las instancias base del nuevo plan sin pagar ningún recargo adicional.
                        </p>
                      </div>
                    </label>

                    <label className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${keepExistingAddonsInUpgrade ? "bg-white border-blue-400 shadow-xs" : "bg-blue-100/30 border-blue-200"}`}>
                      <input
                        type="radio"
                        name="keepAddons"
                        checked={keepExistingAddonsInUpgrade}
                        onChange={() => handleToggleKeepAddons(true)}
                        className="mt-0.5 text-lime-600 focus:ring-lime-500"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-gray-900">Conservar complementos extras</p>
                        <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                          Mantén tus complementos extras (+{countExtraInstances(subscription?.complementos)} instancias adicionales) sumados a la capacidad del nuevo plan.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-xs">
              {isSamePlanAddonUpgrade ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Costo mensual base:</span>
                    <span className="font-medium text-gray-700">{currentPlan.precio}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded">
                    <span>Monto a pagar hoy (Diferencia de extras):</span>
                    <span>Q {differentialAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nuevo canon a partir del próximo ciclo:</span>
                    <span className="font-bold text-gray-900">{selectedPlanForUpgrade.precio} / mes</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-500">Nuevo costo mensual:</span>
                  <span className="font-bold text-gray-900">{selectedPlanForUpgrade.precio}</span>
                </div>
              )}
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
              {isSamePlanAddonUpgrade ? (
                <>
                  Solo pagas hoy la diferencia de los complementos solicitados (<strong>Q {differentialAmount.toFixed(2)}</strong>). Tu ciclo se mantiene y tu próxima cuota mensual se actualizará a <strong>{selectedPlanForUpgrade.precio}</strong> el <strong>{formatDate(subscription?.fechaProximoPago)}</strong>.
                </>
              ) : (
                <>
                  Tu plan actual tiene <strong>{remainingDays} día(s) restantes</strong> y está cubierto hasta el <strong>{formatDate(subscription?.fechaProximoPago)}</strong>. Al pagar, el nuevo plan se activará de inmediato y tu próxima renovación será el <strong>{nextCycleDate}</strong>.
                </>
              )}
            </div>

            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">Tarjeta de crédito / débito</span>
                <span className="text-[10px] font-bold text-lime-700 bg-lime-100 px-2 py-0.5 rounded-full">Simulación</span>
              </div>
              <input
                aria-label="Número de tarjeta"
                value={cardData.numero}
                onChange={(e) => setCardData({ ...cardData, numero: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
                placeholder="Número de tarjeta"
              />
              <input
                aria-label="Nombre del titular"
                value={cardData.titular}
                onChange={(e) => setCardData({ ...cardData, titular: e.target.value })}
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
                placeholder="Nombre del titular"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  aria-label="Vencimiento"
                  value={cardData.exp}
                  onChange={(e) => setCardData({ ...cardData, exp: e.target.value })}
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
                  placeholder="MM/AA"
                />
                <input
                  aria-label="CVV"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  className="rounded-xl border border-gray-300 px-3 py-2.5 text-xs focus:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-200"
                  placeholder="CVV"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={loadingSub}
                onClick={() => handleConfirmPlanChange(selectedPlanForUpgrade)}
                className="flex-1 py-2.5 bg-lime-400 hover:bg-lime-300 text-gray-900 font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loadingSub
                  ? "Procesando pago..."
                  : isSamePlanAddonUpgrade
                  ? `Pagar diferencia de Q ${differentialAmount.toFixed(2)} y aplicar`
                  : `Pagar ${selectedPlanForUpgrade.precio} y cambiar`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para eliminar un complemento activo */}
      {modalRemoveAddonOpen && addonToRemove && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !removingAddon) setModalRemoveAddonOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1">Eliminar complemento</h3>
            <p className="text-xs text-gray-500 mb-4">
              ¿Estás seguro de que deseas dar de baja el complemento{" "}
              <span className="font-bold text-gray-900">{getAddonDisplayInfo(addonToRemove).nombre}</span>?
            </p>

            <div className="bg-gray-50 rounded-xl p-3.5 mb-4 text-xs space-y-1.5 border border-gray-200">
              <div className="flex justify-between">
                <span className="text-gray-500">Costo a descontar:</span>
                <span className="font-bold text-red-600">-{getAddonDisplayInfo(addonToRemove).precio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Próxima fecha de cobro:</span>
                <span className="font-medium text-gray-700">{formatDate(subscription?.fechaProximoPago)}</span>
              </div>
            </div>

            {/* Verificación de instancias si es un extra de instancia */}
            {(addonToRemove === "EXTRA_INSTANCE" || addonToRemove === "INSTANCIA_EXTRA") && (
              <div
                className={`rounded-xl p-3 mb-4 text-xs leading-relaxed border ${
                  instancesList.length > Math.max(1, currentPlan.maxInstancias - 1)
                    ? "bg-red-50 text-red-900 border-red-200"
                    : "bg-emerald-50 text-emerald-900 border-emerald-200"
                }`}
              >
                {instancesList.length > Math.max(1, currentPlan.maxInstancias - 1) ? (
                  <>
                    <strong className="block mb-1">Acción requerida antes de eliminar:</strong>
                    Actualmente tienes <strong>{instancesList.length} instancias activas</strong> creadas. Al remover la
                    instancia extra, tu nuevo límite será de{" "}
                    <strong>{Math.max(1, currentPlan.maxInstancias - 1)} instancia(s)</strong>. Para poder eliminar este
                    complemento, debes eliminar al menos 1 base de datos en el módulo de Instancias primero.
                  </>
                ) : (
                  <>
                    Actualmente tienes <strong>{instancesList.length} instancia(s)</strong> creadas, lo cual está dentro
                    del nuevo límite de <strong>{Math.max(1, currentPlan.maxInstancias - 1)} instancia(s)</strong>.
                  </>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                disabled={removingAddon}
                onClick={() => setModalRemoveAddonOpen(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={
                  removingAddon ||
                  ((addonToRemove === "EXTRA_INSTANCE" || addonToRemove === "INSTANCIA_EXTRA") &&
                    instancesList.length > Math.max(1, currentPlan.maxInstancias - 1))
                }
                onClick={handleConfirmRemoveAddon}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {removingAddon ? "Eliminando..." : "Confirmar y dejar de pagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cotizador Interactivo de Decorator GoF */}
      {cotizadorOpen && cotizadorPlan && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setCotizadorOpen(false);
          }}
        >
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl p-6 lg:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setCotizadorOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
            >
              ×
            </button>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Patrón GoF Decorator
              </span>
              <span className="text-xs text-gray-400">Personalización dinámica</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Personalizar Plan: {cotizadorPlan.nombre}
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Selecciona los complementos extras que deseas apilar sobre tu plan base.
            </p>

            {/* Resumen de cotización */}
            <div className="bg-gradient-to-br from-emerald-900 to-gray-900 text-white rounded-2xl p-5 mb-6 shadow-md">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                      Costo mensual consolidado
                    </p>
                    {loadingCotizacion && (
                      <span className="text-[10px] text-lime-300 animate-pulse font-medium">Recalculando...</span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-white">
                      Q {cotizacionResult ? cotizacionResult.precioMensual.toFixed(2) : cotizadorPlan.precioNum.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-300">/ mes</span>
                  </div>
                  {currentPlan.id === cotizadorPlan.id && (
                    <p className="text-xs text-lime-300 font-semibold mt-1">
                      Monto a pagar hoy (Diferencia): Q{" "}
                      {Math.max(
                        0,
                        (cotizacionResult ? cotizacionResult.precioMensual : cotizadorPlan.precioNum) - currentPlan.precioNum
                      ).toFixed(2)}
                    </p>
                  )}
                </div>
                <div className="text-right text-xs space-y-1 text-gray-200">
                  <div>
                    Instancias totales:{" "}
                    <strong className="text-white">
                      {cotizacionResult ? cotizacionResult.instanciasPermitidas : cotizadorPlan.maxInstancias}
                    </strong>
                  </div>
                  <div>
                    Almacenamiento total:{" "}
                    <strong className="text-white">
                      {cotizacionResult ? cotizacionResult.almacenamientoGb : cotizadorPlan.storageGB} GB
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Listado de Add-ons disponibles */}
            <div className="space-y-3 mb-6">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                Complementos Disponibles
              </p>
              {[
                {
                  id: "EXTRA_STORAGE" as ComplementoEnum,
                  name: "Almacenamiento Extra (+50 GB)",
                  price: "+Q 40.00 / mes",
                  desc: "Aumenta la cuota de almacenamiento para tus bases de datos.",
                },
                {
                  id: "EXTRA_INSTANCE" as ComplementoEnum,
                  name: "Instancia Extra (+1 Instancia)",
                  price: "+Q 60.00 / mes",
                  desc: "Permite aprovisionar una base de datos PostgreSQL adicional en tu cuenta.",
                },
                {
                  id: "DAILY_BACKUP" as ComplementoEnum,
                  name: "Respaldo Diario Automatizado",
                  price: "+Q 35.00 / mes",
                  desc: "Copias de seguridad automáticas en la nube para recuperación rápida.",
                },
                {
                  id: "PRIORITY_SUPPORT" as ComplementoEnum,
                  name: "Soporte Técnico Prioritario 24/7",
                  price: "+Q 50.00 / mes",
                  desc: "Atención técnica especializada con SLA de resolución de 2 horas.",
                },
              ].map((item) => {
                const isSelected = selectedComplementos.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleToggleComplemento(item.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300"
                        : "bg-white border-gray-200 hover:border-gray-300"
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
                        <span className="text-xs font-bold text-gray-900">{item.name}</span>
                        <span className="text-xs font-bold text-emerald-700">{item.price}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
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
                  const isSame = currentPlan.id === cotizadorPlan.id;
                  const newTotal = cotizacionResult ? cotizacionResult.precioMensual : cotizadorPlan.precioNum;
                  const diff = Math.max(0, newTotal - currentPlan.precioNum);

                  setIsSamePlanAddonUpgrade(isSame && selectedComplementos.length > 0);
                  setDifferentialAmount(diff);
                  setSelectedAddonsForUpgrade(selectedComplementos);

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
                {currentPlan.id === cotizadorPlan.id && selectedComplementos.length > 0
                  ? `Pagar diferencia (Q ${Math.max(
                      0,
                      (cotizacionResult ? cotizacionResult.precioMensual : cotizadorPlan.precioNum) - currentPlan.precioNum
                    ).toFixed(2)}) y activar`
                  : "Continuar al pago con esta configuración"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: confirmar cancelación de suscripción */}
      {modalCancelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget && !cancellingSub) setModalCancelOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Cancelar suscripción</h2>
            <p className="text-sm text-gray-600 mb-3 leading-relaxed">
              ¿Estás seguro de que deseas cancelar tu suscripción al{" "}
              <span className="font-semibold text-gray-900">Plan {currentPlan.nombre}</span>?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1 mb-6">
              <p className="font-semibold">Información importante:</p>
              <p>
                Tu cuenta mantendrá acceso a tus instancias hasta el final del período de facturación actual (
                {subscription?.fechaProximoPago || "próximo ciclo"}). Después de esa fecha, no se renovará automáticamente.
              </p>
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
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {cancellingSub ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
