import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle2, Database, HardDrive } from "lucide-react";
import { getPlans } from "../../api/plansApi";
import { getMySubscriptions, subscribeToPlan } from "../../api/subscriptionsApi";
import { LogoIcon } from "../../components/ui";
import { SimulatedPayment } from "./SimulatedPayment";
import { ClientPanel } from "../client/ClientPanel";
import type { Plan, User } from "../../types";

interface ClientEntryProps {
  user: User;
  onLogout: () => void;
}

const money = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ" });

export function ClientEntry({ user, onLogout }: ClientEntryProps) {
  const [stage, setStage] = useState<"checking" | "plans" | "payment" | "ready" | "error">("checking");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selected, setSelected] = useState("");
  const [cardData, setCardData] = useState({
    numero: "4532 •••• •••• 8821",
    titular: user.nombre,
    exp: "12/28",
    cvv: "882",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const subscriptions = await getMySubscriptions();
        if (!active) return;
        // Existing customers keep access to billing and subscription management.
        if (subscriptions.length > 0) {
          setStage("ready");
          return;
        }
        const catalog = (await getPlans()).filter(plan => plan.activo !== false);
        if (!active) return;
        if (catalog.length === 0) throw new Error("No hay planes disponibles en este momento. Inténtalo más tarde.");
        setPlans(catalog);
        setSelected((catalog.find(plan => plan.popular) || catalog[0]).id);
        setStage("plans");
      } catch (caught) {
        if (!active) return;
        setError(axios.isAxiosError<{ message?: string }>(caught)
          ? caught.response?.data?.message || "No se pudieron cargar tus planes. Revisa la conexión e inténtalo de nuevo."
          : caught instanceof Error ? caught.message : "No se pudieron cargar tus planes.");
        setStage("error");
      }
    };
    void load();
    return () => { active = false; };
  }, [user.id, attempt]);

  const subscribe = async () => {
    if (!selected || saving || stage !== "payment") return;
    setSaving(true);
    setError("");
    try {
      await subscribeToPlan(selected);
      setStage("ready");
    } catch (caught) {
      setError(axios.isAxiosError<{ message?: string }>(caught)
        ? caught.response?.data?.message || "No se pudo contratar el plan. Inténtalo de nuevo."
        : "No se pudo contratar el plan. Inténtalo de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  if (stage === "ready") return <ClientPanel user={user} onLogout={onLogout} />;

  const selectedPlan = plans.find(plan => plan.id === selected);
  if (stage === "payment" && selectedPlan) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8 font-[Inter,sans-serif]">
      <div className="mb-6 flex items-center gap-2">
        <LogoIcon size={8} />
        <span className="text-xl font-bold text-gray-900">AgroCloud</span>
      </div>
      {error && <p role="alert" className="mb-5 w-full max-w-md rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
      <SimulatedPayment plan={selectedPlan} cardData={cardData} onCardChange={setCardData} saving={saving}
        onBack={() => { setError(""); setStage("plans"); }} onConfirm={subscribe} />
    </div>
  );
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 sm:px-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xl font-bold"><LogoIcon />AgroCloud</div>
        <button type="button" disabled={saving} onClick={onLogout} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50">Cerrar sesión</button>
      </header>
      <main className="mx-auto mt-10 max-w-6xl">
        {stage === "checking" ? <p role="status" className="py-20 text-center text-sm text-gray-500">Preparando tu cuenta...</p> : <>
          <ol aria-label="Pasos del registro" className="mb-8 flex flex-wrap justify-center gap-4 text-sm sm:gap-8">
            <li className="flex items-center gap-2 text-green-800"><CheckCircle2 size={18} aria-hidden="true" />Cuenta creada</li>
            <li className="flex items-center gap-2 text-green-800"><CheckCircle2 size={18} aria-hidden="true" />Correo verificado</li>
            <li aria-current="step" className="font-semibold">3. Selecciona tu plan</li>
            <li className="text-gray-500">4. Pago simulado</li>
          </ol>
          <h1 className="text-center text-3xl font-bold">Selecciona tu plan</h1>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-6 text-gray-500">Tu correo ya está verificado. Elige tu plan y continúa al pago simulado para completar tu registro.</p>
          <p className="mt-2 break-all text-center text-sm font-medium text-green-800">{user.email}</p>
          {error && <p role="alert" className="mx-auto mt-6 max-w-xl rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          {stage === "error" ? <div className="mt-6 text-center">
            <button type="button" onClick={() => { setStage("checking"); setError(""); setAttempt(value => value + 1); }} className="rounded-xl bg-lime-400 px-6 py-3 text-sm font-semibold hover:bg-lime-300">Volver a intentar</button>
          </div> : <>
            <fieldset disabled={saving} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <legend className="sr-only">Planes disponibles</legend>
              {plans.map(plan => <label key={plan.id} className={`flex cursor-pointer flex-col rounded-2xl border-2 bg-white p-5 transition-colors ${selected === plan.id ? "border-lime-500 ring-2 ring-lime-100" : "border-gray-200 hover:border-lime-300"}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-semibold">{plan.nombre}</span>
                  <input type="radio" name="onboarding-plan" value={plan.id} checked={selected === plan.id} onChange={() => setSelected(plan.id)} className="h-4 w-4 accent-lime-600" />
                </div>
                {plan.popular && <span className="mt-2 self-start rounded-full bg-lime-100 px-2 py-1 text-xs font-semibold text-green-800">Recomendado</span>}
                <p className="mt-4 text-2xl font-bold">{money.format(plan.precioMensual)}<span className="text-sm font-normal text-gray-500"> / mes</span></p>
                <p className="mt-3 flex-1 text-sm leading-6 text-gray-500">{plan.descripcion}</p>
                <div className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm text-gray-600">
                  <p className="flex items-center gap-2"><HardDrive size={16} aria-hidden="true" />{plan.almacenamientoGb} GB de almacenamiento</p>
                  <p className="flex items-center gap-2"><Database size={16} aria-hidden="true" />{plan.instanciasPermitidas} {plan.instanciasPermitidas === 1 ? "instancia" : "instancias"}</p>
                </div>
              </label>)}
            </fieldset>
            <div className="mx-auto mt-8 max-w-md text-center">
              <p className="mb-4 text-sm text-gray-600">Plan {selectedPlan?.nombre}: <strong>{selectedPlan ? money.format(selectedPlan.precioMensual) : ""} al mes</strong>.</p>
              <button type="button" disabled={saving || !selectedPlan} onClick={() => { setError(""); setStage("payment"); }} className="w-full rounded-xl bg-lime-400 px-5 py-3 text-sm font-semibold hover:bg-lime-300 disabled:cursor-wait disabled:opacity-60">Continuar al pago simulado</button>
            </div>
          </>}
        </>}
      </main>
    </div>
  );
}
